import axios from "axios";
import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";

const YOUTUBEI_API = "https://www.youtube.com/youtubei/v1/player";
const YOUTUBEI_CLIENT = {
  clientName: "ANDROID", // Mobile client version tends to work better
  clientVersion: "18.05.40",
  androidSdkVersion: 30
};

/**
 * Fetches an audio URL using YouTube's internal `youtubei` API.
 */
const fetchYouTubeiAudio = async (videoId: string): Promise<string | null> => {
  try {
    const response = await axios.post(
      YOUTUBEI_API,
      {
        videoId,
        context: { client: YOUTUBEI_CLIENT }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "AIzaSyC....", // Your API Key (needed for some requests)
          "User-Agent": "com.google.android.youtube/18.05.40 (Linux; U; Android 11) gzip"
        }
      }
    );

    if (!response.data.streamingData) {
      throw new Error("No streaming data found.");
    }

    const audioFormat = response.data.streamingData.adaptiveFormats.find((format: any) =>
      format.mimeType.includes("audio/")
    );

    return audioFormat ? audioFormat.url : null;
  } catch (error) {
    console.error("❌ Error fetching audio URL:", (error as any).response?.data || (error as any).message);
    return null;
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
 * Helper function to play an audio file from a given URL.
 * Waits until the audio ends before resolving.
 */
const playAudio = async (player: any, url: string) => {
  try {
    const videoId = url.split("v=")[1].split("&")[0];
    const audioUrl = await fetchYouTubeiAudio(videoId);

    if (!audioUrl) {
      throw new Error("No valid audio URL found.");
    }

    console.log("🎧 Audio URL:", audioUrl);
    const audioResource = createAudioResource(audioUrl);
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
    const videoId = url.split("v=")[1].split("&")[0];
    const audioUrl = await fetchYouTubeiAudio(videoId);

    if (!audioUrl) {
      throw new Error("No valid audio URL found.");
    }

    console.log("🎧 Audio URL:", audioUrl);
    const audioResource = createAudioResource(audioUrl);
    player.play(audioResource);

    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
