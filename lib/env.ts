import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    {
      message: "Must be a valid URL when provided"
    }
  );

const optionalString = z.string().trim();

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl.default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString.default(""),
  NEXT_PUBLIC_SITE_URL: optionalUrl.default("")
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalString.default(""),
  NPS_API_KEY: optionalString.default(""),
  RIDB_API_KEY: optionalString.default(""),
  CRON_SECRET: optionalString.default("")
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NPS_API_KEY: process.env.NPS_API_KEY,
    RIDB_API_KEY: process.env.RIDB_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET
  });
}

export function getSiteUrl() {
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return siteUrl.replace(/\/$/, "");
}

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ServerEnvKey = keyof ServerEnv;

export function getRequiredServerEnv<
  const TKeys extends readonly ServerEnvKey[]
>(keys: TKeys): Pick<ServerEnv, TKeys[number]> {
  const env = getServerEnv();
  const missing = keys.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  return Object.fromEntries(keys.map((key) => [key, env[key]])) as Pick<
    ServerEnv,
    TKeys[number]
  >;
}

export function getRequiredProductionRuntimeEnv<
  const TKeys extends readonly ServerEnvKey[]
>(keys: TKeys): Pick<ServerEnv, TKeys[number]> {
  if (process.env.NODE_ENV !== "production") {
    return getServerEnv() as Pick<ServerEnv, TKeys[number]>;
  }

  return getRequiredServerEnv(keys);
}
