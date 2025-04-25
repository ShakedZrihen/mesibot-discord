import { wsManager } from "../..";
import { Playlist } from "../../models/Playlist";
import { StatisticsService } from "../statistics";
import { skip } from "./skip";

export const downvoteSong = async (playlistId: string, songId: string, userId: string, partyId?: string) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    console.log("(Playlists) No playlist");
    return;
  }

  const song = playlist.queue.id(songId);
  const currentSong: any = playlist.currentPlaying;

  if (currentSong._id.toString() === songId) {
    // Remove user from upvotedBy if they previously upvoted
    if (currentSong.upvotedBy.includes(userId)) {
      currentSong.upvotes -= 1;
      currentSong.upvotedBy = currentSong.upvotedBy.filter((id: string) => id !== userId);
    }

    // Add downvote
    currentSong.downvotes += 1;
    currentSong.downvotedBy.push(userId);

    if (currentSong.downvotes > 2) {
      console.log("Skipping");
      skip();
      if (partyId) {
        wsManager.notifySongSkipped(partyId, currentSong);
      }
      return;
    }

    // Update song rank
    currentSong.rank = currentSong.upvotes - currentSong.downvotes;
  }

  if (!song) {
    console.log("(Playlists) No song found");
    return;
  }

  // Check if the user has already downvoted
  if (song.downvotedBy.includes(userId)) {
    console.log("(Playlists) Already downvoted");
    return;
  }

  // Remove user from upvotedBy if they previously upvoted
  if (song.upvotedBy.includes(userId)) {
    song.upvotes -= 1;
    song.upvotedBy = song.upvotedBy.filter((id) => id !== userId);
  }

  // Add downvote
  song.downvotes += 1;
  song.downvotedBy.push(userId);

  // Update song rank
  song.rank = song.upvotes - song.downvotes;

  // Sort queue after ranking change
  playlist.queue = playlist.queue.sort((a, b) => b.rank - a.rank);

  await playlist.save();
  await StatisticsService.downVote(playlistId, songId, userId, song.upvotedBy, song.downvotedBy);

  return playlist;
};
