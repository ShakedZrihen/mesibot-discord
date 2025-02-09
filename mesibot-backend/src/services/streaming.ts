import { createAudioResource, AudioPlayerStatus, StreamType, demuxProbe } from "@discordjs/voice";
import { spawn } from "child_process";
import { PassThrough, Readable } from "stream";
import { PROXY_PASSWORD, PROXY_USERNAME } from "../env";

const PROXY_URL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`;

// Silence Opus Packet (Needed for Discord)
const silenceFrame = Buffer.from([0xf8, 0xff, 0xfe]);
const silence = new Readable({
  read() {
    this.push(silenceFrame);
    this.destroy();
  }
});

/**
 * Plays an audio file from a given URL.
 * Streams the audio directly to Discord.
 */
export const playAudio = async (player: any, url: string) => {
  try {
    console.log("▶️ Playing song:", url);

    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const { stream, type } = await demuxProbe(audioStream);
    const audioResource = createAudioResource(stream, { inputType: type });

    console.log("🔄 Sending silence first to prevent early cut-off...");

    // ✅ Send 1-second silence before playing real audio (fix for Discord issues)
    player.play(createAudioResource(silence, { inputType: StreamType.OggOpus }));

    setTimeout(() => {
      console.log("▶️ Now playing actual audio...");
      player.play(audioResource);
    }, 1000);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("✅ Discord bot is now playing!");
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("⏹️ Audio Finished!");
    });

    player.on("error", (error: any) => {
      console.error("❌ Audio Player Error:", error);
    });

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
    console.log("▶️ Playing song:", url);

    const audioStream = await fetchAudioStream(url);
    if (!audioStream) {
      throw new Error("No valid audio stream found.");
    }

    console.log("🎵 Audio stream fetched successfully!");

    const { stream, type } = await demuxProbe(audioStream);
    const audioResource = createAudioResource(stream, { inputType: type });

    console.log("🔄 Sending silence first to prevent early cut-off...");

    player.play(createAudioResource(silence, { inputType: StreamType.OggOpus }));

    setTimeout(() => {
      console.log("▶️ Now playing actual audio...");
      player.play(audioResource);
    }, 1000);

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
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    process.stdout.pipe(stream);

    process.stderr.on("data", (data) => {
      console.error("❌ yt-dlp Error:", data.toString());
    });

    process.on("close", (code) => {
      if (code !== 0) {
        console.error(`❌ yt-dlp exited with error code ${code}`);
      }
    });

    return stream;
  } catch (error) {
    console.error("❌ Error fetching audio stream:", error);
    return null;
  }
};
