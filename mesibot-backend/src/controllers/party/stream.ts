import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";

let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
let isStreaming = false;

const playSongToIcecast = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpegProcess = spawn("ffmpeg", [
      "-re",
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
      "icecast://source:kolaculz@localhost:8000/party"
    ]);

    ffmpegProcess.stderr.on("data", (data) => {
      console.log("FFmpeg:", data.toString());
    });

    ffmpegProcess.on("close", (code) => {
      console.log("⏹️ FFmpeg stopped (code", code + ")");
      ffmpegProcess = null;
      resolve();
    });

    ffmpegProcess.on("error", (err) => {
      console.error("❌ FFmpeg error:", err);
      reject(err);
    });
  });
};

const playSilenceToIcecast = (durationSeconds: number = 2): Promise<void> => {
  return new Promise((resolve, reject) => {
    const silenceProcess = spawn("ffmpeg", [
      "-f",
      "lavfi",
      "-re",
      "-i",
      `anullsrc=r=44100:cl=stereo`,
      "-t",
      durationSeconds.toString(),
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

    silenceProcess.stderr.on("data", (data) => {
      console.log("FFmpeg (silence):", data.toString());
    });

    silenceProcess.on("close", (code) => {
      console.log("⏹️ Silence segment ended (code", code + ")");
      resolve();
    });

    silenceProcess.on("error", (err) => {
      console.error("❌ FFmpeg silence error:", err);
      reject(err);
    });
  });
};

// 🔁 Recursive playlist loop
const playNextSongToIcecast = async (playlistId: string) => {
  const playlist = await playlistService.playNext(playlistId);
  const next = playlist?.currentPlaying;

  if (!next || !next.url) {
    console.log("📭 Playlist ended or empty.");
    isStreaming = false;
    return;
  }

  const audioUrl = await fetchAudioUrl(next.url);
  if (!audioUrl) {
    console.warn("⚠️ Could not fetch song URL. Skipping...");
    return playNextSongToIcecast(playlistId);
  }

  console.log("🎵 Now streaming:", next.title);
  await playSilenceToIcecast(2); // 🔇 2 seconds of silence between songs
  await playSongToIcecast(audioUrl);
  await playNextSongToIcecast(playlistId);
};

// 🎧 API route to start the Icecast stream
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
    const playlist = await playlistService.play(playlistId);
    const current = playlist?.currentPlaying;

    if (!current || !current.url) {
      console.error("No song to start with");
      isStreaming = false;
      return;
    }

    const firstAudioUrl = await fetchAudioUrl(current.url);
    if (!firstAudioUrl) {
      console.error("Cannot fetch first song URL");
      isStreaming = false;
      return;
    }

    console.log("▶️ Starting stream with:", current.title);
    await playSongToIcecast(firstAudioUrl);
    await playNextSongToIcecast(playlistId);
  } catch (error) {
    console.error("❌ Stream crashed:", error);
    isStreaming = false;
  }
};
