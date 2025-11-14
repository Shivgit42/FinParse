import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response";
import { documents, eq, users } from "@repo/db";
import { db } from "@repo/db/client";
import { logger } from "../utils/logger";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // Check if user already exists by Clerk ID
    const existingUserByClerkId = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (existingUserByClerkId) {
      return successResponse(res, 200, {
        user: existingUserByClerkId,
        message: "User already exists",
      });
    }

    // Check if email already exists
    const existingUserByEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUserByEmail) {
      // Update with Clerk ID if missing
      if (!existingUserByEmail.clerkId) {
        const [updatedUser] = await db
          .update(users)
          .set({ clerkId })
          .where(eq(users.id, existingUserByEmail.id))
          .returning();

        return successResponse(res, 200, {
          user: updatedUser,
          message: "User updated with Clerk ID",
        });
      }

      return res.status(409).json({
        error: "Email already registered with different Clerk ID",
      });
    }

    // Create new user - FIX: Use correct field names matching schema
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkId, // Changed from just clerkId
        email: email, // Changed from just email
        name: name || null, // Changed from just name
      })
      .returning();

    if (!newUser) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    logger.info(`[USER] Created new user: ${newUser.id} (${email})`);
    return successResponse(res, 201, { user: newUser });
  } catch (err: any) {
    logger.error("[USER] Create user error:", err);
    next(err);
  }
};

export const getUserDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get Clerk userId from auth middleware
    const clerkUserId = (req as any).auth?.userId as string | undefined;
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!dbUser) {
      // User not found - return empty array (they haven't uploaded anything yet)
      logger.warn(`[USER] User not found for Clerk ID: ${clerkUserId}`);
      return successResponse(res, 200, { documents: [] });
    }

    // Get user's documents - FIX: Add order by
    const userDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, dbUser.id))
      .orderBy(documents.createdAt);

    logger.info(
      `[USER] Retrieved ${userDocs.length} documents for user ${dbUser.id}`
    );
    return successResponse(res, 200, { documents: userDocs });
  } catch (err: any) {
    logger.error("[USER] Get user documents error:", err);
    next(err);
  }
};

// New endpoint: Get specific document
export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ error: "documentId is required" });
    }

    // Get Clerk userId
    const clerkUserId = (req as any).auth?.userId as string | undefined;
    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get document
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Verify ownership
    if (doc.userId !== dbUser.id) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this document" });
    }

    return successResponse(res, 200, { document: doc });
  } catch (err: any) {
    logger.error("[USER] Get document error:", err);
    next(err);
  }
};
