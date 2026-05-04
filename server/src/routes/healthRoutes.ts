import { Router } from "express";
import { getHealthController } from "../controllers/healthController.ts";

const router = Router();

router.get("/api/v1/health", getHealthController);

export default router;
