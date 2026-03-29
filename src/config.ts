import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1),

  // OIDC / JWT validation
  OIDC_ISSUER: z.string().url(),
  OIDC_AUDIENCE: z.string().min(1),

  // CORS
  CORS_ORIGINS: z
    .string()
    .min(1)
    .describe("Comma-separated list of allowed origins"),

  // Key Vault (optional – used when sourcing secrets from Azure)
  AZURE_KEYVAULT_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}

/** Reset cached env (for testing only). */
export function _resetEnv(): void {
  _env = undefined;
}
