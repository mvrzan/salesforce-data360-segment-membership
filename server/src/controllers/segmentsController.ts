import type { Request, Response } from "express";
import { logger } from "../utils/loggingUtil.ts";
import { getSegments } from "../services/segmentsService.ts";

const MODULE = "segmentsController";

export const getSegmentsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const segments = await getSegments();

    res.json(segments);
    logger.info(MODULE, `Returned ${segments.segments.length} segments`);
    return;
  } catch (error) {
    logger.error(MODULE, `Error fetching segments: ${error}`);
    res.status(500).json({ error: "Failed to fetch segments" });
    return;
  }
};
