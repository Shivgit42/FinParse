import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response";
import { documents, eq, users } from "@repo/db";
import { db } from "@repo/db/client";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return successResponse(res, 200, { user: existingUser });
    }

    const [newUser] = await db
      .insert(users)
      .values({ email, name })
      .returning();

    return successResponse(res, 201, { user: newUser });
  } catch (err) {
    next(err);
  }
};

export const getUserDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const userDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId));

    return successResponse(res, 200, { documents: userDocs });
  } catch (err) {
    next(err);
  }
};
