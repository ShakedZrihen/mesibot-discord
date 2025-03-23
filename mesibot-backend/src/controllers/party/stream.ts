import { spawn, spawnSync, ChildProcessWithoutNullStreams } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";
import https from "https";
import http from "http";
import fs from "fs";

let isStreaming = false;
const FIFO_PATH = "/tmp/stream_input";

// 🔧 Create FIFO pipe if missing
const ensureFifoExists = () => {
  if (!fs.existsSync(FIFO_PATH)) {
    console.log("📁 FIFO not found. Creating...");
    const result = spawnSync("mkfifo", [FIFO_PATH]);
    if (result.status !== 0) {
      console.error("❌ Failed to create FIFO:", result.stderr.toString());
      throw new Error("Failed to create FIFO");
    }
    console.log("✅ FIFO created");
  }
};

// 🔊 Starts FFmpeg process that reads from FIFO and streams to Icecast
const startIcecastStream = () => {
  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-f",
    "mp3",
    "-i",
    FIFO_PATH,
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

  ffmpeg.stderr.on("data", (data) => {
    console.log("FFmpeg:", data.toString());
  });

  ffmpeg.on("close", () => {
    console.log("⏹️ FFmpeg process closed");
    isStreaming = false;
  });
};

// 🎶 Streams song audio into FIFO
const streamToFifo = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const fifo = fs.createWriteStream(FIFO_PATH, { flags: "a" });

    protocol
      .get(url, (res) => {
        res.pipe(fifo);
        res.on("end", resolve);
        res.on("error", reject);
      })
      .on("error", reject);
  });
};

// 🔇 Streams 2s silence into FIFO
const writeSilenceToFifo = (): Promise<void> => {
  return new Promise((resolve, reject) => {
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

    const fifo = fs.createWriteStream(FIFO_PATH, { flags: "a" });

    silence.stdout.pipe(fifo);
    silence.on("close", resolve);
    silence.on("error", reject);
  });
};

// 🔁 Playlist loop
const streamLoop = async (playlistId: string) => {
  while (isStreaming) {
    const playlist = await playlistService.playNext(playlistId);
    const song = playlist?.currentPlaying;

    if (!song?.url) {
      console.log("📭 No song, injecting silence");
      await writeSilenceToFifo();
      continue;
    }

    const url = await fetchAudioUrl(song.url);
    if (!url) {
      console.warn("⚠️ Could not fetch song URL. Skipping...");
      continue;
    }

    console.log("🎵 Streaming:", song.title);
    await streamToFifo(url);
    await writeSilenceToFifo();
  }
};

// 🎧 API route
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

  try {
    ensureFifoExists();

    isStreaming = true;
    res.status(200).send("Started streaming to Icecast");

    startIcecastStream();

    const playlist = await playlistService.play(playlistId);
    if (playlist?.currentPlaying?.url) {
      const url = await fetchAudioUrl(playlist.currentPlaying.url);
      if (url) await streamToFifo(url);
    }

    await streamLoop(playlistId);
  } catch (err) {
    console.error("❌ Stream startup failed:", err);
    res.status(500).send("Stream failed to start");
    isStreaming = false;
  }
};
