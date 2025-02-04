import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import playdl from "play-dl";
import { PROXY_USERNAME, PROXY_PASSWORD } from "../env";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const YOUTUBE_COOKIES =
  "VISITOR_INFO1_LIVE=r_1Q_LtvloE; SID=g.a000tAjcgvUIxhSWlYJGbpsUmYtbjRGtHQ-E7Inae3H5cH0Jn4e-U22SdRT0gPJ1Vsz_AHtgngACgYKAdYSARASFQHGX2Mig8fenE2qeNKvsamqkMycChoVAUF8yKozj14qgKtNGR-jMHgevDIe0076; HSID=AT7ij4Ek4_vStlI41; SSID=AwbL13pSOhMYIVE53; APISID=u7siox1T3Rf6COgq/A3-B3IAH4L_9IGLJn; SAPISID=YJyFfOQ81w5xUAMt/AyELwzBi3pJILGxkB;";

playdl.setToken({
  youtube: {
    cookie: YOUTUBE_COOKIES
  }
});

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
