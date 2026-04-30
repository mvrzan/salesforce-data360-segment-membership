import { Router } from "express";
import type { Request, Response } from "express";
import { logger } from "../utils/loggingUtil.ts";
import getSegments from "../services/segmentsService.ts";

const MODULE = "segmentsRoute";

const router = Router();

router.get("/api/v1/segments", async (_req: Request, res: Response) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch (error) {
    logger.error(MODULE, `Error fetching segments: ${error}`);
    res.status(500).json({ error: "Failed to fetch segments" });
  }
});

export default router;
