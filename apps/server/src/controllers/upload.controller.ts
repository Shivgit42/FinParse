import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { logger } from "../utils/logger";
import { successResponse } from "../utils/response";

export const handleUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const buffer = req.file.buffer;
    const originalname = req.file.originalname;

    const fileUrl = await uploadToCloudinary(buffer, originalname);

    logger.info(`Uploaded file to Cloudinary: ${fileUrl}`);

    return successResponse(res, 201, { fileUrl, filename: originalname });
  } catch (err) {
    next(err);
  }
};
