import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = cloudName && apiKey && apiSecret;

if (!isConfigured) {
  console.error("❌ Cloudinary credentials not fully configured!");
  console.error("Missing:", {
    cloud_name: !cloudName,
    api_key: !apiKey,
    api_secret: !apiSecret,
  });
  console.error("Uploads will fail. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.");
}

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export const uploadToCloudinary = (
  buffer: Buffer,
  filename = "upload"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`[CLOUDINARY] Starting upload: ${filename}, size: ${buffer.length} bytes`);
    
    // Check if Cloudinary is configured
    if (!isConfigured) {
      console.error("[CLOUDINARY] Configuration check failed");
      return reject(new Error("Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."));
    }

    console.log(`[CLOUDINARY] Configuration OK, cloud_name: ${cloudName}`);

    let uploadStarted = false;
    let streamEnded = false;

    // Add timeout to prevent hanging forever (reduced to 30 seconds for faster failure)
    const timeout = setTimeout(() => {
      if (!streamEnded) {
        console.error("[CLOUDINARY] Upload timed out after 30 seconds");
        reject(new Error("Cloudinary upload timed out after 30 seconds. Check your network connection and Cloudinary service status."));
      }
    }, 30000); // Reduced from 90 to 30 seconds

    try {
      console.log(`[CLOUDINARY] Creating upload stream`);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: process.env.CLOUDINARY_FOLDER || "finparse",
          timeout: 30000, // 30 seconds timeout
        },
        (error, result) => {
          clearTimeout(timeout);
          streamEnded = true;
          
          if (error) {
            console.error(`[CLOUDINARY] Upload error:`, error);
            let errorMsg = `Cloudinary upload failed: ${error.message || "Unknown error"}`;
            // Provide helpful error messages
            if (error.message?.includes("Invalid API Key") || error.message?.includes("401")) {
              errorMsg = "Invalid Cloudinary API credentials. Please check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.";
            } else if (error.message?.includes("Invalid cloud_name")) {
              errorMsg = "Invalid Cloudinary cloud name. Please check your CLOUDINARY_CLOUD_NAME.";
            } else if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
              errorMsg = "Cloudinary upload timed out. Check your network connection and Cloudinary service status.";
            }
            return reject(new Error(errorMsg));
          }
          if (!result) {
            console.error("[CLOUDINARY] No result returned");
            return reject(new Error("No result from Cloudinary - upload may have failed silently"));
          }
          console.log(`[CLOUDINARY] Upload successful: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );

      uploadStream.on('error', (streamError) => {
        clearTimeout(timeout);
        streamEnded = true;
        console.error(`[CLOUDINARY] Stream error:`, streamError);
        reject(new Error(`Cloudinary stream error: ${streamError.message || "Unknown error"}`));
      });

      uploadStream.on('drain', () => {
        console.log(`[CLOUDINARY] Stream drain event`);
      });

      console.log(`[CLOUDINARY] Piping buffer to upload stream`);
      const readStream = streamifier.createReadStream(buffer);
      
      readStream.on('error', (readError) => {
        clearTimeout(timeout);
        streamEnded = true;
        console.error(`[CLOUDINARY] Read stream error:`, readError);
        reject(new Error(`Failed to read file buffer: ${readError.message || "Unknown error"}`));
      });

      readStream.on('end', () => {
        console.log(`[CLOUDINARY] Read stream ended, waiting for upload completion`);
      });

      uploadStarted = true;
      readStream.pipe(uploadStream);
    } catch (err: any) {
      clearTimeout(timeout);
      streamEnded = true;
      console.error(`[CLOUDINARY] Exception during upload setup:`, err);
      reject(new Error(`Failed to start Cloudinary upload: ${err.message || "Unknown error"}`));
    }
  });
};
