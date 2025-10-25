import express, { Router } from "express";
import { handleParse } from "../controllers/parse.controller";

const router: Router = express.Router();

router.post("/", handleParse);

export default router;
