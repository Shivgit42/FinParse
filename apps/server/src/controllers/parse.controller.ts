import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { logger } from "../utils/logger";
import { extractTextFromUrl } from "../services/ocr.service";
import { labelWithAI } from "../services/aiLabeler.service";
import { db, documents } from "@repo/db";

export const handleParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileUrl, userId } = req.body;
    if (!fileUrl) {
      res.status(400).json({ error: "fileUrl is required" });
      return;
    }

    logger.info(`Starting OCR for ${fileUrl}`);
    const rawText = await extractTextFromUrl(fileUrl);

    logger.info("Running AI labeler");
    const parsedData = await labelWithAI(rawText);

    const [savedDoc] = await db
      .insert(documents)
      .values({
        userId: userId || null,
        fileUrl,
        parsedData,
        status: "DONE",
      })
      .returning();

    if (!savedDoc) {
      throw new Error("Failed to save document");
    }

    logger.info(`Document saved with id: ${savedDoc.id}`);
    return successResponse(res, 200, { document: savedDoc });
  } catch (err) {
    next(err);
  }
};
