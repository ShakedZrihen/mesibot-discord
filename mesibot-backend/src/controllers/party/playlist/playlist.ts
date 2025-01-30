import { Request, Response, Router } from "express";
import { playlistService } from "../../../services/playlist";

export const playlistRouter = Router();

playlistRouter.get("/", async (req, res) => {
  try {
    const playlists = await playlistService.getAll();

    res.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await playlistService.getOne(id);

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    res.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  try {
    const newPlaylist = await playlistService.create(title);
    res.status(201).json({ title: newPlaylist.title, id: newPlaylist.id });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/add-song", async (req: Request, res: Response) => {
  const { title, url, youtubeId, playlistId, addedBy, introUrl } = req.body;

  if (!title || !url || !youtubeId || !playlistId || !addedBy) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.addSong(title, url, youtubeId, playlistId, addedBy, introUrl);
    res.status(201).json({ message: "Song added successfully", playlist });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/upvote", async (req: Request, res: Response) => {
  const { playlistId, songId, userId } = req.body;

  if (!playlistId || !songId || !userId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.upvoteSong(playlistId, songId, userId);
    res.json({ message: "Upvoted successfully", playlist });
  } catch (error) {
    console.error("❌ Error upvoting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/downvote", async (req: Request, res: Response) => {
  const { playlistId, songId, userId } = req.body;

  if (!playlistId || !songId || !userId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.downvoteSong(playlistId, songId, userId);
    res.json({ message: "Downvoted successfully", playlist });
  } catch (error) {
    console.error("❌ Error downvoting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/:id/play", async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await playlistService.play(id);
    res.status(200).json({ message: "Playlist started", playlist });
  } catch (error) {
    console.error("❌ Error starting playlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/:id/next", async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await playlistService.playNext(id);
    res.status(200).json({ message: "Next song is now playing", playlist });
  } catch (error) {
    console.error("❌ Error skipping to next song:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/:id/clear", async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await playlistService.clear(id);

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    res.status(200).json({ message: "Queue cleared", playlist });
  } catch (error) {
    console.error("❌ Error clearing queue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

playlistRouter.post("/:id/reset", async (req, res) => {
  const { id } = req.params;

  try {
    const playlist = await playlistService.reset(id);

    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    res.status(200).json({ message: "Playlist rankings reset", playlist });
  } catch (error) {
    console.error("❌ Error resetting rankings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
