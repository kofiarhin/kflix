import { Link } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";

const posterUrl = (posterPath) => {
  return posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Image";
};

const detailsPath = (item) => {
  return item.mediaType === "movie"
    ? `/movies/${item.tmdbId}`
    : `/series/${item.tmdbId}`;
};

const Watchlist = () => {
  const { watchlist, loading, error, removeFromWatchlist } = useWatchlist();

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <span className="rounded-full border border-white/20 px-3 py-1 text-sm text-slate-300">
          {watchlist.length} saved
        </span>
      </div>

      {loading && <p className="text-slate-300">Loading watchlist...</p>}

      {!loading && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && watchlist.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-semibold">Your watchlist is empty</h2>
          <p className="mt-3 text-slate-400">
            Save movies and series from detail pages to see them here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/movies"
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-500"
            >
              Browse Movies
            </Link>
            <Link
              to="/series"
              className="rounded-lg border border-white/20 px-4 py-2 font-semibold transition hover:bg-white hover:text-slate-950"
            >
              Browse Series
            </Link>
          </div>
        </div>
      )}

      {!loading && watchlist.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {watchlist.map((item) => (
            <article
              key={`${item.mediaType}-${item.tmdbId}`}
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
            >
              <Link to={detailsPath(item)}>
                <img
                  src={posterUrl(item.posterPath)}
                  alt={item.title}
                  className="h-[380px] w-full object-cover"
                />
              </Link>

              <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="line-clamp-1 text-lg font-semibold">{item.title}</h2>
                  <span className="rounded-full border border-white/20 px-2 py-1 text-xs uppercase text-slate-300">
                    {item.mediaType}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span>{item.releaseDate || "N/A"}</span>
                  <span>⭐ {item.voteAverage ? item.voteAverage.toFixed(1) : "N/A"}</span>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-300">
                  {item.overview || "No overview available."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link
                    to={detailsPath(item)}
                    className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(item.tmdbId, item.mediaType)}
                    className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Watchlist;
