import playdl from "play-dl"; // ✅ Avoid naming conflict
import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";
import { readFileSync } from "fs";

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

    // ✅ Get the first song from the playlist
    const playlist = await playlistService.play(playlistId);

    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    const rawCookies = readFileSync("./cookies.txt", "utf8");

    // ✅ Convert cookies.txt format into a single string (space-separated)
    const formattedCookies = rawCookies
      .split("\n")
      .filter((line) => !line.startsWith("#") && line.trim() !== "") // Remove comments and empty lines
      .map((line) => {
        const parts = line.split("\t"); // Cookies are tab-separated
        return `${parts[5]}=${parts[6]};`; // Extract cookie name=value pairs
      })
      .join(" "); // Convert to a space-separated header

    // ✅ Set token for play-dl with properly formatted cookies
    playdl.setToken({
      youtube: {
        cookie: formattedCookies
      }
    });

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
    const stream = await playdl.stream(url); // ✅ Use renamed import

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
    const stream = await playdl.stream(url); // ✅ Use renamed import

    console.log("🎶 Streaming YouTube audio...", stream);
    const audioResource = createAudioResource(stream.stream);

    player.play(audioResource);

    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
