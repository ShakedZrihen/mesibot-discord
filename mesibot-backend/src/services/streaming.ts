import { createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import playdl from "play-dl";
import { PROXY_USERNAME, PROXY_PASSWORD } from "../env";
import { setGlobalDispatcher, ProxyAgent } from "undici";

const YOUTUBE_COOKIES = `
VISITOR_PRIVACY_METADATA=CgJJTBIEGgAgPg%3D%3D; VISITOR_INFO1_LIVE=r_1Q_LtvloE; _ga=GA1.1.552369012.1721401787; _ga_2LYFVQK29H=GS1.1.1724912459.4.1.1724912522.0.0.0; PREF=volume=20&f7=4100&tz=Asia.Jerusalem&f5=20000&f4=4000000; YSC=q0qK1Lv2NbU; __Secure-ROLLOUT_TOKEN=CIHai8ndv9qtlQEQ8tXU1sG2igMY_uvBv9ypiwM%3D; HSID=AT7ij4Ek4_vStlI41; SSID=AwbL13pSOhMYIVE53; APISID=u7siox1T3Rf6COgq/A3-B3IAH4L_9IGLJn; SAPISID=YJyFfOQ81w5xUAMt/AyELwzBi3pJILGxkB; __Secure-1PAPISID=YJyFfOQ81w5xUAMt/AyELwzBi3pJILGxkB; __Secure-3PAPISID=YJyFfOQ81w5xUAMt/AyELwzBi3pJILGxkB; LOGIN_INFO=AFmmF2swRAIgEZz-szoWMj2D9yPWei3upFtRcOf1_8rAbVPrO59LqqcCICp7fYetLlWrCuQHyLjCDTGfV12KW3bAcAu4iDXoIS08:QUQ3MjNmeGg2VGtnZTBPRnFVRGVYWTVydElNQkt6UFdtWGVkVVBqTFI5aGttdDlKQzRtajJtVG9QVTJ5RXlUaXJ6LXNQZFBSVlN2SGlIZHJ0SE1TN255cjVnaERBTnpfcEhpMDV6TXpObjRrWTdjbUxGLXJOQnA2Q0JwZW15UWNJNjZJcXNZVnV5ODMzSzBfcFJXbzQ2UVVGRlJtaE5GZVBB; SID=g.a000tAjcgvUIxhSWlYJGbpsUmYtbjRGtHQ-E7Inae3H5cH0Jn4e-U22SdRT0gPJ1Vsz_AHtgngACgYKAdYSARASFQHGX2Mig8fenE2qeNKvsamqkMycChoVAUF8yKozj14qgKtNGR-jMHgevDIe0076; __Secure-1PSID=g.a000tAjcgvUIxhSWlYJGbpsUmYtbjRGtHQ-E7Inae3H5cH0Jn4e-JW0J-O1DHmEO-NQnZ8vcYgACgYKAeoSARASFQHGX2Mi-kWsBuOWrOioWyt6TJufrBoVAUF8yKqqdjx513bphDadeXklWUm60076; __Secure-3PSID=g.a000tAjcgvUIxhSWlYJGbpsUmYtbjRGtHQ-E7Inae3H5cH0Jn4e-cEpZXI2WojpCZ6XLEzNE1QACgYKARgSARASFQHGX2MiS2V2Zf4Aok2jusdHl1NXShoVAUF8yKpTK3FIgf1hrW8zePz0BCRn0076; __Secure-1PSIDTS=sidts-CjEBmiPuTfXylzoyj5zbgo5DuuSrV4PP0joZLuYCriwozYJRo4Z4iC9rjcUQEC5MhLh8EAA; __Secure-3PSIDTS=sidts-CjEBmiPuTfXylzoyj5zbgo5DuuSrV4PP0joZLuYCriwozYJRo4Z4iC9rjcUQEC5MhLh8EAA; CONSISTENCY=AKreu9sWI-NsllEAUoLsU3-0NtSbTbp8zOHxmM0AoLg-oOOG5qEKnQzLfXJ5ydiwdncBvzChHUYtKU_SEb2ghLvtJPABvBH_AASBJqqnkwwASjn8f1zuVwOkuD3sd8YOeBKPZiEmFeVR7LbNaUaA04-5; SIDCC=AKEyXzVc1QkTQC-aKSch1iB6izbvvESNAH2C60nf97EL9uMQy6WN6VlSCOSdqWM99kJNwd3CI_M; __Secure-1PSIDCC=AKEyXzV2m6t7mgnO53srnFF5ERRa8VxtpMl6YQkd7ug-2sfBeC5QS9Cr_3u3RUSkUmNZfQSgmgY; __Secure-3PSIDCC=AKEyXzW-wwUaQdjo8haJM9YU0tdIT3InuvsQeFYg3OQhT6TmGIK2b3vz_CbKNn9x8BsvxENXlJtF; ST-3opvp5=session_logininfo=AFmmF2swRAIgEZz-szoWMj2D9yPWei3upFtRcOf1_8rAbVPrO59LqqcCICp7fYetLlWrCuQHyLjCDTGfV12KW3bAcAu4iDXoIS08%3AQUQ3MjNmeGg2VGtnZTBPRnFVRGVYWTVydElNQkt6UFdtWGVkVVBqTFI5aGttdDlKQzRtajJtVG9QVTJ5RXlUaXJ6LXNQZFBSVlN2SGlIZHJ0SE1TN255cjVnaERBTnpfcEhpMDV6TXpObjRrWTdjbUxGLXJOQnA2Q0JwZW15UWNJNjZJcXNZVnV5ODMzSzBfcFJXbzQ2UVVGRlJtaE5GZVBB
`;

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
    console.log("🎧 Fetching video info via `play-dl`...");
    const videoInfo = await playdl.video_basic_info(url);
    console.log("✅ Video info:", videoInfo.video_details.title);

    const stream = await playdl.stream(url, { quality: 2 });

    const audioResource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(audioResource);

    // ✅ Log audio player state changes
    player.on(AudioPlayerStatus.Playing, () => console.log("▶️ Now Playing!"));
    player.on(AudioPlayerStatus.Idle, () => console.log("⏹️ Audio Finished!"));
    player.on("error", (error: any) => console.error("❌ Audio Player Error:", error));
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
