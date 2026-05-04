import { logger } from "../utils/loggingUtil.ts";

export const getRequiredEnvVars = <T extends readonly string[]>(...keys: T): { readonly [K in T[number]]: string } => {
  const missing = keys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error("env.ts", `Missing required environment variables: ${missing.join(", ")}`);

    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return Object.fromEntries(keys.map((key) => [key, process.env[key]!])) as { readonly [K in T[number]]: string };
};
