import { CLIENT_ID, DISCORD_TOKEN } from "../env";
import { join } from "./join";
import { ping } from "./ping";
import { play } from "./play";
import { REST, Routes } from "discord.js";

const commands = [
  {
    name: "play",
    description: "Play music from YouTube",
    options: [
      {
        name: "url",
        type: 3, // Type 3 = STRING
        description: "YouTube video URL",
        required: true
      }
    ]
  },
  {
    name: "join",
    description: "Make the bot join your voice channel"
  },
  {
    name: "ping",
    description: "Replies with Pong!"
  }
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN!);

  try {
    console.log("🔹 Registering slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID!), { body: commands });
    console.log("✅ Slash commands registered!");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
}

registerCommands();

export const commandHandlers: Record<string, any> = {
  ping: ping,
  play: play,
  join: join
};
