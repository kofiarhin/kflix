import { Link } from "react-router-dom";

const ContentSection = ({ title, items, type, getPosterUrl, viewAllLink }) => {
  return (
    <section className="px-1">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Curated shelf</p>
          <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
        </div>

        <Link
          to={viewAllLink}
          className="secondary-action px-4 py-2"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="media-card group"
          >
            <img
              src={getPosterUrl(item.poster_path)}
              alt={type === "movie" ? item.title : item.name}
              className="aspect-[2/3] w-full object-cover"
            />

            <div className="p-4">
              <h3 className="line-clamp-1 font-bold tracking-tight text-white">
                {type === "movie" ? item.title : item.name}
              </h3>

              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {type === "movie"
                  ? item.release_date || "N/A"
                  : item.first_air_date || "N/A"}
              </p>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
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
