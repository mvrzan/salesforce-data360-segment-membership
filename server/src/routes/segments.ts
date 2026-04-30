import { Router } from "express";
import type { Request, Response } from "express";
import { logger } from "../utils/loggingUtil.ts";
import { getSegments, getSegmentMembers } from "../services/segmentsService.ts";
import { getIndividualsForSegment } from "../services/individualsService.ts";

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

router.get("/api/v1/segments/:segmentApiName/members", async (req: Request, res: Response) => {
  try {
    const segmentApiName = req.params.segmentApiName as string;
    const members = await getSegmentMembers(segmentApiName);
    res.json(members);
  } catch (error) {
    logger.error(MODULE, `Error fetching segment members: ${error}`);
    res.status(500).json({ error: "Failed to fetch segment members" });
  }
});

router.get("/api/v1/segments/:segmentApiName/individuals", async (req: Request, res: Response) => {
  try {
    const segmentApiName = req.params.segmentApiName as string;
    const individuals = await getIndividualsForSegment(segmentApiName);
    res.json(individuals);
  } catch (error) {
    logger.error(MODULE, `Error fetching individuals for segment: ${error}`);
    res.status(500).json({ error: "Failed to fetch segment individuals" });
  }
});

export default router;
