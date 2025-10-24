import axios from "axios";
import Tesseract from "tesseract.js";
import { logger } from "../utils/logger";

export const extractTextFromUrl = async (fileUrl: string): Promise<string> => {
  try {
    const res = await axios.get<ArrayBuffer>(fileUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(res.data);

    const result = await Tesseract.recognize(buffer, "eng", {
      logger: (m) => logger.debug(m),
    });
    return result.data.text;
  } catch (err) {
    logger.error("OCR failed", err);
    throw err;
  }
};
