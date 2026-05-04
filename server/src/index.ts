import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./utils/loggingUtil.ts";
import { getRequiredEnvVars } from "./types/env.ts";
import { requestLoggerMiddleware } from "./middleware/requestLoggerMiddleware.ts";
import healthRouter from "./routes/healthRoutes.ts";
import segmentsRouter from "./routes/segments.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { CORS_ORIGIN } = getRequiredEnvVars("CORS_ORIGIN");
const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(requestLoggerMiddleware);

app.use(healthRouter);
app.use(segmentsRouter);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  logger.info("index", `Server listening on port ${PORT}`);
});
