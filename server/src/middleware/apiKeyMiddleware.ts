import type { Request, Response, NextFunction } from "express";
import { getRequiredEnvVars } from "../types/env.ts";
import { logger } from "../utils/loggingUtil.ts";

const MODULE = "apiKeyMiddleware";

const { API_KEY } = getRequiredEnvVars("API_KEY");

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.header("x-api-key");

  if (!providedKey || providedKey !== API_KEY) {
    logger.warn(MODULE, `Unauthorized request to ${req.method} ${req.originalUrl}`);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};
