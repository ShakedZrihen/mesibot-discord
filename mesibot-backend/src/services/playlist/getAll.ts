import { Playlist } from "../../models/Playlist";

export const getAll = async () => {
  const playlists = await Playlist.find().select("title _id");

  return playlists;
};
