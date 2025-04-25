import { Playlist } from "../../models/Playlist";
import { StatisticsService } from "../statistics";
import { skip } from "./skip";

export const downvoteSong = async (playlistId: string, songId: string, userId: string) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    console.log("(Playlists) No playlist");
    return;
  }

  const song = playlist.queue.id(songId);
  const cuurentSong: any = playlist.currentPlaying;

  if (cuurentSong._id.toString() === songId) {
    // Remove user from upvotedBy if they previously upvoted
    if (cuurentSong.upvotedBy.includes(userId)) {
      cuurentSong.upvotes -= 1;
      cuurentSong.upvotedBy = cuurentSong.upvotedBy.filter((id: string) => id !== userId);
    }

    // Add downvote
    cuurentSong.downvotes += 1;
    cuurentSong.downvotedBy.push(userId);

    if (cuurentSong.downvotes > 2) {
      console.log("Skipping");
      return skip();
    }

    // Update song rank
    cuurentSong.rank = cuurentSong.upvotes - cuurentSong.downvotes;
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
