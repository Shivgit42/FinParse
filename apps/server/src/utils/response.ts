import { Response } from "express";

export const successResponse = (
  res: Response,
  status = 200,
  data: any = {}
) => {
  return res.status(status).json({ ok: true, data });
};
