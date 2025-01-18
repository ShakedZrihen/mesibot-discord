import { Response, Request } from "express";
import { ResponseType } from "../types";

export const ping = (req: Request, res: Response) => {
  res.json({
    type: ResponseType.withMessage,
    data: { content: "🏓 Pong!" }
  });
};
