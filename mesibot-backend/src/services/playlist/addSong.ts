import { wsManager } from "../..";
import { Playlist } from "../../models/Playlist";

export const addSong = async (
  title: string,
  url: string,
  youtubeId: string,
  playlistId: string,
  addedBy: string,
  introUrl: string | null
) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  const existingSong = playlist.songs.find((song) => song.youtubeId === youtubeId);
  const existingSongInQueue = playlist.queue.find((song) => song.youtubeId === youtubeId);

  if (existingSong && existingSongInQueue) {
    existingSongInQueue.upvotes += 1;
    existingSongInQueue.rank = existingSongInQueue.upvotes - existingSongInQueue.downvotes;
  } else {
    playlist.songs.push({ title, url, youtubeId, upvotes: 0, downvotes: 0, rank: 0, addedBy, introUrl });
    playlist.queue.push({ title, url, youtubeId, upvotes: 0, downvotes: 0, rank: 0, addedBy, introUrl });
  }

  playlist.songs.sort((a, b) => b.rank - a.rank);
  playlist.queue.sort((a, b) => b.rank - a.rank);

  await playlist.save();

  return playlist;
};
