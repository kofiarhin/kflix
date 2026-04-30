import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const RATING_OPTIONS = ["", "5", "6", "7", "8"];

const CatalogSkeleton = ({ label }) => (
  <div className="catalog-page-shell">
    <section className="catalog-hero catalog-skeleton-hero">
      <div>
        <div className="skeleton-line h-3 w-28" />
        <div className="skeleton-line mt-5 h-12 w-full max-w-xl" />
        <div className="skeleton-line mt-4 h-4 w-full max-w-lg" />
      </div>
      <div className="hidden md:grid">
        <div className="skeleton-poster" />
      </div>
    </section>

    <div className="catalog-toolbar">
      <div className="skeleton-line h-12 w-full" />
      <div className="skeleton-line h-12 w-full" />
      <div className="skeleton-line h-12 w-full" />
    </div>

    <div className="catalog-grid" aria-label={`Loading ${label}`}>
      {Array.from({ length: 8 }, (_, index) => (
        <div className="catalog-card catalog-card-skeleton" key={index}>
          <div className="skeleton-poster" />
          <div className="p-4">
            <div className="skeleton-line h-5 w-3/4" />
            <div className="skeleton-line mt-3 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const getPosterUrl = (posterPath) => {
  return posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://picsum.photos/seed/kflix-catalog-placeholder/500/750";
};

const formatDate = (date) => {
  if (!date) return "Release date TBA";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
  }).format(new Date(`${date}T00:00:00`));
};

const CatalogPage = ({
  browseEndpoint,
  detailBasePath,
  emptyLabel,
  genres,
  mediaLabel,
  pageEyebrow,
  searchEndpoint,
  sortOptions,
  titleKey,
  dateKey,
  yearParam,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
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
    return genres.find((item) => String(item.id) === genre)?.name || "";
  }, [genre, genres]);

  const isSearchMode = Boolean(query);

  const heading = useMemo(() => {
    if (isSearchMode) {
      return {
        title: "Search Results",
        subtitle: `Results for "${query}"`,
      };
    }

    if (sortBy === "vote_average.desc") {
      return {
        title: `Top Rated ${mediaLabel}`,
        subtitle: `Highly rated ${mediaLabel.toLowerCase()} with stronger audience scores.`,
      };
    }

    const filterParts = [
      selectedGenreName,
      year && `from ${year}`,
      rating && `rated ${rating}+`,
    ].filter(Boolean);

    if (filterParts.length) {
      return {
        title: selectedGenreName ? `${selectedGenreName} ${mediaLabel}` : `${mediaLabel} Finder`,
        subtitle: `Showing ${filterParts.join(" ")}.`,
      };
    }

    return {
      title: `Popular ${mediaLabel}`,
      subtitle: `Browse the ${mediaLabel.toLowerCase()} people are watching now.`,
    };
  }, [isSearchMode, mediaLabel, query, rating, selectedGenreName, sortBy, year]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = isSearchMode
          ? `${searchEndpoint}?query=${encodeURIComponent(query)}&language=en-US&page=${page}`
          : `${browseEndpoint}?language=en-US&page=${page}&sort_by=${sortBy}${genre ? `&with_genres=${genre}` : ""}${year ? `&${yearParam}=${year}` : ""}${rating ? `&vote_average.gte=${rating}` : ""}`;

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
            accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${mediaLabel.toLowerCase()}`);
        }

        const data = await res.json();
        setItems(data.results || []);
        setTotalPages(data.total_pages ? Math.min(data.total_pages, 500) : 1);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [
    browseEndpoint,
    genre,
    isSearchMode,
    mediaLabel,
    page,
    query,
    rating,
    searchEndpoint,
    sortBy,
    year,
    yearParam,
  ]);

  const featured = items.find((item) => item.backdrop_path || item.poster_path) || items[0];
  const activeFilterCount = [query, genre, year, rating, sortBy !== "popularity.desc"].filter(Boolean).length;

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
    const trimmedSearch = search.trim();
    setPage(1);
    setQuery(trimmedSearch);
    setSearchParams(trimmedSearch ? { search: trimmedSearch } : {});
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setQuery("");
    setSearchParams({});
    setSortBy("popularity.desc");
    setGenre("");
    setYear("");
    setRating("");
    setPage(1);
  };

  if (loading) return <CatalogSkeleton label={mediaLabel} />;

  return (
    <div className="catalog-page-shell">
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="eyebrow mb-3">{pageEyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-none tracking-tight text-white md:text-6xl">
            {heading.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            {heading.subtitle} Page {page} of {totalPages}.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            <span className="catalog-stat">
              <span>{items.length}</span>
              results
            </span>
            <span className="catalog-stat">
              <span>{activeFilterCount}</span>
              active filters
            </span>
          </div>
        </div>

        {featured && (
          <Link
            to={`${detailBasePath}/${featured.id}`}
            className="catalog-feature"
            aria-label={`View ${featured[titleKey]}`}
          >
            <img
              src={getPosterUrl(featured.poster_path)}
              alt={featured[titleKey]}
              className="h-full w-full object-cover"
            />
            <div className="catalog-feature-copy">
              <span>{formatDate(featured[dateKey])}</span>
              <strong>{featured[titleKey]}</strong>
            </div>
          </Link>
        )}
      </section>

      <form onSubmit={handleSearchSubmit} className="catalog-toolbar">
        <div className="catalog-search">
          <label htmlFor={`${emptyLabel}-search`} className="sr-only">
            Search {emptyLabel}
          </label>
          <input
            id={`${emptyLabel}-search`}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${emptyLabel}...`}
            className="field-control catalog-search-input"
          />
          <button type="submit" className="primary-action catalog-search-button">
            Search
          </button>
        </div>

        <label className="catalog-filter">
          <span>Sort</span>
          <select value={sortBy} onChange={handleFilterChange(setSortBy)} className="field-control">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filter">
          <span>Genre</span>
          <select value={genre} onChange={handleFilterChange(setGenre)} className="field-control">
            <option value="">All Genres</option>
            {genres.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filter">
          <span>Year</span>
          <select value={year} onChange={handleFilterChange(setYear)} className="field-control">
            <option value="">All Years</option>
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filter">
          <span>Rating</span>
          <select value={rating} onChange={handleFilterChange(setRating)} className="field-control">
            <option value="">Any Rating</option>
            {RATING_OPTIONS.filter(Boolean).map((ratingOption) => (
              <option key={ratingOption} value={ratingOption}>
                {ratingOption}+
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={handleResetFilters} className="secondary-action catalog-reset">
          Reset
        </button>
      </form>

      {error ? (
        <div className="catalog-state-panel" role="alert">
          <p className="eyebrow mb-3">Unable to load</p>
          <h2>Catalog is unavailable</h2>
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="catalog-state-panel">
          <p className="eyebrow mb-3">No matches</p>
          <h2>No {emptyLabel} found</h2>
          <p>
            {isSearchMode
              ? `No results matched "${query}". Try a different title or clear filters.`
              : "No titles match these filters. Try broadening the genre, year, or rating."}
          </p>
        </div>
      ) : (
        <div className="catalog-grid">
          {items.map((item, index) => (
            <Link
              to={`${detailBasePath}/${item.id}`}
              key={item.id}
              className="catalog-card"
              style={{ "--index": index }}
            >
              <div className="catalog-poster-wrap">
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={item[titleKey]}
                  className="aspect-[2/3] w-full object-cover"
                  loading="lazy"
                />
                <span className="catalog-rating">{item.vote_average?.toFixed(1) || "NR"}</span>
              </div>

              <div className="catalog-card-copy">
                <h2>{item[titleKey]}</h2>
                <p className="catalog-date">{formatDate(item[dateKey])}</p>
                <p className="catalog-overview">{item.overview || "Synopsis unavailable."}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <nav className="catalog-pagination" aria-label={`${mediaLabel} pagination`}>
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="secondary-action disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="secondary-action disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default CatalogPage;
