import { Link } from "react-router-dom";

const ContentSection = ({ title, items, type, getPosterUrl, viewAllLink }) => {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>

        <Link
          to={viewAllLink}
          className="text-sm font-medium text-red-400 transition hover:text-red-300"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02] hover:border-red-500/40"
          >
            <img
              src={getPosterUrl(item.poster_path)}
              alt={type === "movie" ? item.title : item.name}
              className="h-[300px] w-full object-cover"
            />

            <div className="p-4">
              <h3 className="line-clamp-1 font-semibold text-white">
                {type === "movie" ? item.title : item.name}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {type === "movie"
                  ? item.release_date || "N/A"
                  : item.first_air_date || "N/A"}
              </p>

              <p className="mt-2 line-clamp-3 text-sm text-slate-300">
                {item.overview || "No description available."}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContentSection;
