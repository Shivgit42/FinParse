import express, { Router } from "express";
import { createUser, getUserDocuments } from "../controllers/user.controller";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();

router.post("/", createUser);
router.get("/:userId/documents", requireAuth, getUserDocuments);

export default router;
