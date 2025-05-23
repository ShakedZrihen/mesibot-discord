import { spawn } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";
import { wsManager } from "../..";
import {
  currentResolve,
  currentSongProcess,
  setCurrentResolve,
  setCurrentSongProcess
} from "../../services/playlist/stream";

let isStreaming = false;
let isPaused = false;
let currentPlaylistId: string | null = null;

const ICECAST_URL = `icecast://source:RKydjxrD@34.165.253.197:8010/stream`;

const streamSongToIcecast = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-re", // 🔥 Real-time streaming
      "-reconnect",
      "1",
      "-reconnect_streamed",
      "1",
      "-reconnect_delay_max",
      "5",
      "-i",
      url,
      "-vn",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-f",
      "mp3",
      ICECAST_URL
    ]);
    setCurrentSongProcess(ffmpeg);
    setCurrentResolve(() => ffmpeg.kill("SIGKILL"));

    ffmpeg.stderr?.on("data", (data) => {
      console.log("FFmpeg:", data.toString());
    });

    ffmpeg.on("close", () => {
      setCurrentSongProcess(null);
      setCurrentResolve(null);
      resolve();
    });

    ffmpeg.on("error", (err) => {
      console.error("❌ FFmpeg error:", err);
      setCurrentSongProcess(null);
      setCurrentResolve(null);
      reject(err);
    });
  });
};

const streamPlaylistLoop = async (partyId: string, playlistId: string) => {
  currentPlaylistId = playlistId;

  while (isStreaming && !isPaused) {
    const playlist = await playlistService.playNext(playlistId);
    const song = playlist?.currentPlaying;

    if (!song || !song.url) {
      console.log("📭 Playlist empty. Ending stream.");
      isStreaming = false;
      return;
    }

    const audioUrl = await fetchAudioUrl(song.url);
    if (!audioUrl) {
      console.warn("⚠️ Skipping song: could not fetch URL");
      continue;
    }

    console.log("🎵 Streaming:", song.title);
    wsManager.notifyPlaylistUpdate(partyId, playlist.queue, song, playlist.played);

    if (song.introUrl) {
      console.log("🎵 Playing intro for song:", song.title);
      await streamSongToIcecast(song.introUrl);
    }
    await streamSongToIcecast(audioUrl);
    console.log("✅ Finished streaming song. Moving to next...");
  }
};

export const stream = async (req: Request, res: Response) => {
  const { partyId } = req.params;

  const party = await Party.findById(partyId).populate("playlist");
  const playlistId = party?.playlist?._id.toString();

  if (!playlistId) {
    res.status(400).send("Missing playlist");
    return;
  }

  if (isStreaming) {
    res.status(200).send("Already streaming");
    return;
  }

  isStreaming = true;
  res.status(200).send("Starting Icecast stream...");

  try {
    const playlist = await playlistService.play(playlistId);
    const song = playlist?.currentPlaying;
    if (!song?.url) {
      console.error("No current song to play");
      isStreaming = false;
      return;
    }

    const firstUrl = await fetchAudioUrl(song.url);
    if (!firstUrl) {
      console.error("Cannot fetch first song");
      isStreaming = false;
      return;
    }

    console.log("▶️ Starting stream with:", song.title);
    wsManager.notifyPlaylistUpdate(partyId, playlist?.queue ?? [], song, playlist?.played ?? []);

    if (song.introUrl) {
      console.log("🎵 Playing intro for song:", song.title);
      await streamSongToIcecast(song.introUrl);
    }
    await streamSongToIcecast(firstUrl);
    await streamPlaylistLoop(partyId, playlistId);
  } catch (err) {
    console.error("❌ Stream crashed:", err);
    isStreaming = false;
  }
};

export const pauseStream = (req: Request, res: Response) => {
  if (currentSongProcess) {
    currentSongProcess.kill("SIGKILL");
    setCurrentSongProcess(null);
  }

  isPaused = true;
  console.log("⏸️ Stream paused");
  res.status(200).send("Paused stream");
};

export const resumeStream = async (req: Request, res: Response) => {
  const { partyId } = req.params;

  if (!isPaused || !currentPlaylistId) {
    res.status(400).send("Cannot resume");
    return;
  }

  isPaused = false;
  console.log("▶️ Resuming stream...");
  streamPlaylistLoop(partyId, currentPlaylistId);
  res.status(200).send("Resumed stream");
};

export const skipSong = (req: Request, res: Response) => {
  if (currentSongProcess && currentResolve) {
    console.log("⏭️ Skipping song");
    currentResolve();
    res.status(200).send("Skipped song");
  } else {
    res.status(400).send("No song is currently playing");
  }
};
