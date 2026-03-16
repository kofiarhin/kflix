import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PreferencesProvider>
        <WatchlistProvider>
          <RecentlyViewedProvider>
            <App />
          </RecentlyViewedProvider>
        </WatchlistProvider>
      </PreferencesProvider>
    </AuthProvider>
  </StrictMode>,
);
