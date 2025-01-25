import youtubedl from "youtube-dl-exec";
import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";

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

    // ✅ Trigger backend to get the first song
    const playlist = await playlistService.play(playlistId);

    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    await playSong(player, playlistId, playlist.currentPlaying.url);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Error playing music." }
    });
  }
};

/**
 * Plays a song and triggers the next one when finished.
 */
const playSong = async (player: any, playlistId: string, url: string) => {
  try {
    const videoInfo = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"]
    })) as any;

    if (!videoInfo || !videoInfo.formats) {
      throw new Error("No valid formats found.");
    }

    // ✅ Pick the lowest quality audio format
    let selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none" && f.abr <= 50);

    // ✅ If no low-bitrate format is found, fallback to the lowest available audio format
    if (!selectedFormat) {
      selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");
    }

    if (!selectedFormat) {
      throw new Error("No available audio formats.");
    }

    console.log(`✅ Selected Format: ${selectedFormat.format_id} (${selectedFormat.abr || "unknown"} kbps)`);

    const audioResource = createAudioResource(selectedFormat.url);

    player.play(audioResource);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("▶️ Audio is playing...");
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      console.log("⏳ Audio is buffering...");
    });

    player.on(AudioPlayerStatus.AutoPaused, () => {
      console.log("⏸️ Audio is paused due to lack of activity...");
    });

    // ✅ Auto-play next song when the current one finishes
    player.on(AudioPlayerStatus.Idle, async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // ✅ Adds a 3-second buffer

      console.log("✅ Song finished, playing next...");
      const updatedPlaylist = await playlistService.playNext(playlistId);
      if (updatedPlaylist?.currentPlaying) {
        playSong(player, playlistId, updatedPlaylist.currentPlaying.url);
      } else {
        console.log("🎵 Playlist ended.");
      }
    });
  } catch (error) {
    console.error("❌ Error playing song:", error);
    const updatedPlaylist = await playlistService.playNext(playlistId);
    if (updatedPlaylist?.currentPlaying) {
      playSong(player, playlistId, updatedPlaylist.currentPlaying.url);
    } else {
      console.log("🎵 Playlist ended.");
    }
  }
};
