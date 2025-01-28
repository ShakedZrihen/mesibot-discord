import { useEffect } from "react";
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
    // document.body.style.overflow = "hidden"; // ✅ Disable scrolling on the whole page
    // document.documentElement.style.overflow = "hidden"; // ✅ Ensure it works on iOS Safari
    return () => {
      document.body.style.overflow = "auto"; // ✅ Restore scrolling when unmounting
      document.documentElement.style.overflow = "auto"; // ✅ Restore on unmount
    };
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
