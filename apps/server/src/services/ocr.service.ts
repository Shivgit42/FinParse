import axios from "axios";
import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";
import { logger } from "../utils/logger";

export const extractTextFromUrl = async (fileUrl: string): Promise<string> => {
  try {
    if (!fileUrl) {
      const error = new Error("fileUrl is required");
      (error as any).status = 400;
      throw error;
    }

    logger.info(`[OCR] Starting text extraction from ${fileUrl}`);

    // Try to detect content-type via HEAD; fallback to GET for bytes
    let contentType = "";
    try {
      const head = await axios.head(fileUrl, { timeout: 10000 });
      contentType = (head.headers["content-type"] as string) || "";
      logger.info(`[OCR] Detected content-type: ${contentType}`);
    } catch (headErr) {
      logger.warn(`[OCR] HEAD request failed, proceeding with GET:`, headErr);
    }

    logger.info(`[OCR] Downloading file from ${fileUrl}`);
    const res = await axios.get<ArrayBuffer>(fileUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
      maxContentLength: 50 * 1024 * 1024,
    });
    const buffer = Buffer.from(res.data);
    logger.info(`[OCR] Downloaded ${buffer.length} bytes`);

    // If PDF (by content-type or URL suffix), use pdf-parse for embedded text
    const isPdf =
      contentType.includes("pdf") || /\.pdf(\?|$)/i.test(fileUrl);
    
    if (isPdf) {
      logger.info(`[OCR] Detected PDF, attempting pdf-parse`);
      try {
        const pdf = await pdfParse(buffer);
        if (pdf?.text?.trim()) {
          logger.info(`[OCR] PDF parsing successful, extracted ${pdf.text.length} characters`);
          return pdf.text;
        }
        // Fall through to OCR if no embedded text
        logger.info("[OCR] PDF has no embedded text; falling back to OCR");
      } catch (e: any) {
        logger.warn(`[OCR] pdf-parse failed: ${e?.message}, falling back to OCR`);
      }
    }

    // OCR images or PDFs without extractable text
    logger.info(`[OCR] Starting Tesseract OCR`);
    const result = await Tesseract.recognize(buffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          logger.debug(`[OCR] ${m.progress * 100}% complete`);
        }
      },
    });
    logger.info(`[OCR] OCR completed, extracted ${result.data.text.length} characters`);
    return result.data.text;
  } catch (err: any) {
    logger.error("[OCR] Text extraction failed:", {
      message: err?.message,
      stack: err?.stack,
      fileUrl
    });
    throw err;
  }
};
