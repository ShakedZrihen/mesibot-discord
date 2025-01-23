import { player } from "../clients/player";
import { interactionPayload, ResponseType } from "../types";

export const pause = async ({ req, res }: interactionPayload) => {
  if (!player) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ No song is currently playing." }
    });
    return;
  }

  player.pause();
  res.json({
    type: ResponseType.Immediate,
    data: { content: "⏸️ Playback paused." }
  });
};
