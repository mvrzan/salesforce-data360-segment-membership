import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./utils/loggingUtil.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ?? 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// SPA hosting
app.use(express.static(path.join(__dirname, "../public")));

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  logger.info("index", `Server listening on port ${PORT}`);
});
