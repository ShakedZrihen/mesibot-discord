import { Request, Response } from "express";
import { playlistService } from "../../../services/playlist";
import { Party } from "../../../models/Party";
import { wsManager } from "../../..";

export const getPartyPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params;
    const party = await Party.findById(partyId).populate("playlist");

    if (!party) {
      res.status(404).json({ error: "Party not found" });
      return;
    }

    res.status(200).json(party.playlist);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  const { title, url, youtubeId, playlistId, addedBy, introUrl } = req.body;
  const { partyId } = req.params;

  if (!title || !url || !youtubeId || !playlistId || !addedBy) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.addSong(title, url, youtubeId, playlistId, addedBy, introUrl);
    wsManager.notifyPlaylistUpdate(partyId, playlist.queue, playlist.currentPlaying, playlist.played);

    res.status(201).json({ message: "Song added successfully", playlist });
  } catch (error) {
    console.error("Error adding song:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const upvoteSongInPlaylist = async (req: Request, res: Response) => {
  const { playlistId, songId, userId } = req.body;
  const { partyId } = req.params;

  if (!playlistId || !songId || !userId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.upvoteSong(playlistId, songId, userId);
    if (playlist) {
      wsManager.notifyPlaylistUpdate(partyId, playlist.queue, playlist.currentPlaying, playlist.played);
    }

    res.json({ message: "Upvoted successfully", playlist });
  } catch (error) {
    console.error("❌ Error upvoting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const downvoteSontInPlaylist = async (req: Request, res: Response) => {
  const { playlistId, songId, userId } = req.body;
  const { partyId } = req.params;

  if (!playlistId || !songId || !userId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const playlist = await playlistService.downvoteSong(playlistId, songId, userId, partyId);

    if (playlist) {
      wsManager.notifyPlaylistUpdate(partyId, playlist.queue, playlist.currentPlaying, playlist.played);
    }

    res.json({ message: "Downvoted successfully", playlist });
  } catch (error) {
    console.error("❌ Error downvoting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// playlistRouter.post("/:id/play", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const playlist = await playlistService.play(id);
//     res.status(200).json({ message: "Playlist started", playlist });
//   } catch (error) {
//     console.error("❌ Error starting playlist:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// playlistRouter.post("/:id/next", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const playlist = await playlistService.playNext(id);
//     res.status(200).json({ message: "Next song is now playing", playlist });
//   } catch (error) {
//     console.error("❌ Error skipping to next song:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// playlistRouter.post("/:id/clear", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const playlist = await playlistService.clear(id);

//     if (!playlist) {
//       res.status(404).json({ error: "Playlist not found" });
//       return;
//     }

//     res.status(200).json({ message: "Queue cleared", playlist });
//   } catch (error) {
//     console.error("❌ Error clearing queue:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// playlistRouter.post("/:id/reset", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const playlist = await playlistService.reset(id);

//     if (!playlist) {
//       res.status(404).json({ error: "Playlist not found" });
//       return;
//     }

//     res.status(200).json({ message: "Playlist rankings reset", playlist });
//   } catch (error) {
//     console.error("❌ Error resetting rankings:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
