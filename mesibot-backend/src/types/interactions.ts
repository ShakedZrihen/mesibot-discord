import { Request, Response } from "express";

export interface interactionPayload {
  req: Request;
  res: Response;
  extraData: any;
}
