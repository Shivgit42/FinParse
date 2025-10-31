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

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api/upload", uploadRouter);
app.use("/api/parse", parseRouter);
app.use("/api/users", userRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
