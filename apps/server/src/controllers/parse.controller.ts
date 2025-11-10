import { Request, Response, NextFunction } from "express";
import { extractTextFromUrl } from "../services/ocr.service";
import { labelWithAI } from "../services/aiLabeler.service";
import { db } from "@repo/db/client";
import { documents, eq } from "@repo/db";
import { successResponse } from "../utils/response";
import { logger } from "../utils/logger";

export const handleParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.body;
    if (!documentId)
      return res.status(400).json({ error: "documentId is required" });

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    logger.info(`Starting OCR for document ${documentId}`);
    const rawText = await extractTextFromUrl(doc.fileUrl);

    logger.info(`Running AI labeling for document ${documentId}`);
    const aiData = await labelWithAI(rawText);

    await db
      .update(documents)
      .set({ parsedData: aiData, status: "PARSED" })
      .where(eq(documents.id, documentId));

    return successResponse(res, 200, { parsedData: aiData });
  } catch (err) {
    next(err);
  }
};
