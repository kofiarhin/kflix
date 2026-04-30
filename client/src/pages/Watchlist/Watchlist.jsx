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
    <section className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3">Saved library</p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">My Watchlist</h1>
        </div>
        <span className="w-fit rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200">
          {watchlist.length} saved
        </span>
      </div>

      {loading && <p className="text-slate-300">Loading watchlist...</p>}

      {!loading && error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && watchlist.length === 0 && (
        <div className="glass-panel rounded-[1.75rem] p-8 text-center">
          <h2 className="text-2xl font-black tracking-tight">Your watchlist is empty</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Save movies and series from detail pages to see them here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/movies"
              className="primary-action"
            >
              Browse Movies
            </Link>
            <Link
              to="/series"
              className="secondary-action"
            >
              Browse Series
            </Link>
          </div>
        </div>
      )}

      {!loading && watchlist.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlist.map((item) => (
            <article
              key={`${item.mediaType}-${item.tmdbId}`}
              className="media-card"
            >
              <Link to={detailsPath(item)}>
                <img
                  src={posterUrl(item.posterPath)}
                  alt={item.title}
                  className="aspect-[2/3] w-full object-cover"
                />
              </Link>

              <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="line-clamp-1 text-lg font-bold tracking-tight">{item.title}</h2>
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-1 text-xs uppercase text-slate-300">
                    {item.mediaType}
                  </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span>{item.releaseDate || "N/A"}</span>
                  <span>{item.voteAverage ? item.voteAverage.toFixed(1) : "N/A"}</span>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-slate-300">
                  {item.overview || "No overview available."}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link
                    to={detailsPath(item)}
                    className="text-sm font-bold text-red-200 transition hover:text-white"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(item.tmdbId, item.mediaType)}
                    className="rounded-full border border-red-500/35 px-3 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/15"
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
