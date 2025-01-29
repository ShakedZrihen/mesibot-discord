import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import { useAppContext } from "./context/useAppContext";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";

function AppContent() {
  const { connectedUser } = useAppContext();
  return connectedUser ? <Home /> : <Login />;
}

function App() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.position = "fixed";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.position = "static";
      document.documentElement.style.width = "auto";
      document.documentElement.style.height = "auto";
    };
  }, []);

  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
