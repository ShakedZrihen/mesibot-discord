import { Playlist } from "../../models/Playlist";

export const play = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);

  if (!playlist || playlist.songs.length === 0) {
    return null;
  }

  // ✅ Sort songs by rank (highest ranked first)
  playlist.songs.sort((a, b) => b.rank - a.rank);

  // ✅ Shuffle songs (Fisher-Yates Shuffle)
  const shuffledSongs = [...playlist.songs];

  for (let i = shuffledSongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
  }

  playlist.queue = [] as any;
  playlist.played = [] as any;

  // Move shuffled songs to queue
  playlist.queue.push(...shuffledSongs);

  // Set first song as `currentPlaying`
  playlist.currentPlaying = playlist.queue.shift() || null;

  await playlist.save();

  return playlist;
};
