import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Must be a valid URL when provided"
  });

const optionalString = z.string().trim();

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl.default(""),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString.default("")
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: optionalString.default(""),
  NPS_API_KEY: optionalString.default(""),
  RIDB_API_KEY: optionalString.default(""),
  CRON_SECRET: optionalString.default("")
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NPS_API_KEY: process.env.NPS_API_KEY,
    RIDB_API_KEY: process.env.RIDB_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET
  });
}
