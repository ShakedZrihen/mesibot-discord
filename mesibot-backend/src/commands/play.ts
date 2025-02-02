import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";
import axios from "axios";

const INVIDIOUS_INSTANCES = [
  "https://invidious.snopyta.org",
  "https://vid.puffyan.us",
  "https://invidious.tiekoetter.com",
  "https://invidious.privacydev.net",
  "https://yewtu.be"
];

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
    if (song.introUrl) {
      console.log("🎤 Playing intro:", song.introUrl);
      await playAudio(player, song.introUrl);
      console.log("🎶 Intro finished, now playing the actual song...");
    }

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
const playAudio = async (player: any, youtubeUrl: string) => {
  try {
    const videoId = extractYouTubeId(youtubeUrl);
    const audioUrl = await fetchAudioUrl(videoId);

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
const playAudioAndWaitForEnd = async (player: any, youtubeUrl: string, onEnd: () => void) => {
  try {
    const videoId = extractYouTubeId(youtubeUrl);
    const audioUrl = await fetchAudioUrl(videoId);

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

/**
 * Fetches the best low-quality audio format from an Invidious API.
 */
const fetchAudioUrl = async (videoId: string): Promise<string | null> => {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, { timeout: 5000 });

      if (response.status === 200 && response.data?.adaptiveFormats) {
        const audioFormat = response.data.adaptiveFormats.find((format: any) => format.type.includes("audio/"));

        if (audioFormat) {
          return audioFormat.url;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Invidious instance failed: ${instance}, trying next...`);
    }
  }

  console.error("❌ No working Invidious instance found.");
  return null;
};

/**
 * Extracts YouTube video ID from a URL.
 */
const extractYouTubeId = (url: string): string => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*\/vi\/|vi\/|user\/.*\/u\/\d+\/|.*videos\/|.*\/e\/|.*watch\?.*v=|.*&v=))([^#&?\/\s]{11})/
  );
  return match ? match[1] : "";
};
