import type { Request, Response } from "express";
import { logger } from "../utils/loggingUtil.ts";
import { getIndividualsForSegment } from "../services/individualsService.ts";

const MODULE = "individualsController";

export const getIndividualsForSegmentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const segmentApiName = req.params.segmentApiName as string;
    const individuals = await getIndividualsForSegment(segmentApiName);

    res.json(individuals);
    logger.info(MODULE, `Returned ${individuals.individuals.length} individuals for segment "${segmentApiName}"`);
    return;
  } catch (error) {
    logger.error(MODULE, `Error fetching individuals for segment: ${error}`);
    res.status(500).json({ error: "Failed to fetch segment individuals" });
    return;
  }
};
