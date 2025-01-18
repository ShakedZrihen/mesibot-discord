import { ResponseType, interactionPayload } from "../types";

export const ping = ({ res }: interactionPayload) => {
  res.json({
    type: ResponseType.Immediate,
    data: { content: "🏓 Pong!" }
  });
};
