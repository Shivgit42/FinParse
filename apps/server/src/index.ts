import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import uploadRouter from "./routes/upload.route";
import parseRouter from "./routes/parse.route";
import userRouter from "./routes/user.route";
import { logger } from "./utils/logger";
import { errorHandler } from "./utils/errorHandler";

const app = express();

// Startup configuration check
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const openRouterKey = process.env.OPENROUTER_API_KEY;

logger.info("=== Server Configuration ===");
logger.info(
  `Cloudinary configured: ${!!(cloudName && cloudinaryApiKey && cloudinaryApiSecret)}`
);
if (cloudName && cloudinaryApiKey && cloudinaryApiSecret) {
  logger.info(`Cloudinary cloud_name: ${cloudName}`);
  logger.info(`Cloudinary API key: ${cloudinaryApiKey.substring(0, 8)}...`);
} else {
  logger.warn("⚠️  Cloudinary not configured - uploads will fail!");
  logger.warn("   Missing:", {
    CLOUDINARY_CLOUD_NAME: !cloudName,
    CLOUDINARY_API_KEY: !cloudinaryApiKey,
    CLOUDINARY_API_SECRET: !cloudinaryApiSecret,
  });
}
logger.info(`OpenRouter configured: ${!!openRouterKey}`);
if (openRouterKey) {
  logger.info(`OpenRouter API key: ${openRouterKey.substring(0, 8)}...`);
} else {
  logger.warn(
    "⚠️  OpenRouter not configured - AI parsing will return empty structure"
  );
}
logger.info("===========================");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    cloudinary: !!(cloudName && cloudinaryApiKey && cloudinaryApiSecret),
    openrouter: !!openRouterKey,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/upload", uploadRouter);
app.use("/api/parse", parseRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
