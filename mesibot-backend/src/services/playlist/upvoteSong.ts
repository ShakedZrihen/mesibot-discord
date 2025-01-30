import { wsManager } from "../..";
import { Playlist } from "../../models/Playlist";
import { StatisticsService } from "../statistics";

export const upvoteSong = async (playlistId: string, songId: string, userId: string) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return;
  }

  const song = playlist.queue.id(songId);

  if (!song) {
    return;
  }

  // Check if the user has already upvoted
  if (song.upvotedBy.includes(userId)) {
    return;
  }

  if (song.downvotedBy.includes(userId)) {
    song.downvotes -= 1;
    song.downvotedBy = song.downvotedBy.filter((id) => id !== userId);
  }

  // Add upvote
  song.upvotes += 1;
  song.upvotedBy.push(userId);

  // Update song rank
  song.rank = song.upvotes - song.downvotes;

  // Sort queue after ranking change
  playlist.queue = playlist.queue.sort((a, b) => b.rank - a.rank);

  await playlist.save();
  wsManager.notifyPlaylistUpdate(playlistId, playlist.queue, playlist.currentPlaying);
  await StatisticsService.upVote(playlistId, songId, userId, song.upvotedBy, song.downvotedBy);

  return playlist;
};
