import express, { Router } from "express";
import multer from "multer";
import { handleUpload } from "../controllers/upload.controller";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post("/", requireAuth, upload.single("file"), handleUpload);

export default router;
