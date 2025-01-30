import { useState, useEffect } from "react";
import { User, AppContext } from "./AppContext";
import { StorageKeys } from "../consts/storageKeys";
import { Party } from "../types/party";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [party, setSelectedParty] = useState<Party | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(StorageKeys.USER);
    const storedParty = localStorage.getItem(StorageKeys.PARTY);

    if (storedParty) {
      const parsedParty = JSON.parse(storedParty);
      setSelectedParty(parsedParty);
      setPlaylistId(parsedParty.playlist._id);
    }

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

  const setParty = (party: Party) => {
    localStorage.setItem(StorageKeys.PARTY, JSON.stringify(party));
    setSelectedParty(party);
    setPlaylistId(party.playlist._id);
  };

  return (
    <AppContext.Provider value={{ connectedUser, login, logout, setParty, playlistId, party }}>
      {children}
    </AppContext.Provider>
  );
};
