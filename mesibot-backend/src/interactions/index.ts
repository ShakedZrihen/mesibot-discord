import { slashCommands } from "./slashCommands";
import { verification } from "./verification";

export const interactionHandlers: Record<number, any> = {
  1: verification,
  2: slashCommands
};
