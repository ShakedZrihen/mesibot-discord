import { createContext } from "react";
import { Party } from "../types/party";
import { WebSocketService } from "../services/websocketService";

export interface User {
  name: string;
  avatar: string;
}

export interface AppContextType {
  connectedUser: User | null;
  playlistId: string | null;
  party: Party | null;
  setParty: (party: Party) => void;
  login: (user: User) => void;
  logout: () => void;
  websocketService: WebSocketService | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
