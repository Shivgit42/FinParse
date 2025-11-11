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

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
const openRouterKey = process.env.OPENROUTER_API_KEY;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Clerk middleware
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

// API routes
app.use("/api/upload", uploadRouter);
app.use("/api/parse", parseRouter);
app.use("/api/users", userRouter);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
