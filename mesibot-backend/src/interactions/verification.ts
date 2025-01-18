import { Request, Response } from "express";

export const verification = (req: Request, res: Response) => {
  console.log("✅ Responding to Discord verification request...");
  res.json({ type: 1 });
};
