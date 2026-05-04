import { Router } from "express";
import { apiKeyMiddleware } from "../middleware/apiKeyMiddleware.ts";
import { getSegmentsController } from "../controllers/segmentsController.ts";
import { getIndividualsForSegmentController } from "../controllers/individualsController.ts";

const router = Router();

router.get("/api/v1/segments", apiKeyMiddleware, getSegmentsController);
router.get("/api/v1/segments/:segmentApiName/individuals", apiKeyMiddleware, getIndividualsForSegmentController);

export default router;
