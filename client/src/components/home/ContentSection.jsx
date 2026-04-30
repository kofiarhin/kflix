import { Link } from "react-router-dom";

const getItemTitle = (item, type) => (type === "movie" ? item.title : item.name);

const getItemDate = (item, type) =>
  type === "movie" ? item.release_date || "N/A" : item.first_air_date || "N/A";

const ContentSection = ({
  eyebrow = "Curated shelf",
  title,
  items,
  type,
  getPosterUrl,
  getBackdropUrl,
  viewAllLink,
}) => {
  return (
    <section className="storefront-shelf">
      <div className="storefront-shelf-header">
        <div>
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        <Link
          to={viewAllLink}
          className="storefront-view-all"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="storefront-empty">
          <h3>No titles available</h3>
          <p>This shelf will fill in when the catalog returns more results.</p>
        </div>
      ) : (
        <div className="storefront-rail" aria-label={title}>
          {items.map((item, index) => {
            const detailRoute = type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`;
            const titleText = getItemTitle(item, type);
            const releaseDate = getItemDate(item, type);
            const rating = Number(item.vote_average) || 0;
            const backdropUrl = getBackdropUrl
              ? getBackdropUrl(item.backdrop_path)
              : getPosterUrl(item.poster_path);

            return (
              <Link
                key={item.id}
                to={detailRoute}
                className="storefront-card"
                style={{ "--index": index }}
              >
                <div className="storefront-card-media">
                  <img
                    src={backdropUrl}
                    alt=""
                    className="storefront-card-backdrop"
                    aria-hidden="true"
                  />
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={titleText}
                    className="storefront-card-poster"
                  />
                  <span className="storefront-rating">
                    {rating ? rating.toFixed(1) : "N/A"}
                  </span>
                </div>

                <div className="storefront-card-copy">
                  <h3>{titleText}</h3>
                  <p className="storefront-card-meta">{releaseDate}</p>
                  <p className="storefront-card-overview">
                    {item.overview || "No description available."}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </section>
  );
};

export default ContentSection;
