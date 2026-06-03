import { z } from "zod";

const errorResponseSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional()
});

export class SourceError extends Error {
  constructor(
    message: string,
    readonly source: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "SourceError";
  }
}

type FetchJsonOptions = {
  headers?: HeadersInit;
  source: string;
  timeoutMs?: number;
};

export async function fetchJson(
  url: string,
  { headers, source, timeoutMs = 10000 }: FetchJsonOptions
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      const parsed = errorResponseSchema.safeParse(JSON.parse(body || "{}"));
      const detail = parsed.success
        ? (parsed.data.message ?? parsed.data.error)
        : undefined;

      throw new SourceError(
        `${source} request failed with ${response.status}${
          detail ? `: ${detail}` : ""
        }`,
        source,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof SourceError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Unknown source request error";

    throw new SourceError(`${source} request failed: ${message}`, source);
  } finally {
    clearTimeout(timeout);
  }
}
