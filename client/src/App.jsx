import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import Movies from "./pages/Movies/Movies";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import SeriesDetails from "./pages/SeriesDetails/SeriesDetails";
import Series from "./pages/Series/Series";
import Watchlist from "./pages/Watchlist/Watchlist";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-800 container mx-auto text-white">
      <Router>
        <Header />
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
        </Routes>
      </Router>
    </div>
  );
};

export default App;
