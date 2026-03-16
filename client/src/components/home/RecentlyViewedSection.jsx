import { Link } from "react-router-dom";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const getPosterUrl = (posterPath) => {
  return posterPath
    ? `${TMDB_IMAGE_BASE_URL}${posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Image";
};

const RecentlyViewedSection = ({ title, items, compact = false }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const sectionItems = compact ? items.slice(0, 6) : items;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className={compact ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6" : "grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6"}>
        {sectionItems.map((item) => {
          const isSeries = item.mediaType === "tv";
          const detailsPath = isSeries
            ? `/series/${item.tmdbId}`
            : `/movies/${item.tmdbId}`;

          return (
            <Link
              key={`${item.mediaType}-${item.tmdbId}`}
              to={detailsPath}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02] hover:border-red-500/40"
            >
              <img
                src={getPosterUrl(item.posterPath)}
                alt={item.title}
                className={compact ? "h-[240px] w-full object-cover" : "h-[300px] w-full object-cover"}
              />

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="line-clamp-1 font-semibold text-white">{item.title}</h3>
                  <span className="shrink-0 rounded bg-white/10 px-2 py-1 text-xs text-slate-300">
                    {isSeries ? "Series" : "Movie"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">{item.releaseDate || "N/A"}</p>

                <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                  {item.overview || "No description available."}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
