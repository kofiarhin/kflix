import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GENRES } from "../../constants/genres";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
];

const RATING_OPTIONS = ["", "5", "6", "7", "8"];

const movieGenreIds = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
  10770, 53, 10752, 37,
]);

const MOVIE_GENRES = GENRES.filter((genre) => movieGenreIds.has(genre.id));

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, index) => String(currentYear - index));
  }, []);

  const selectedGenreName = useMemo(() => {
    if (!genre) return "";
    return MOVIE_GENRES.find((item) => String(item.id) === genre)?.name || "";
  }, [genre]);

  const isSearchMode = Boolean(query);

  const getPosterUrl = (posterPath) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "https://via.placeholder.com/500x750?text=No+Image";
  };

  const getHeading = () => {
    if (isSearchMode) {
      return {
        title: "Search Results",
        subtitle: `Results for "${query}"`,
      };
    }

    if (sortBy === "vote_average.desc") {
      return {
        title: "Top Rated Movies",
        subtitle: "Browse highly rated movies",
      };
    }

    if (selectedGenreName && year && rating) {
      return {
        title: `${selectedGenreName} Movies`,
        subtitle: `Showing ${selectedGenreName} movies from ${year} rated ${rating}+ or higher`,
      };
    }

    if (selectedGenreName && year) {
      return {
        title: `${selectedGenreName} Movies`,
        subtitle: `Showing ${selectedGenreName} movies from ${year}`,
      };
    }

    if (selectedGenreName && rating) {
      return {
        title: `${selectedGenreName} Movies`,
        subtitle: `Showing ${selectedGenreName} movies rated ${rating}+ or higher`,
      };
    }

    if (selectedGenreName) {
      return {
        title: `${selectedGenreName} Movies`,
        subtitle: "Browse by genre",
      };
    }

    if (year) {
      return {
        title: "Movies by Year",
        subtitle: `Showing movies from ${year}`,
      };
    }

    if (rating) {
      return {
        title: "Movies by Rating",
        subtitle: `Showing movies rated ${rating}+ or higher`,
      };
    }

    return {
      title: "Popular Movies",
      subtitle: "Browse trending movies",
    };
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = isSearchMode
          ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=${page}`
          : `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}&sort_by=${sortBy}${genre ? `&with_genres=${genre}` : ""}${year ? `&primary_release_year=${year}` : ""}${rating ? `&vote_average.gte=${rating}` : ""}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
            accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await res.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages ? Math.min(data.total_pages, 500) : 1);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, query, isSearchMode, sortBy, genre, year, rating]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setQuery("");
    setSortBy("popularity.desc");
    setGenre("");
    setYear("");
    setRating("");
    setPage(1);
  };

  const heading = getHeading();

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold">{heading.title}</h1>

      <p className="mb-6 text-sm text-gray-400">
        {heading.subtitle} • Page {page} of {totalPages}
      </p>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-slate-900/40 p-3"
      >
        <label htmlFor="movie-search" className="sr-only">
          Search movies
        </label>
        <input
          id="movie-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="min-w-[220px] flex-1 rounded-lg border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-white/50"
        />

        <button
          type="submit"
          className="rounded-lg border border-white/20 px-5 py-3 font-medium hover:bg-white/10"
        >
          Search
        </button>

        <label htmlFor="movie-sort" className="sr-only">
          Sort movies
        </label>
        <select
          id="movie-sort"
          value={sortBy}
          onChange={handleFilterChange(setSortBy)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-3 outline-none focus:border-white/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="movie-genre" className="sr-only">
          Filter movies by genre
        </label>
        <select
          id="movie-genre"
          value={genre}
          onChange={handleFilterChange(setGenre)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-3 outline-none focus:border-white/50"
        >
          <option value="">All Genres</option>
          {MOVIE_GENRES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <label htmlFor="movie-year" className="sr-only">
          Filter movies by year
        </label>
        <select
          id="movie-year"
          value={year}
          onChange={handleFilterChange(setYear)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-3 outline-none focus:border-white/50"
        >
          <option value="">All Years</option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>

        <label htmlFor="movie-rating" className="sr-only">
          Filter movies by rating
        </label>
        <select
          id="movie-rating"
          value={rating}
          onChange={handleFilterChange(setRating)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-3 outline-none focus:border-white/50"
        >
          <option value="">Any Rating</option>
          {RATING_OPTIONS.filter(Boolean).map((ratingOption) => (
            <option key={ratingOption} value={ratingOption}>
              {ratingOption}+
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleResetFilters}
          className="rounded-lg border border-white/20 px-5 py-3 font-medium hover:bg-white/10"
        >
          Reset Filters
        </button>
      </form>

      {movies.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-slate-900/30 p-4">
          {isSearchMode
            ? `No movies found for "${query}".`
            : "No movies match these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.map((movie) => (
            <Link
              to={`/movies/${movie.id}`}
              key={movie.id}
              className="overflow-hidden rounded-xl border border-white/10 shadow transition hover:scale-[1.02]"
            >
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="h-[400px] w-full object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="mt-2 text-sm">{movie.release_date}</p>
                <p className="mt-2 line-clamp-4 text-sm">{movie.overview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="rounded-lg border border-white/20 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm font-medium">
          {page} / {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="rounded-lg border border-white/20 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Movies;
