import { spawn, spawnSync, ChildProcess } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";
import { existsSync, createWriteStream } from "fs";

const fifoPath = "/tmp/icecast-stream.pipe";

let ffmpegProcess: ChildProcess | null = null;
let currentSongProcess: ChildProcess | null = null;
let currentResolve: (() => void) | null = null;

let isStreaming = false;
let isPaused = false;
let currentPlaylistId: string | null = null;

const ensureFifoExists = () => {
  if (!existsSync(fifoPath)) {
    console.log("📦 Creating FIFO pipe...");
    spawnSync("mkfifo", [fifoPath]);
  }
};

const startFfmpegStream = () => {
  ensureFifoExists();

  ffmpegProcess = spawn("ffmpeg", [
    "-re",
    "-i",
    fifoPath,
    "-vn",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-f",
    "mp3",
    "icecast://source:kolaculz@localhost:8000/party"
  ]);

  ffmpegProcess.stderr?.on("data", (data) => {
    console.log("FFmpeg:", data.toString());
  });

  ffmpegProcess.on("close", () => {
    console.log("❌ FFmpeg closed");
    ffmpegProcess = null;
  });
};

const writeToFifo = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const pipe = spawn("ffmpeg", [
      "-ss",
      "0",
      "-i",
      url,
      "-f",
      "mp3",
      "-vn",
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "pipe:1"
    ]);

    currentSongProcess = pipe;
    currentResolve = resolve;

    const fifoStream = createWriteStream(fifoPath);
    pipe.stdout.pipe(fifoStream);

    pipe.on("close", () => {
      resolve();
      currentSongProcess = null;
      currentResolve = null;
    });

    pipe.on("error", (err) => {
      console.error("❌ Song stream error:", err);
      reject(err);
      currentSongProcess = null;
      currentResolve = null;
    });
  });
};

const writeSilenceToFifo = (): Promise<void> => {
  return new Promise((resolve) => {
    const silence = spawn("ffmpeg", [
      "-f",
      "lavfi",
      "-i",
      "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-t",
      "2",
      "-f",
      "mp3",
      "pipe:1"
    ]);

    const fifoStream = createWriteStream(fifoPath);
    silence.stdout.pipe(fifoStream);
    silence.on("close", () => resolve());
  });
};

const streamPlaylistLoop = async () => {
  if (!currentPlaylistId) return;

  while (isStreaming) {
    if (isPaused) {
      console.log("⏸️ Streaming paused...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }

    const playlist = await playlistService.playNext(currentPlaylistId);
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
    await writeSilenceToFifo();
    await writeToFifo(audioUrl);
  }
};

// ▶️ Start stream
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

  currentPlaylistId = playlistId;
  isStreaming = true;
  isPaused = false;

  res.status(200).send("Starting Icecast stream...");

  try {
    ensureFifoExists();
    if (!ffmpegProcess) startFfmpegStream();

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
    await writeToFifo(firstUrl);
    streamPlaylistLoop(); // no await – continues loop
  } catch (err) {
    console.error("❌ Stream crashed:", err);
    isStreaming = false;
  }
};

// ⏸️ Pause stream
export const pauseStream = (req: Request, res: Response) => {
  if (currentSongProcess) {
    currentSongProcess.kill("SIGKILL");
    currentSongProcess = null;
  }

  isPaused = true;
  console.log("⏸️ Stream paused");
  res.status(200).send("Paused stream");
};

// ▶️ Resume stream
export const resumeStream = async (req: Request, res: Response) => {
  if (!isPaused || !currentPlaylistId) {
    res.status(400).send("Cannot resume");
    return;
  }

  isPaused = false;
  console.log("▶️ Resuming stream...");
  streamPlaylistLoop();
  res.status(200).send("Resumed stream");
};

// ⏭️ Skip current song
export const skipSong = (req: Request, res: Response) => {
  if (currentSongProcess) {
    console.log("⏭️ Skipping song");
    currentSongProcess.kill("SIGKILL");

    if (currentResolve) {
      currentResolve(); // Allow the loop to continue
      currentResolve = null;
    }

    res.status(200).send("Skipped song");
  } else {
    res.status(400).send("No song is currently playing");
  }
};
