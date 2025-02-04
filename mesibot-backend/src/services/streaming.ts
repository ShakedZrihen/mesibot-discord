import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import playdl from "play-dl";
import { PROXY_USERNAME, PROXY_PASSWORD } from "../env";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const PROXY_URL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@geo.iproyal.com:12321`;

const proxyAgent = new ProxyAgent(PROXY_URL);
setGlobalDispatcher(proxyAgent);

export const playAudio = async (player: any, url: string) => {
  try {
    console.log("🎧 Fetching audio stream via `play-dl`...");

    // Get a valid stream
    const stream = await playdl.stream(url, { quality: 2 });

    // Create an audio resource from the stream
    const audioResource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(audioResource);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
  }
};

export const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    console.log("🎧 Fetching audio stream via `play-dl`...");

    const stream = await playdl.stream(url, { quality: 2 });

    const audioResource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(audioResource);
    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
