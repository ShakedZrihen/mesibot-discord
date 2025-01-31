import { wsManager } from "../..";
import { Playlist } from "../../models/Playlist";
import { StatisticsService } from "../statistics";

export const downvoteSong = async (playlistId: string, songId: string, userId: string) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    console.log("(Playlists) No playlist");
    return;
  }

  const song = playlist.queue.id(songId);
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
