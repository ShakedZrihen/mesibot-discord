import { AppProvider } from "./context/AppProvider";
import { useAppContext } from "./context/useAppContext";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";

function AppContent() {
  const { connectedUser } = useAppContext();

  return connectedUser ? <Home /> : <Login />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
