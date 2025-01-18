import { commandHandlers } from "../commands";
import { interactionPayload } from "../types";

export const slashCommands = ({ req, res }: interactionPayload) => {
  const interaction = req.body;
  const commandHandler = commandHandlers[interaction.data.name];

  if (!commandHandler) {
    res.status(404).send("Command not found.");
    return;
  }

  commandHandler({ req, res });
};
