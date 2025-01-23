import { Router } from "express";
import youtubedl from "youtube-dl-exec";

export const songsRouter = Router();

songsRouter.get("/", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  console.log(`🔍 Searching for songs with query: ${q}`);

  try {
    const results = (await youtubedl(`ytsearch10:${q} official audio`, {
      dumpSingleJson: true, // ✅ Ensures JSON response
      noCheckCertificates: true, // ✅ Faster request
      noWarnings: true, // ✅ Suppresses warnings
      flatPlaylist: true, // ✅ Prevents downloading

    })) as any;

    const songs = results.entries.map((item: any) => ({
      title: item.title,
      youtubeId: item.id,
      url: item.url
    }));

    res.json(songs);
  } catch (error) {
    console.error("❌ Error searching for songs:", error);
    res.status(500).json({ error: "Failed to fetch songs from YouTube" });
  }
});
