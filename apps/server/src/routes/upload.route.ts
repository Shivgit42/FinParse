import express, { Router } from "express";
import multer from "multer";
import { handleUpload } from "../controllers/upload.controller";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), handleUpload);

export default router;
