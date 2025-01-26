import { Song } from "../types/playlist";
import axios from "axios";

const BASE_URL = "https://mesibot-be.ngrok.io";
const API_PATHS = {
  songs: "/api/songs",
  addSong: "/api/playlists/add-song",
  playlist: "/api/playlists"
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
  { song, introUrl }: { song: Song; introUrl: string | null },
  addedBy: { avatar: string; name: string },
  playlistId: string | null
) => {
  if (!playlistId) {
    return;
  }

  console.log("🎵 Adding song to playlist:", song);
  const response = await axios.post(`${BASE_URL}${API_PATHS.addSong}`, {
    title: song.title,
    url: song.url,
    youtubeId: song.youtubeId,
    addedBy,
    introUrl,
    playlistId
  });

  return response.data;
};

export const getPlaylistSongs = async (playlistId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}${API_PATHS.playlist}/${playlistId}`);
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
  songId: string,
  rateBy: { avatar: string; name: string } | null,
  playlistId: string | null
) => {
  if (!playlistId) {
    return;
  }

  const response = await axios.post(`${BASE_URL}${API_PATHS.playlist}/upvote`, {
    songId,
    userId: rateBy?.avatar,
    playlistId
  });

  return response.data;
};

export const downvoteSong = async (
  songId: string,
  rateBy: { avatar: string; name: string } | null,
  playlistId: string | null
) => {
  if (!playlistId) {
    return;
  }

  const response = await axios.post(`${BASE_URL}${API_PATHS.playlist}/downvote`, {
    songId,
    userId: rateBy?.avatar,
    playlistId
  });

  return response.data;
};

export const getAvailablePlaylists = async () => {
  const response = await axios.get(`${BASE_URL}${API_PATHS.playlist}`);
  return response.data;
};
