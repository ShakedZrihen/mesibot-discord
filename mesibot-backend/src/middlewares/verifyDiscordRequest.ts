import { Request, Response, NextFunction } from "express";
import nacl from "tweetnacl";
import dotenv from "dotenv";

dotenv.config();

export const verifyDiscordRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const signature = req.headers["x-signature-ed25519"] as string;
    const timestamp = req.headers["x-signature-timestamp"] as string;
    const publicKey = process.env.DISCORD_PUBLIC_KEY as string;

    // ✅ Ensure rawBody exists
    const rawBody = (req as any).rawBody;
    if (!signature || !timestamp || !rawBody) {
      console.error("❌ Missing verification headers.");
      res.status(401).send("Unauthorized");
      return; // ✅ Ensure function exits
    }

    // ✅ Step 1: Verify Discord Request
    const isValidRequest = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody.toString()), // Convert raw body to string
      Buffer.from(signature, "hex"),
      Buffer.from(publicKey, "hex")
    );

    if (!isValidRequest) {
      console.error("❌ Invalid request signature, rejecting request.");
      res.status(401).send("Invalid request signature");
      return; // ✅ Ensure function exits
    }

    // ✅ If verified, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("❌ Error verifying request:", error);
    res.status(500).send("Internal Server Error");
    return; // ✅ Ensure function exits
  }
};
