import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GENRES } from "../../constants/genres";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "first_air_date.asc", label: "Oldest" },
];

const RATING_OPTIONS = ["", "5", "6", "7", "8"];

const seriesGenreIds = new Set([
  16, 35, 80, 99, 18, 10751, 10762, 9648, 10759, 10763, 10764, 10765, 10766,
  10767, 10768, 37,
]);

const SERIES_GENRES = GENRES.filter((genre) => seriesGenreIds.has(genre.id));

const Series = () => {
  const [series, setSeries] = useState([]);
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
    return SERIES_GENRES.find((item) => String(item.id) === genre)?.name || "";
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
        title: "Top Rated Series",
        subtitle: "Browse highly rated series",
      };
    }

    if (selectedGenreName && year && rating) {
      return {
        title: `${selectedGenreName} Series`,
        subtitle: `Showing ${selectedGenreName} series from ${year} rated ${rating}+ or higher`,
      };
    }

    if (selectedGenreName && year) {
      return {
        title: `${selectedGenreName} Series`,
        subtitle: `Showing ${selectedGenreName} series from ${year}`,
      };
    }

    if (selectedGenreName && rating) {
      return {
        title: `${selectedGenreName} Series`,
        subtitle: `Showing ${selectedGenreName} series rated ${rating}+ or higher`,
      };
    }

    if (selectedGenreName) {
      return {
        title: `${selectedGenreName} Series`,
        subtitle: "Browse by genre",
      };
    }

    if (year) {
      return {
        title: "Series by Year",
        subtitle: `Showing series from ${year}`,
      };
    }

    if (rating) {
      return {
        title: "Series by Rating",
        subtitle: `Showing series rated ${rating}+ or higher`,
      };
    }

    return {
      title: "Popular Series",
      subtitle: "Browse trending series",
    };
  };

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = isSearchMode
          ? `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=${page}`
          : `https://api.themoviedb.org/3/discover/tv?language=en-US&page=${page}&sort_by=${sortBy}${genre ? `&with_genres=${genre}` : ""}${year ? `&first_air_date_year=${year}` : ""}${rating ? `&vote_average.gte=${rating}` : ""}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
            accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch series");
        }

        const data = await res.json();
        setSeries(data.results || []);
        setTotalPages(data.total_pages ? Math.min(data.total_pages, 500) : 1);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
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

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="mb-2 text-2xl font-bold">{heading.title}</h1>

      <p className="mb-6 text-sm text-gray-400">
        {heading.subtitle} • Page {page} of {totalPages}
      </p>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-slate-900/40 p-3"
      >
        <label htmlFor="series-search" className="sr-only">
          Search series
        </label>
        <input
          id="series-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search series..."
          className="min-w-[220px] flex-1 rounded-lg border border-white/20 bg-transparent px-4 py-3 outline-none focus:border-white/50"
        />

        <button
          type="submit"
          className="rounded-lg border border-white/20 px-5 py-3 font-medium hover:bg-white/10"
        >
          Search
        </button>

        <label htmlFor="series-sort" className="sr-only">
          Sort series
        </label>
        <select
          id="series-sort"
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

        <label htmlFor="series-genre" className="sr-only">
          Filter series by genre
        </label>
        <select
          id="series-genre"
          value={genre}
          onChange={handleFilterChange(setGenre)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-3 outline-none focus:border-white/50"
        >
          <option value="">All Genres</option>
          {SERIES_GENRES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <label htmlFor="series-year" className="sr-only">
          Filter series by year
        </label>
        <select
          id="series-year"
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

        <label htmlFor="series-rating" className="sr-only">
          Filter series by rating
        </label>
        <select
          id="series-rating"
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

      {series.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-slate-900/30 p-4">
          {isSearchMode
            ? `No series found for "${query}".`
            : "No series match these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {series.map((show) => (
            <Link
              to={`/series/${show.id}`}
              key={show.id}
              className="overflow-hidden rounded-xl border border-white/10 shadow transition hover:scale-[1.02]"
            >
              <img
                src={getPosterUrl(show.poster_path)}
                alt={show.name}
                className="h-[400px] w-full object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">{show.name}</h2>
                <p className="mt-2 text-sm">{show.first_air_date}</p>
                <p className="mt-2 line-clamp-4 text-sm">{show.overview}</p>
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

export default Series;
