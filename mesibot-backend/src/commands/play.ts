import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";
import { PROXY_PASSWORD, PROXY_USERNAME } from "../env";
import ytdlp from "yt-dlp-exec";
import { PassThrough } from "stream";
import { spawn } from "child_process";

const PROXY_URL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`;

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

    const playlist = await playlistService.play(playlistId);

    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    await playSong(player, playlistId, playlist.currentPlaying);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Error playing music." }
    });
  }
};

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

const playAudio = async (player: any, url: string) => {
  try {
    console.log("🎧 Fetching audio stream via `yt-dlp`...");
    // Create a stream for piping yt-dlp output
    const stream = new PassThrough();

    // Spawn yt-dlp as a child process
    const process = spawn("yt-dlp", ["-f", "bestaudio", "--no-playlist", "--proxy", PROXY_URL, "-o", "-", url]);

    // Pipe yt-dlp output into the PassThrough stream
    process.stdout.pipe(stream);

    const audioResource = createAudioResource(stream);
    player.play(audioResource);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
};

const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    console.log("🎧 Fetching audio stream via `yt-dlp`...");
    const stream = new PassThrough();

    // Spawn yt-dlp as a child process
    const process = spawn("yt-dlp", ["-f", "bestaudio", "--no-playlist", "--proxy", PROXY_URL, "-o", "-", url]);

    // Pipe yt-dlp output into the PassThrough stream
    process.stdout.pipe(stream);

    const audioResource = createAudioResource(stream);
    player.play(audioResource);
    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
