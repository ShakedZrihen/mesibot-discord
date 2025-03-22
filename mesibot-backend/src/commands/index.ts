import { CLIENT_ID, DISCORD_TOKEN } from "../env";
import { join } from "./join";
import { pause } from "./pause";
import { ping } from "./ping";
import { play } from "./play";
import { REST, Routes } from "discord.js";
import { resume } from "./resume";
import { OptionType, SupportedCommands } from "./types";

const commands = [
  {
    name: SupportedCommands.play,
    description: "Play music from YouTube",
    options: [
      {
        name: "playlist-id",
        type: OptionType.string,
        description: "playlist id",
        required: true
      }
    ]
  },
  {
    name: SupportedCommands.pause,
    description: "Pause playlist"
  },
  {
    name: SupportedCommands.resume,
    description: "Resume playlist"
  },
  {
    name: SupportedCommands.join,
    description: "Make the bot join your voice channel"
  },
  {
    name: SupportedCommands.ping,
    description: "Replies with Pong!"
  },
  // TODO: implement below
  {
    name: SupportedCommands.clearQueue,
    description: "Clear queue"
  },
  {
    name: SupportedCommands.deleteSong,
    description: "delete song from playlist",
    options: [
      {
        name: "songName",
        type: OptionType.string,
        description: "song name",
        required: true
      }
    ]
  },
  {
    name: SupportedCommands.skip,
    description: "skip the current song"
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
