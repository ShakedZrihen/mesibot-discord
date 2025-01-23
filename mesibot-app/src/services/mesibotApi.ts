import { Song } from "../types/playlist";
import axios from "axios";

const BASE_URL = "http://mesibot-be.ngrok.io";
const PLAYLIST_ID = "6791fbc7af2c84b2749be56d";
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

export const addSongToPlaylist = async (song: Song, addedBy: { avatar: string; name: string }) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.addSong}`, {
    title: song.title,
    uri: song.url,
    youtubeId: song.youtubeId,
    addedBy,
    playlistId: PLAYLIST_ID // TODO: make it dynamic
  });

  return response.data;
};

export const getPlaylistSongs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}${API_PATHS.playlist}/${PLAYLIST_ID}`);
    console.log("🎵 Playlist songs:", response.data);
    return response.data?.songs;
  } catch (error) {
    console.error("❌ Error fetching songs:", error);
  }
};

export const upvoteSong = async (songId: string, rateBy: { avatar: string; name: string } | null) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.playlist}/upvote`, {
    songId,
    rateBy,
    playlistId: PLAYLIST_ID
  });

  return response.data;
};

export const downvoteSong = async (songId: string, rateBy: { avatar: string; name: string } | null) => {
  const response = await axios.post(`${BASE_URL}${API_PATHS.playlist}/downvote`, {
    songId,
    rateBy,
    playlistId: PLAYLIST_ID
  });

  return response.data;
};
