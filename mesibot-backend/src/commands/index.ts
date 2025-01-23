import { CLIENT_ID, DISCORD_TOKEN } from "../env";
import { join } from "./join";
import { pause } from "./pause";
import { ping } from "./ping";
import { play } from "./play";
import { REST, Routes } from "discord.js";
import { resume } from "./resume";

const commands = [
  {
    name: "play",
    description: "Play music from YouTube",
    options: [
      {
        name: "playlist-id",
        type: 3, // Type 3 = STRING
        description: "playlist id",
        required: true
      }
    ]
  },
  {
    name: "pause",
    description: "Pause playlist"
  },
  {
    name: "resume",
    description: "Resume playlist"
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
    console.error("❌ Error registering commands:", JSON.stringify(error));
  }
}

registerCommands();

export const commandHandlers: Record<string, any> = {
  ping: ping,
  play: play,
  pause: pause,
  resume: resume,
  join: join
};
