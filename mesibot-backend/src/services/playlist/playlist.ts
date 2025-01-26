import { Playlist } from "../../models/Playlist";

const getAll = async () => {
  const playlists = await Playlist.find().select("title _id");
  return playlists;
};

const getOne = async (id: string) => {
  const playlist = await Playlist.findById(id);
  return playlist;
};

const create = async (title: string) => {
  const newPlaylist = new Playlist({ title, songs: [], queue: [], played: [], currentPlaying: null });
  await newPlaylist.save();

  return { title: newPlaylist.title, id: newPlaylist._id };
};

const addSong = async (
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

const upvoteSong = async (playlistId: string, songId: string, userId: string) => {
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

  // Remove user from downvotedBy if they previously downvoted
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

  return playlist;
};

const downvoteSong = async (playlistId: string, songId: string, userId: string) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return;
  }

  const song = playlist.queue.id(songId);
  if (!song) {
    return;
  }

  // Check if the user has already downvoted
  if (song.downvotedBy.includes(userId)) {
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

  return playlist;
};

const play = async (playlistId: string) => {
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

  // ✅ Move shuffled songs to queue
  playlist.queue.push(...shuffledSongs);

  // ✅ Set first song as `currentPlaying`
  playlist.currentPlaying = playlist.queue.shift() || null;

  await playlist.save();
  return playlist;
};

const playNext = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);
  console.log({ playlist });
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

const reset = async (playlistId: string) => {
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

const clear = async (playlistId: string) => {
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return null;
  }

  playlist.queue = [] as any;

  await playlist.save();
  return playlist;
};

export const playlistService = {
  create,
  getAll,
  getOne,
  addSong,
  upvoteSong,
  downvoteSong,
  play,
  playNext,
  clear,
  reset
};
