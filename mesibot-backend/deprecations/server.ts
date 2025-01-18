import express, { Request, Response } from "express";
import youtubedl from "youtube-dl-exec";
import ytpl from "ytpl";
import { WebSocketServer } from "ws";
import { PassThrough } from "stream";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

dotenv.config();

const PLAYLIST_ID = "PLKJ7jK6jEw19rzijiSn6GUkUFfqJ46Zrt";
const app = express();
app.use(cors({ origin: "*", methods: ["GET"] }));

// ✅ Create HTTP Server & WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let playlist: string[] = [];
let currentTrackIndex = 1;
let songStartTime: number | null = null;
let globalStream: PassThrough | null = null;

// ✅ Fetch YouTube Playlist
const fetchPlaylist = async () => {
  try {
    console.log("🔄 Fetching playlist...");
    const playlistData = await ytpl(PLAYLIST_ID);
    playlist = playlistData.items.map((item) => item.id);
    console.log(`✅ Loaded ${playlist.length} songs.`);
  } catch (error) {
    console.error("❌ Error fetching playlist:", error);
  }
};

// ✅ Get next song from playlist
const getNextSong = (): string => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  songStartTime = Date.now(); // ⏳ Track when the song started
  return playlist[currentTrackIndex];
};

// ✅ Start streaming the next song
const createStream = async () => {
  const videoId = getNextSong();
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`🎵 Now Playing: ${videoId}`);

  // ✅ Ensure any previous stream is closed
  if (globalStream) {
    globalStream.end();
  }

  globalStream = new PassThrough();

  try {
    console.log("🔄 Fetching audio stream with `youtube-dl-exec`...");

    // ✅ Use `exec()` to get a `ChildProcess` with `.stdout`
    const process = youtubedl.exec(videoUrl, {
      format: "bestaudio",
      audioFormat: "mp3",
      output: "-",
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
    });

    console.log("✅ Audio stream fetched. Streaming now...");

    // ✅ Ensure stdout exists before piping
    if (!process.stdout) {
      throw new Error("❌ No audio stream returned by youtube-dl.");
    }

    process.stdout.pipe(globalStream);

    process.on("close", () => {
      console.log("🎵 Song finished. Playing next song...");
      globalStream?.end(); // ✅ Ensure stream ends before next song
      setTimeout(createStream, 2000);
    });

    process.on("error", (error) => {
      console.error("❌ Error streaming audio:", error);
      setTimeout(createStream, 2000);
    });

  } catch (error) {
    console.error("❌ Error starting stream:", error);
    setTimeout(createStream, 2000);
  }
};

// ✅ Serve the audio stream with correct position
app.get("/stream", async (req: Request, res: Response) => {
  console.log("🔄 Received request for audio stream...");

  if (!globalStream) {
    console.error("❌ No active stream available.");
    res.status(500).send("Radio stream not initialized.");
    return;
  }

  res.setHeader("Content-Type", "audio/mpeg");

  const elapsedTime = Math.floor((Date.now() - (songStartTime || 0)) / 1000);
  console.log(`🔄 New listener joined. Syncing at ${elapsedTime}s`);

  const videoId = playlist[currentTrackIndex];
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    console.log(`🎵 Fetching stream from YouTube at ${elapsedTime}s`);

    // ✅ Use `exec()` for time-synced streaming
    const process = youtubedl.exec(videoUrl, {
      format: "bestaudio",
      audioFormat: "mp3",
      output: "-",
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
      downloadSections: `*${elapsedTime}-`, // 🔥 Sync new users to the current position
    });

    console.log("✅ Audio stream started sending data...");

    // ✅ Ensure stdout exists before piping
    if (!process.stdout) {
      throw new Error("❌ No audio stream returned by youtube-dl.");
    }

    process.stdout.pipe(res);
  } catch (error) {
    console.error("❌ Error streaming video:", error);
    res.status(500).send("Error streaming the audio.");
  }
});

// ✅ Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("📡 New WebSocket client connected.");

  ws.on("close", () => console.log("❌ WebSocket client disconnected."));
  ws.on("error", (err) => console.error("⚠️ WebSocket error:", err));

  // Send current song info to clients
  if (playlist.length > 0) {
    ws.send(JSON.stringify({ id: playlist[currentTrackIndex], startTime: songStartTime }));
  }

  // ✅ Keep WebSocket alive with heartbeat
  const keepAlive = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    } else {
      clearInterval(keepAlive);
    }
  }, 10000);
});

console.log("🚀 WebSocket server running");

// ✅ Start the HTTP server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ Load playlist and start radio
fetchPlaylist().then(() => {
  console.log("📻 Playlist loaded, starting radio...");
  createStream();
});