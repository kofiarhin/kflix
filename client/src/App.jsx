import React from "react";
import Movies from "./pages/Movies/Movies";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import Header from "./components/Header/Header";
import Series from "./pages/Series/Series";
import SeriesDetails from "./pages/SeriesDetails/SeriesDetails";

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
        </Routes>
      </Router>
    </div>
  );
};

export default App;
