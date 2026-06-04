import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");

  try {
    const lines = readFileSync(path, "utf8").split(/\r?\n/);

    for (const line of lines) {
      if (!line || line.trim().startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional for CI/builds; runtime validation reports missing keys.
  }
}

async function main() {
  loadEnvLocal();

  const { generateAllForecasts } = await import("@/lib/forecast/generate");
  const summary = await generateAllForecasts();

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown forecast generation error";
  console.error(message);
  process.exit(1);
});
