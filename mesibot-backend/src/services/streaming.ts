import { createAudioResource, AudioPlayerStatus, StreamType } from "@discordjs/voice";
import youtubedl from "youtube-dl-exec";
import { spawn } from "child_process";

/**
 * Helper function to play an audio file from a given URL.
 * Waits until the audio ends before resolving.
 */
export const playAudio = async (player: any, url: string) => {
  try {
    const videoInfo = await fetchAudioUrl(url);

    if (!videoInfo) {
      throw new Error("No valid formats found.");
    }

    const audioResource = fetchAudioResource(videoInfo);
    console.log({ audioResource });
    player.play(audioResource);

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
    const videoInfo = await fetchAudioUrl(url);

    if (!videoInfo) {
      throw new Error("No valid formats found.");
    }

    const audioResource = fetchAudioResource(videoInfo);
    console.log({ audioResource });

    player.play(audioResource);

    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};

/**
 * Fetches the best low-quality audio format from a YouTube URL.
 */
export const fetchAudioUrl = async (url: string): Promise<string | null> => {
  try {
    const videoInfo = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
      addHeader: ["referer:youtube.com", "user-agent:googlebot"]
    })) as any;

    console.log({ videoInfo });

    if (!videoInfo || !videoInfo.formats) {
      return null;
    }

    // ✅ Pick the lowest quality audio format
    let selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none" && f.abr <= 50);
    if (!selectedFormat) {
      selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");
    }

    console.log("selectedFormat", selectedFormat);

    return selectedFormat ? selectedFormat.url : null;
  } catch (error) {
    console.error("❌ Error fetching audio URL:", error);
    return null;
  }
};

export const fetchAudioResource = (url: string) => {
  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-reconnect",
      "1",
      "-reconnect_streamed",
      "1",
      "-reconnect_delay_max",
      "5",
      "-i",
      url,
      "-analyzeduration",
      "0",
      "-loglevel",
      "0",
      "-f",
      "opus",
      "-ar",
      "48000",
      "-ac",
      "2",
      "pipe:1"
    ],
    { stdio: ["ignore", "pipe", "ignore"] }
  );

  return createAudioResource(ffmpeg.stdout, {
    inputType: StreamType.OggOpus // This is key
  });
};
