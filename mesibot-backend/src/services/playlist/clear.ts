import { Playlist } from "../../models/Playlist";

export const clear = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return null;
  }

  playlist.queue = [] as any;

  await playlist.save();

  return playlist;
};
