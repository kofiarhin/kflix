import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { PreferencesProvider } from "./context/PreferencesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PreferencesProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </PreferencesProvider>
    </AuthProvider>
  </StrictMode>,
);
