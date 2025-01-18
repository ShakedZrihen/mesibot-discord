import { Request, Response, Router } from "express";
import { interactionHandlers } from "../interactions";

export const interactionsRouter = Router();

interactionsRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const interaction = req.body;
    const interactionHandler: any = interactionHandlers[interaction.type] ?? null;

    if (!interactionHandler) {
      console.warn("❌ No handler found for interaction type:", interaction.type);
      res.status(400).send("Invalid request");
      return;
    }

    return await interactionHandler({ req, res });
  } catch (error) {
    console.error("❌ Error handling interaction:", error);
    res.status(500).send("Internal Server Error");
  }
});
