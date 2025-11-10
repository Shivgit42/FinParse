import express, { Router } from "express";
import { handleParse } from "../controllers/parse.controller";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();

router.post("/", requireAuth, handleParse);

export default router;
