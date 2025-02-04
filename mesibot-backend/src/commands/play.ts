import playdl from "play-dl";
import { createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";
import { playlistService } from "../services/playlist";
import { player } from "../clients/player";
import { wsManager } from "..";
import { readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";
import { YOUTUBE_EMAIL, YOUTUBE_PASSWORD } from "../env";

const YOUTUBE_LOGIN_URL = "https://www.youtube.com";

/**
 * Launches Puppeteer, logs into YouTube, and extracts cookies
 */
const fetchCookies = async () => {
  if (!YOUTUBE_EMAIL || !YOUTUBE_PASSWORD) {
    console.log("Email and Password are missing. abort");
  }

  console.log("🔍 Launching Puppeteer to fetch YouTube cookies...");

  const browser = await puppeteer.launch({
    headless: true, // Set to `false` for debugging (opens visible browser)
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.goto(YOUTUBE_LOGIN_URL, { waitUntil: "networkidle2" });

  console.log("🔑 Logging into YouTube...");

  // **Replace with your Google credentials (Use env variables for security)**
  await page.type('input[type="email"]', YOUTUBE_EMAIL!, { delay: 50 });
  await page.keyboard.press("Enter");

  await page.type('input[type="password"]', YOUTUBE_PASSWORD!, { delay: 50 });
  await page.keyboard.press("Enter");

  // **Wait until login is complete**
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log("✅ Logged into YouTube, extracting cookies...");

  // **Extract Cookies**
  const cookies = await page.cookies();
  const formattedCookies = cookies.map(({ name, value }) => `${name}=${value}`).join("; ");

  // **Save cookies to file**
  writeFileSync("./cookies.txt", formattedCookies, "utf8");
  console.log("🍪 Cookies saved successfully.");

  await browser.close();
};

/**
 * Reads and returns formatted cookies for `play-dl`
 */
const getFormattedCookies = (): string => {
  try {
    return readFileSync("./cookies.txt", "utf8");
  } catch (error) {
    console.error("❌ Error reading cookies file:", error);
    return "";
  }
};

export const play = async ({ req, res }: interactionPayload) => {
  const interaction = req.body;
  let connection: VoiceConnection | null = null;
  const playlistId = interaction.data.options[0]?.value;

  if (!playlistId) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Please provide a valid playlist ID." }
    });
    return;
  }

  const guild = client.guilds.cache.get(interaction.guild_id);
  const member = await guild?.members.fetch(interaction.member.user.id);

  if (!member?.voice.channel) {
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ You must be in a voice channel to use this command." }
    });
    return;
  }

  try {
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild_id,
      adapterCreator: guild?.voiceAdapterCreator as any
    });

    connection.subscribe(player);

    res.json({
      type: ResponseType.Immediate,
      data: { content: `🎉 Started playing from playlist: ${playlistId}` }
    });

    // ✅ Fetch fresh YouTube cookies
    await fetchCookies();
    const formattedCookies = getFormattedCookies();

    // ✅ Set token for play-dl with updated cookies
    playdl.setToken({
      youtube: {
        cookie: formattedCookies
      }
    });

    // ✅ Get the first song from the playlist
    const playlist = await playlistService.play(playlistId);

    if (!playlist || !playlist.currentPlaying) {
      throw new Error("No valid song found in the playlist.");
    }

    // ✅ Play the song (including intro if available)
    await playSong(player, playlistId, playlist.currentPlaying);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Error playing music." }
    });
  }
};

/**
 * Plays a song and its intro (if available), then moves to the next song.
 */
const playSong = async (player: any, playlistId: string, song: { url: string; introUrl?: string }) => {
  try {
    if (song.introUrl) {
      console.log("🎤 Playing intro:", song.introUrl);
      await playAudio(player, song.introUrl);
      console.log("🎶 Intro finished, now playing the actual song...");
    }

    console.log("▶️ Playing song:", song.url);
    await playAudioAndWaitForEnd(player, song.url, async () => {
      console.log("✅ Song finished, playing next...");
      const updatedPlaylist = await playlistService.playNext(playlistId);

      if (updatedPlaylist?.currentPlaying) {
        playSong(player, playlistId, updatedPlaylist.currentPlaying);
      } else {
        console.log("🎵 Playlist ended.");
      }
    });
  } catch (error) {
    console.error("❌ Error playing song:", error);
    const updatedPlaylist = await playlistService.playNext(playlistId);

    if (updatedPlaylist?.currentPlaying) {
      playSong(player, playlistId, updatedPlaylist.currentPlaying);
      wsManager.notifyPlaylistUpdate(playlistId, updatedPlaylist.queue, updatedPlaylist.currentPlaying);
    } else {
      console.log("🎵 Playlist ended.");
    }
  }
};

/**
 * Helper function to play an audio file from YouTube using `play-dl`.
 */
const playAudio = async (player: any, url: string) => {
  try {
    console.log("🎧 Fetching audio stream...");

    const stream = await playdl.stream(url, { quality: 2 });

    console.log("🎶 Streaming YouTube audio...");
    const audioResource = createAudioResource(stream.stream);

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
const playAudioAndWaitForEnd = async (player: any, url: string, onEnd: () => void) => {
  try {
    console.log("🎧 Fetching audio stream...");
    const stream = await playdl.stream(url);

    console.log("🎶 Streaming YouTube audio...", stream);
    const audioResource = createAudioResource(stream.stream);

    player.play(audioResource);

    player.once(AudioPlayerStatus.Idle, onEnd);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    onEnd();
  }
};
