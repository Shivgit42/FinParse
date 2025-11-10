import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { logger } from "../utils/logger";
import { successResponse } from "../utils/response";
import { db } from "@repo/db/client";
import { documents, eq } from "@repo/db";
import { extractTextFromUrl } from "../services/ocr.service";
import { labelWithAI } from "../services/aiLabeler.service";

export const handleUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get userId from Clerk auth (requireAuth middleware ensures it exists)
    const authUserId = (req as any).auth?.userId as string | undefined;
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const buffer = req.file.buffer;
    const originalname = req.file.originalname;

    // Validate file size (should already be checked by multer, but double-check)
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 10MB limit" });
    }

    let fileUrl: string;
    try {
      logger.info(`[UPLOAD] Starting Cloudinary upload for file: ${originalname}, size: ${buffer.length} bytes`);
      fileUrl = await uploadToCloudinary(buffer, originalname);
      logger.info(`[UPLOAD] Successfully uploaded file to Cloudinary: ${fileUrl}`);
    } catch (cloudinaryErr: any) {
      logger.error("[UPLOAD] Cloudinary upload failed:", {
        message: cloudinaryErr?.message,
        stack: cloudinaryErr?.stack,
        filename: originalname,
        size: buffer.length
      });
      return res.status(500).json({ 
        error: cloudinaryErr.message || "Failed to upload file to storage. Please check your Cloudinary configuration." 
      });
    }

    let doc;
    try {
      const [inserted] = await db
        .insert(documents)
        .values({
          userId: authUserId,
          fileUrl,
          status: "UPLOADED",
        })
        .returning();

      if (!inserted) {
        return res.status(500).json({ error: "Failed to create document record" });
      }
      doc = inserted;
    } catch (dbErr: any) {
      logger.error("Database insert failed:", dbErr);
      return res.status(500).json({ error: "Failed to save document. Please try again." });
    }

    // Kick off background parsing (non-blocking) - use process.nextTick for better reliability
    process.nextTick(async () => {
      const docId = doc.id;
      logger.info(`[PARSE] Starting background parsing for document ${docId}`);
      
      try {
        // Update status to PARSING
        await db
          .update(documents)
          .set({ status: "PARSING" })
          .where(eq(documents.id, docId));
        logger.info(`[PARSE] Document ${docId} status set to PARSING`);

        // Extract text from file
        logger.info(`[PARSE] Extracting text from ${fileUrl}`);
        const rawText = await extractTextFromUrl(fileUrl);
        logger.info(`[PARSE] Extracted ${rawText.length} characters from document ${docId}`);

        if (!rawText || rawText.trim().length === 0) {
          throw new Error("No text extracted from document");
        }

        // Run AI labeling
        logger.info(`[PARSE] Running AI labeling for document ${docId}`);
        const aiData = await labelWithAI(rawText);
        logger.info(`[PARSE] AI labeling completed for document ${docId}`);

        // Update with parsed data
        await db
          .update(documents)
          .set({ parsedData: aiData, status: "PARSED" })
          .where(eq(documents.id, docId));
        logger.info(`[PARSE] Document ${docId} successfully parsed and saved`);
      } catch (e: any) {
        logger.error(`[PARSE] Background parse failed for document ${docId}:`, e);
        logger.error(`[PARSE] Error details:`, {
          message: e?.message,
          stack: e?.stack,
          name: e?.name
        });
        try {
          await db
            .update(documents)
            .set({ status: "FAILED" })
            .where(eq(documents.id, docId));
          logger.info(`[PARSE] Document ${docId} status set to FAILED`);
        } catch (updateErr: any) {
          logger.error(`[PARSE] Failed to update document ${docId} status to FAILED:`, updateErr);
        }
      }
    });

    return successResponse(res, 201, { document: doc });
  } catch (err) {
    logger.error("Unexpected upload error:", err);
    next(err);
  }
};
