import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Request, Response } from "express";
import { fetchAudioUrl } from "../../services/streaming";
import { playlistService } from "../../services/playlist";
import { Party } from "../../models/Party";

let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
let isStreaming = false;

// 🔊 Stream 2 seconds of silence + song in one FFmpeg session
const streamWithSilence = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpegProcess = spawn("ffmpeg", [
      // Silence input
      "-f",
      "lavfi",
      "-t",
      "2",
      "-i",
      "anullsrc=r=44100:cl=stereo",
      // Song input
      "-i",
      url,
      // Combine silence + song
      "-filter_complex",
      "[0][1]concat=n=2:v=0:a=1[outa]",
      "-map",
      "[outa]",
      // Output settings
      "-c:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "-ar",
      "44100",
      "-f",
      "mp3",
      // Icecast output
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

// 🔁 Recursive loop: stream each song with silence
const playNextSongLoop = async (playlistId: string) => {
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
    return playNextSongLoop(playlistId);
  }

  console.log("🎵 Now streaming:", next.title);
  await streamWithSilence(audioUrl);
  await playNextSongLoop(playlistId);
};

// 🎧 API endpoint
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
    await streamWithSilence(firstAudioUrl);
    await playNextSongLoop(playlistId);
  } catch (error) {
    console.error("❌ Stream crashed:", error);
    isStreaming = false;
  }
};
