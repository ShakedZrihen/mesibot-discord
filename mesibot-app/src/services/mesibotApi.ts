import { BASE_DOMAIN } from "../consts/general";
import { User } from "../context/AppContext";
import { Song } from "../types/playlist";
import axios from "axios";

const BASE_URL = `http://${BASE_DOMAIN}`;
const API_PATHS = {
  songs: "/api/songs",
  parties: "/api/party",
  upvote: "/playlist/upvote",
  downvote: "/playlist/downvote",
  addSong: "/playlist/add-song",
  getGuessSong: "/games/guess-the-song/song",
  pressTheBuzzer: "/games/guess-the-song/buzzer",
  getShemkodBoard: "/games/shemkod/start",
  updateShemkodBoard: "/games/shemkod/update-word",
  nextRoundShemkod: "/games/shemkod/next-round"
};

export const searchSongs = async (searchTerm: string) => {
  try {
    const response = await fetch(`${BASE_URL}${API_PATHS.songs}?q=${searchTerm}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching songs:", error);
  }
};

export const addSongToPlaylist = async (
  partyId: string | null,
  { song, introUrl }: { song: Song; introUrl: string | null },
  addedBy: { avatar: string; name: string },
  playlistId: string | null
) => {
  if (!partyId) {
    return;
  }

  console.log("🎵 Adding song to playlist:", song);
  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.addSong}`, {
    title: song.title,
    url: song.url,
    youtubeId: song.youtubeId,
    addedBy,
    introUrl,
    playlistId
  });

  return response.data;
};

export const getPlaylistSongs = async (partyId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}${API_PATHS.parties}/${partyId}/playlist`);

    return {
      songs: response.data?.queue.length || response.data?.currentPlaying ? response.data?.queue : response.data?.songs,
      currentSong: response.data?.currentPlaying ?? null
    };
  } catch (error) {
    console.error("❌ Error fetching songs:", error);
    return { songs: [], currentSong: null };
  }
};

export const upvoteSong = async (
  partyId: string | null,
  songId: string,
  rateBy: { avatar: string; name: string } | null,
  playlistId: string | null
) => {
  if (!partyId) {
    return;
  }

  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.upvote}`, {
    songId,
    userId: rateBy?.avatar,
    playlistId
  });

  return response.data;
};

export const downvoteSong = async (
  partyId: string | null,
  songId: string,
  rateBy: { avatar: string; name: string } | null,
  playlistId: string | null
) => {
  if (!partyId) {
    return;
  }

  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.downvote}`, {
    songId,
    userId: rateBy?.avatar,
    playlistId
  });

  return response.data;
};

export const getAvailableParties = async () => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.parties}`);
  return response.data;
};

export const getParty = async (partyId: string) => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.parties}/${partyId}`);
  return response.data;
};

export const joinParty = async (partyId: string, connectedUser: User) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}/join`, {
    ...connectedUser
  });
  return response.data;
};

export const getSongForGuess = async (partyId: string) => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.getGuessSong}`);
  return response.data;
};

export const getShemkodBoard = async (partyId: string) => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.getShemkodBoard}`);
  return response.data;
};

export const updateShemkodBoard = async (partyId: string, rowIndex: number, colIndex: number) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.updateShemkodBoard}`, {
    rowIndex,
    colIndex
  });
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createParty = async ({ title, games, host }: { title: string; games: any; host: User }) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}`, {
    title,
    games,
    host
  });
  return response.data;
};

export const getAvailableGames = async () => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.parties}/games`);
  return response.data;
};

export const nextRoundShemkod = async (partyId: string) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.nextRoundShemkod}`);
  return response.data;
};

export const pressTheBuzzer = async (partyId: string, user: User | null) => {
  if (!user) {
    return;
  }
  
  if(!partyId) {
    return;
  }

  await axios.post(`${BASE_URL}${API_PATHS.parties}/${partyId}${API_PATHS.pressTheBuzzer}`, { user, partyId });
};
