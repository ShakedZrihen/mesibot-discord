import { useState, useEffect } from "react";
import { User, AppContext } from "./AppContext";
import { StorageKeys } from "../consts/storageKeys";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(localStorage.getItem(StorageKeys.PLAYLIST_ID) || null);

  useEffect(() => {
    const storedUser = localStorage.getItem(StorageKeys.USER);
    if (storedUser) {
      setConnectedUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
    setConnectedUser(user);
  };

  const logout = () => {
    localStorage.removeItem(StorageKeys.USER);
    setConnectedUser(null);
  };

  const setPlaylist = (playlistId: string) => {
    localStorage.setItem(StorageKeys.PLAYLIST_ID, playlistId);
    setPlaylistId(playlistId);
  };

  return (
    <AppContext.Provider value={{ connectedUser, login, logout, playlistId, setPlaylist }}>
      {children}
    </AppContext.Provider>
  );
};
