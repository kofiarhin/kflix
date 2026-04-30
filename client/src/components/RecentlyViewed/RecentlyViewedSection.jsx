import { Link } from "react-router-dom";
import { useRecentlyViewed } from "../../context/RecentlyViewedContext";

const DISPLAY_LIMIT = 5;

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

const RecentlyViewedSection = () => {
  const { recentlyViewed } = useRecentlyViewed();
  const items = recentlyViewed.slice(0, DISPLAY_LIMIT);

  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-2xl font-black tracking-tight">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <Link
            key={`${item.mediaType}-${item.tmdbId}`}
            to={detailsPath(item)}
            className="media-card"
          >
            <img
              src={posterUrl(item.posterPath)}
              alt={item.title}
              className="aspect-[2/3] w-full object-cover"
            />
            <div className="p-4">
              <h3 className="line-clamp-1 font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {item.releaseDate || "N/A"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedSection;
