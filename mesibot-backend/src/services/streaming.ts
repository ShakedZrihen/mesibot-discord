import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import youtubedl from "youtube-dl-exec";
import { PROXY_PASSWORD, PROXY_USERNAME } from "../env";

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

    console.log("🎧 Fetching audio stream:", videoInfo);

    const audioResource = createAudioResource(videoInfo);
    if (!audioResource) {
      throw new Error("Failed to create audio resource.");
    }

    console.log("🎵 Audio resource created successfully!", audioResource);

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
    const videoInfo = await fetchAudioUrl(url);
    if (!videoInfo) {
      throw new Error("No valid formats found.");
    }

    console.log("🎧 Fetching audio stream:", videoInfo);

    const audioResource = createAudioResource(videoInfo);

    if (!audioResource) {
      throw new Error("Failed to create audio resource.");
    }

    console.log("🎵 Audio resource created successfully!", audioResource);

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
    console.log("🎧 Fetching video info from yt-dlp...");

    const videoInfo = (await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com"],
      proxy: `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`
    })) as any;

    if (!videoInfo || !videoInfo.formats) {
      console.error("❌ No video info found.");
      return null;
    }

    console.log("🎵 Available formats:", videoInfo.formats.map((f: any) => f.format_id).join(", "));

    // ✅ Pick a valid direct audio format (avoid HLS `.m3u8` URLs)
    let selectedFormat = videoInfo.formats.find(
      (f: any) => f.vcodec === "none" && f.acodec !== "none" && f.ext !== "m3u8"
    );

    if (!selectedFormat) {
      selectedFormat = videoInfo.formats.find((f: any) => f.vcodec === "none" && f.acodec !== "none");
    }

    if (!selectedFormat) {
      console.error("❌ No valid audio format found.");
      return null;
    }

    console.log("✅ Selected format:", selectedFormat.format_id, selectedFormat.ext, selectedFormat.url);
    return selectedFormat.url;
  } catch (error) {
    console.error("❌ Error fetching audio URL:", error);
    return null;
  }
};
