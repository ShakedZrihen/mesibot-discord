import { Playlist } from "../../models/Playlist";

export const playNext = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist || !playlist.currentPlaying) {
    return null;
  }

  if (playlist.currentPlaying) {
    playlist.played.push(playlist.currentPlaying);
  }

  playlist.currentPlaying = playlist.queue.shift() || null;

  await playlist.save();

  return playlist;
};
