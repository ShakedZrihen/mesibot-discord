import { player } from "../clients/player";
import { interactionPayload, ResponseType } from "../types";

export const resume = async ({ req, res }: interactionPayload) => {
  if (!player) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ No song is currently paused." }
    });
    return;
  }

  player.unpause();
  res.json({
    type: ResponseType.Immediate,
    data: { content: "▶️ Playback resumed." }
  });
};
