import { createContext } from "react";

export interface User {
  name: string;
  avatar: string;
}

export interface AppContextType {
  connectedUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
