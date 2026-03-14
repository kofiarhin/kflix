import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const getPosterUrl = (posterPath) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "https://via.placeholder.com/500x750?text=No+Image";
  };

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = query
          ? `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=${page}`
          : `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`;

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
  }, [page, query]);

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

  const handleClearSearch = () => {
    setSearch("");
    setQuery("");
    setPage(1);
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="mb-2 text-2xl font-bold">
        {query ? `Series Results for "${query}"` : "Popular Series"}
      </h1>

      <p className="mb-6 text-sm text-gray-400">
        Page {page} of {totalPages}
      </p>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search series..."
          className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-3 outline-none"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg border border-white/20 px-5 py-3 font-medium"
          >
            Search
          </button>

          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-lg border border-white/20 px-5 py-3 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {series.length === 0 ? (
        <p>No series found.</p>
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
