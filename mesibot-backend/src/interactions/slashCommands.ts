import { Request, Response } from "express";
import { commandHandlers } from "../commands";

export const slashCommands = (req: Request, res: Response) => {
  const interaction = req.body;
  const commandHandler = commandHandlers[interaction.data.name];

  if (!commandHandler) {
    res.status(404).send("Command not found.");
    return;
  }

  commandHandler(req, res);
};
