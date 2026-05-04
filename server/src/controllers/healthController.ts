import type { Request, Response } from "express";
import { logger } from "../utils/loggingUtil.ts";

const MODULE = "healthController";

export const getHealthController = (_req: Request, res: Response): void => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
  logger.info(MODULE, "Health check responded OK");
};
