import { createAudioResource, AudioPlayerStatus, StreamType, demuxProbe } from "@discordjs/voice";
import { spawn } from "child_process";
import { PassThrough } from "stream";
import { PROXY_PASSWORD, PROXY_USERNAME } from "../env";

const PROXY_URL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`;

/**
 * Plays an audio file from a given URL.
 * Streams the audio directly to Discord.
 */
export const playAudio = async (player: any, url: string) => {
  try {
    console.log("🎧 Fetching audio stream:", url);

    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const { stream, type } = await demuxProbe(audioStream);
    const audioResource = createAudioResource(stream, { inputType: type });

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
 * Plays an audio file and triggers an action when it ends.
 */
export const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    console.log("🎧 Fetching audio stream:", url);

    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const { stream, type } = await demuxProbe(audioStream);
    const audioResource = createAudioResource(stream, { inputType: type });

    player.play(audioResource);
    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};

/**
 * Fetches an audio stream from YouTube and pipes it to Discord.
 */
export const fetchAudioStream = async (url: string): Promise<PassThrough | null> => {
  try {
    console.log("🎧 Fetching stream via yt-dlp...");

    const stream = new PassThrough();

    // ✅ Spawn yt-dlp process to stream audio
    const process = spawn(
      "yt-dlp",
      [
        "-f",
        "bestaudio",
        "--no-playlist",
        "--no-check-certificate",
        "--youtube-skip-dash-manifest",
        "--no-warnings",
        "--prefer-free-formats",
        "--add-header",
        "referer:youtube.com",
        "--proxy",
        PROXY_URL,
        "-o",
        "-", // ✅ Outputs raw audio to stdout
        url
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    process.stdout.pipe(stream);

    process.on("error", (error) => {
      console.error("❌ yt-dlp error:", error);
    });

    return stream;
  } catch (error) {
    console.error("❌ Error fetching audio stream:", error);
    return null;
  }
};
