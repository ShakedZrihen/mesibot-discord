import { useState, useEffect } from "react";
import { User, AppContext } from "./AppContext";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectedUser, setConnectedUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setConnectedUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (user: User) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    setConnectedUser(user);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setConnectedUser(null);
  };

  return <AppContext.Provider value={{ connectedUser, login, logout }}>{children}</AppContext.Provider>;
};
