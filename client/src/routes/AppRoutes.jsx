import { Route, Routes } from 'react-router-dom';
import Header from '../components/Header/Header';
import Home from '../pages/Home/Home';
import Movies from '../pages/Movies/Movies';
import MovieDetails from '../pages/MovieDetails/MovieDetails';
import Series from '../pages/Series/Series';
import SeriesDetails from '../pages/SeriesDetails/SeriesDetails';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Profile from '../pages/Profile/Profile';
import Watchlist from '../pages/Watchlist/Watchlist';
import Settings from '../pages/Settings/Settings';
import ForYou from '../pages/ForYou/ForYou';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/movies/:id" element={<MovieDetails />} />
      <Route path="/series" element={<Series />} />
      <Route path="/series/:id" element={<SeriesDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/for-you" element={<ProtectedRoute><ForYou /></ProtectedRoute>} />
    </Routes>
  </>
);

export default AppRoutes;
