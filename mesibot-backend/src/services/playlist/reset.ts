import { Playlist } from "../../models/Playlist";

export const reset = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return null;
  }

  playlist.songs.forEach((song) => {
    song.upvotes = 0;
    song.downvotes = 0;
    song.rank = 0;
    song.upvotedBy = [];
    song.downvotedBy = [];
  });

  await playlist.save();

  return playlist;
};
