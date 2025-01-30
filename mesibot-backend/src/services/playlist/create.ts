import { Playlist } from "../../models/Playlist";
import { StatisticsService } from "../statistics";

export const create = async (title: string) => {
  const newPlaylist = new Playlist({ title, songs: [], queue: [], played: [], currentPlaying: null });
  await newPlaylist.save();
  await StatisticsService.create(newPlaylist._id.toString());
  return { title: newPlaylist.title, id: newPlaylist._id };
};
