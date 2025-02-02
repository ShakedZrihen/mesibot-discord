import youtubedl from "youtube-dl-exec";
import {
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
  AudioPlayerStatus,
  AudioPlayer
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
    console.log("🔗 Connecting to voice channel...");
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild_id,
      adapterCreator: guild?.voiceAdapterCreator as any,
      debug: true
    });

    connection.subscribe(player);
    console.log("✅ Connected to voice channel!");

    res.json({
      type: ResponseType.Immediate,
      data: { content: `🎉 Started playing from playlist: ${playlistId}` }
    });

    const playlist = await playlistService.play(playlistId);
    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    console.log(`🎵 First song: ${playlist.currentPlaying.title}`);
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
    if (song.introUrl) {
      console.log("🎤 Playing intro:", song.introUrl);
      await playAudioAndWaitForEnd(player, song.introUrl);
      console.log("🎶 Intro finished, now playing the actual song...");
    }

    console.log("▶️ Playing song:", song.url);
    await playAudioAndWaitForEnd(player, song.url);

    console.log("✅ Song finished, playing next...");
    const updatedPlaylist = await playlistService.playNext(playlistId);

    if (updatedPlaylist?.currentPlaying) {
      playSong(player, playlistId, updatedPlaylist.currentPlaying);
    } else {
      console.log("🎵 Playlist ended.");
    }
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
 * Helper function to play an audio file and ensure it fully plays before continuing.
 */
const playAudioAndWaitForEnd = async (player: AudioPlayer, url: string) => {
  try {
    const audioUrl = await fetchAudioUrl(url);
    if (!audioUrl) throw new Error("No valid formats found.");

    console.log(`🎧 Audio URL: ${audioUrl}`);
    const audioResource = createAudioResource(audioUrl);
    player.play(audioResource);

    return new Promise<void>((resolve) => {
      const onIdle = () => {
        console.log("✅ Audio finished.");
        player.removeListener(AudioPlayerStatus.Idle, onIdle);
        resolve();
      };

      player.once(AudioPlayerStatus.Idle, onIdle);
    });
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
};

/**
 * Fetches the best low-quality audio format from a YouTube URL.
 */
const fetchAudioUrl = async (url: string): Promise<string | null> => {
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
        "accept-language: en-US,en;q=0.9",
        "cookie: CONSENT=PENDING+448;"
      ]
    })) as any;

    if (!videoInfo || !videoInfo.formats) return null;

    let selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none" && f.abr <= 50);
    if (!selectedFormat) {
      selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");
    }

    return selectedFormat ? selectedFormat.url : null;
  } catch (error) {
    console.error("❌ Error fetching audio URL:", error);
    return null;
  }
};
