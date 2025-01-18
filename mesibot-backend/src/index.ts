import express, { Request, Response } from "express";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { interactionHandlers } from "./interactions";
import { verifyDiscordRequest } from "./middlewares/verifyDiscordRequest";

dotenv.config();

const app = express();
const PORT = 3000;

// ✅ Middleware to store raw body before JSON parsing
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      (req as any).rawBody = buf; // Assign raw body without breaking TypeScript
    }
  })
);

// Handle Discord interactions
app.post("/interactions", verifyDiscordRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const interaction = req.body;
    const interactionHandler: any = interactionHandlers[interaction.type] ?? null;

    if (!interactionHandler) {
      console.warn("❌ No handler found for interaction type:", interaction.type);
      res.status(400).send("Invalid request");
      return;
    }

    return interactionHandler(req, res);
  } catch (error) {
    console.error("❌ Error handling interaction:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌍 Web server running at http://localhost:${PORT}`);
});

// Discord bot setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);
