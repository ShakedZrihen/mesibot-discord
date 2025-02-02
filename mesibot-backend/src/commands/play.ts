import youtubedl from "youtube-dl-exec";
import {
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
  AudioPlayer,
  AudioPlayerStatus,
  StreamType
} from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";

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
const playSong = async (player: AudioPlayer, playlistId: string, song: { url: string; introUrl?: string }) => {
  try {
    // ✅ Play the intro first (if available)
    if (song.introUrl) {
      console.log("🎤 Playing intro:", song.introUrl);
      await playAudioAndWait(player, song.introUrl);
      console.log("🎶 Intro finished, now playing the actual song...");
    }

    // ✅ Play the main song
    console.log("▶️ Playing song:", song.url);
    await playAudioAndWait(player, song.url, async () => {
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
 * Helper function to play an audio file and trigger an action when it ends.
 */
const playAudioAndWait = async (player: AudioPlayer, url: string, onEnd?: () => void) => {
  try {
    const audioUrl = await fetchAudioUrl(url);

    if (!audioUrl) {
      throw new Error("No valid formats found.");
    }

    console.log(`🎧 Audio URL: ${audioUrl}`);

    const audioResource = createAudioResource(audioUrl, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true
    });

    if (!audioResource) {
      throw new Error("❌ Failed to create an audio resource.");
    }

    console.log("🎶 Successfully created audio resource, playing now...");

    // Log if player is actually playing
    player.play(audioResource);

    console.log("🔊 Checking playback status...");

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("▶️ Audio is playing...");
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      console.log("⏳ Audio is buffering...");
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("✅ Audio finished.");
      if (onEnd) {
        onEnd();
      }
    });

    player.on("error", (error) => {
      console.error("❌ Error during playback:", error);
      if (onEnd) {
        onEnd();
      }
    });
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    if (onEnd) {
      onEnd();
    }
  }
};

/**
 * Fetches the best low-quality audio format from a YouTube URL.
 */
const fetchAudioUrl = async (url: string): Promise<string | null> => {
  try {
    let videoInfo = await getAudioStream(url);

    if (!videoInfo) {
      console.warn("⚠️ First attempt failed, retrying...");
      videoInfo = await getAudioStream(url);
    }

    return videoInfo;
  } catch (error) {
    console.error("❌ Error fetching audio URL:", error);
    return null;
  }
};

/**
 * Retrieves the best available audio format for a YouTube video.
 */
const getAudioStream = async (url: string): Promise<string | null> => {
  try {
    const videoInfo = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
      cookies: "./cookies.txt",
      addHeader: [
        "referer: https://www.youtube.com/",
        "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "accept-language: en-US,en;q=0.9"
      ]
    })) as any;

    if (!videoInfo || !videoInfo.formats) {
      return null;
    }

    // ✅ Pick the lowest quality audio format
    let selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none" && f.abr <= 50);

    if (!selectedFormat) {
      selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");
    }

    return selectedFormat ? selectedFormat.url : null;
  } catch (error) {
    console.error("❌ Error fetching audio stream:", error);
    return null;
  }
};
