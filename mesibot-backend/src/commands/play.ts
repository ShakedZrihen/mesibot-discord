import playdl from "play-dl"; // ✅ Avoid naming conflict
import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";
import fs from "fs";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

/**
 * Fetches YouTube cookies dynamically using `curl` and saves them to `cookies.txt`
 */
const updateCookies = async (): Promise<void> => {
  try {
    console.log("🍪 Fetching fresh YouTube cookies...");

    // ✅ Execute curl command to fetch cookies
    await execPromise(
      `curl -c cookies.txt -b cookies.txt -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" https://www.youtube.com`
    );

    console.log("✅ Cookies saved successfully.");
  } catch (error) {
    console.error("❌ Error fetching cookies:", error);
  }
};

/**
 * Reads and formats cookies from `cookies.txt` for `play-dl`
 */
const getFormattedCookies = (): string => {
  try {
    const rawCookies = fs.readFileSync("./cookies.txt", "utf8");

    return rawCookies
      .split("\n")
      .filter((line) => !line.startsWith("#") && line.trim() !== "") // Remove comments and empty lines
      .map((line) => {
        const parts = line.split("\t"); // Cookies are tab-separated
        return `${parts[5]}=${parts[6]};`; // Extract cookie name=value pairs
      })
      .join(" "); // Convert to a space-separated header
  } catch (error) {
    console.error("❌ Error reading cookies file:", error);
    return "";
  }
};

export const play = async ({ req, res }: interactionPayload) => {
  const interaction = req.body;
  let connection: VoiceConnection | null = null;
  const playlistId = interaction.data.options[0]?.value;

  if (!playlistId) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Please provide a valid playlist ID." }
    });
    return;
  }

  const guild = client.guilds.cache.get(interaction.guild_id);
  const member = await guild?.members.fetch(interaction.member.user.id);

  if (!member?.voice.channel) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ You must be in a voice channel to use this command." }
    });
    return;
  }

  try {
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild_id,
      adapterCreator: guild?.voiceAdapterCreator as any
    });

    connection.subscribe(player);

    res.json({
      type: ResponseType.Immediate,
      data: { content: `🎉 Started playing from playlist: ${playlistId}` }
    });

    // ✅ Fetch fresh cookies before playing
    await updateCookies();
    const formattedCookies = getFormattedCookies();

    // ✅ Set token for play-dl with updated cookies
    playdl.setToken({
      youtube: {
        cookie: formattedCookies
      }
    });

    // ✅ Get the first song from the playlist
    const playlist = await playlistService.play(playlistId);

    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    // ✅ Play the song (including intro if available)
    await playSong(player, playlistId, playlist.currentPlaying);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Error playing music." }
    });
  }
};

/**
 * Plays a song and its intro (if available), then moves to the next song.
 */
const playSong = async (player: any, playlistId: string, song: { url: string; introUrl?: string }) => {
  try {
    // ✅ Play the intro first (if available)
    if (song.introUrl) {
      console.log("🎤 Playing intro:", song.introUrl);
      await playAudio(player, song.introUrl);
      console.log("🎶 Intro finished, now playing the actual song...");
    }

    // ✅ Play the main song
    console.log("▶️ Playing song:", song.url);
    await playAudioAndWaitForEnd(player, song.url, async () => {
      console.log("✅ Song finished, playing next...");
      const updatedPlaylist = await playlistService.playNext(playlistId);

      if (updatedPlaylist?.currentPlaying) {
        playSong(player, playlistId, updatedPlaylist.currentPlaying);
      } else {
        console.log("🎵 Playlist ended.");
      }
    });
  } catch (error) {
    console.error("❌ Error playing song:", error);
    const updatedPlaylist = await playlistService.playNext(playlistId);

    if (updatedPlaylist?.currentPlaying) {
      playSong(player, playlistId, updatedPlaylist.currentPlaying);
      wsManager.notifyPlaylistUpdate(playlistId, updatedPlaylist.queue, updatedPlaylist.currentPlaying);
    } else {
      console.log("🎵 Playlist ended.");
    }
  }
};

/**
 * Helper function to play an audio file from YouTube using `play-dl`.
 */
const playAudio = async (player: any, url: string) => {
  try {
    console.log("🎧 Fetching audio stream...");

    const stream = await playdl.stream(url, { quality: 2 });

    console.log("🎶 Streaming YouTube audio...");
    const audioResource = createAudioResource(stream.stream);

    player.play(audioResource);

    return new Promise<void>((resolve) => {
      player.once(AudioPlayerStatus.Idle, resolve);
    });
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
};

/**
 * Helper function to play an audio file and trigger an action when it ends.
 */
const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    console.log("🎧 Fetching audio stream...");
    const stream = await playdl.stream(url);

    console.log("🎶 Streaming YouTube audio...", stream);
    const audioResource = createAudioResource(stream.stream);

    player.play(audioResource);

    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
