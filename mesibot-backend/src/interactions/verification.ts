import { interactionPayload } from "../types";

export const verification = ({ res }: interactionPayload) => {
  console.log("✅ Responding to Discord verification request...");
  res.json({ type: 1 });
};
