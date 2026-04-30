import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import ForYou from "./pages/ForYou/ForYou";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import Movies from "./pages/Movies/Movies";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import SeriesDetails from "./pages/SeriesDetails/SeriesDetails";
import Series from "./pages/Series/Series";
import Settings from "./pages/Settings/Settings";
import Watchlist from "./pages/Watchlist/Watchlist";

const App = () => {
  return (
    <div className="app-chrome flex min-h-[100dvh] flex-col text-white">
      <Router>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/series" element={<Series />} />
            <Route path="/series/:id" element={<SeriesDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/for-you"
              element={
                <ProtectedRoute>
                  <ForYou />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
