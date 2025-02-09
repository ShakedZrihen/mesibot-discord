import { createAudioResource, AudioPlayerStatus, StreamType } from "@discordjs/voice";
import { spawn } from "child_process";
import { PassThrough } from "stream";
import youtubedl from "youtube-dl-exec";
import { PROXY_USERNAME, PROXY_PASSWORD } from "../env";

const PROXY_URL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`;

/**
 * Helper function to play an audio file from a given URL using ffmpeg to stream.
 */
export const playAudio = async (player: any, url: string) => {
  try {
    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const audioResource = createAudioResource(audioStream, { inputType: StreamType.OggOpus });

    console.log("🔄 Playing audio stream...");
    player.play(audioResource);

    player.on(AudioPlayerStatus.Playing, () => console.log("▶️ Now Playing in Discord!"));
    player.on(AudioPlayerStatus.Idle, () => console.log("⏹️ Audio Finished!"));
    player.on("error", (error: any) => console.error("❌ Audio Player Error:", error));

    return new Promise<void>((resolve) => {
      player.once(AudioPlayerStatus.Idle, resolve);
    });
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
};

/**
 * Helper function to play an audio file and trigger an action when it ends.
 */
export const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const audioResource = createAudioResource(audioStream, { inputType: StreamType.OggOpus });

    console.log("🔄 Playing audio stream...");
    player.play(audioResource);
    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};

/**
 * Fetches an audio stream from YouTube using yt-dlp and pipes it through ffmpeg.
 */
export const fetchAudioStream = async (url: string): Promise<PassThrough | null> => {
  try {
    console.log("🎧 Fetching video info from yt-dlp...");

    const videoInfo = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
      noWarnings: true,
      format: "bestaudio",
      addHeader: ["referer:youtube.com"],
      proxy: `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`
    })) as any;

    if (!videoInfo || !videoInfo.formats) {
      console.error("❌ No video info found.");
      return null;
    }

    console.log("🎵 Available formats:", videoInfo.formats.map((f: any) => f.format_id).join(", "));

    // ✅ Pick the best audio format (even if it's an .m3u8 stream)
    let selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");

    if (!selectedFormat) {
      console.error("❌ No valid audio format found.");
      return null;
    }

    console.log("✅ Selected format:", selectedFormat.format_id, selectedFormat.ext, selectedFormat.url);

    return streamAudioWithFfmpeg(selectedFormat.url);
  } catch (error) {
    console.error("❌ Error fetching audio URL:", error);
    return null;
  }
};

/**
 * Uses ffmpeg to convert the .m3u8 stream into a playable format.
 */
const streamAudioWithFfmpeg = (audioUrl: string): PassThrough | null => {
  try {
    console.log("🎧 Converting stream via ffmpeg...");

    const stream = new PassThrough();

    const ffmpegProcess = spawn(
      "ffmpeg",
      [
        "-re", // Read input at native frame rate
        "-headers",
        `Referer: https://www.youtube.com/\r\nUser-Agent: Mozilla/5.0`, // ✅ Fix: Pass headers for authentication
        "-i",
        audioUrl, // Input URL from yt-dlp
        "-f",
        "opus", // Output format (Opus for Discord)
        "-ac",
        "2", // 2 audio channels
        "-b:a",
        "128k", // 128kbps audio quality
        "-ar",
        "48000", // Sample rate 48kHz (Discord requirement)
        "-loglevel",
        "error", // Hide unnecessary logs
        "-vn", // No video
        "pipe:1" // Output as stream
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    ffmpegProcess.stdout.pipe(stream);

    ffmpegProcess.on("error", (error) => {
      console.error("❌ ffmpeg Error:", error);
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ ffmpeg exited with error code ${code}`);
      }
    });

    return stream;
  } catch (error) {
    console.error("❌ Error converting audio with ffmpeg:", error);
    return null;
  }
};
