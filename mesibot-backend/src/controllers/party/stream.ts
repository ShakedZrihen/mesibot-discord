import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";
import https from "https";
import http from "http";

let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
let isStreaming = false;

// Generates 2 seconds of silence and writes it to the FFmpeg stdin
const injectSilence = (): Promise<void> => {
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

    silence.stdout.on("data", (chunk) => {
      ffmpegProcess?.stdin.write(chunk);
    });

    silence.on("close", () => resolve());
    silence.on("error", (err) => reject(err));
  });
};

// Streams a song by piping its audio to FFmpeg stdin
const streamSongToFFmpeg = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
      .get(url, (res) => {
        res.on("data", (chunk) => {
          ffmpegProcess?.stdin.write(chunk);
        });

        res.on("end", () => {
          console.log("✅ Finished sending song to FFmpeg");
          resolve();
        });

        res.on("error", reject);
      })
      .on("error", reject);
  });
};

// Recursive playlist loop with silence between songs
const streamPlaylistLoop = async (playlistId: string) => {
  while (isStreaming) {
    const playlist = await playlistService.playNext(playlistId);
    const current = playlist?.currentPlaying;

    if (!current || !current.url) {
      console.log("📭 No more songs. Injecting silence...");
      await injectSilence();
      continue;
    }

    const url = await fetchAudioUrl(current.url);
    if (!url) {
      console.warn("⚠️ Skipping song: Unable to fetch audio URL");
      continue;
    }

    console.log("🎵 Streaming song:", current.title);
    await streamSongToFFmpeg(url);
    await injectSilence();
  }

  ffmpegProcess?.stdin.end();
  ffmpegProcess = null;
};

// Starts the persistent FFmpeg stream
const startFFmpegStream = () => {
  ffmpegProcess = spawn("ffmpeg", [
    "-f",
    "mp3",
    "-i",
    "pipe:0",
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

  ffmpegProcess.stderr.on("data", (data) => {
    console.log("FFmpeg:", data.toString());
  });

  ffmpegProcess.on("close", (code) => {
    console.log("⏹️ FFmpeg process exited with code:", code);
    ffmpegProcess = null;
    isStreaming = false;
  });
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
    res.status(200).send("Already streaming to Icecast.");
    return;
  }

  isStreaming = true;
  res.status(200).send("Started streaming to Icecast.");

  try {
    startFFmpegStream();
    await streamPlaylistLoop(playlistId);
  } catch (err) {
    console.error("❌ Stream crashed:", err);
    isStreaming = false;
    ffmpegProcess?.kill("SIGINT");
  }
};
