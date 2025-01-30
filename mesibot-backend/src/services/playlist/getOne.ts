import { Playlist } from "../../models/Playlist";

export const getOne = async (id: string) => {
  const playlist = await Playlist.findById(id);

  return playlist;
};
