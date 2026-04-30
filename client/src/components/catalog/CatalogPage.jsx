import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const RATING_OPTIONS = ["5", "6", "7", "8"];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
    <path d="M1 1.5v11L11 7 1 1.5z" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const CatalogSkeleton = ({ label }) => (
  <div className="catalog-shell">
    <section className="catalog-hero-full">
      <div className="catalog-hero-skeleton-bg" />
      <div className="catalog-hero-vignette" />
      <div className="catalog-inner catalog-hero-body">
        <div className="catalog-hero-copy">
          <div className="skeleton-line h-3 w-24" />
          <div className="skeleton-line mt-4 h-16 w-full max-w-2xl" />
          <div className="skeleton-line mt-4 h-4 w-full max-w-md" />
          <div className="skeleton-line mt-7 h-12 w-40" style={{ borderRadius: "999px" }} />
        </div>
      </div>
    </section>
    <div className="catalog-inner">
      <div className="catalog-bar" style={{ marginTop: "1.75rem", marginBottom: "2rem" }}>
        <div className="skeleton-line h-11 flex-1" style={{ borderRadius: "0.875rem" }} />
        <div className="skeleton-line h-11 w-28" style={{ borderRadius: "0.875rem" }} />
        <div className="skeleton-line h-11 w-28" style={{ borderRadius: "0.875rem" }} />
        <div className="skeleton-line h-11 w-24" style={{ borderRadius: "0.875rem" }} />
      </div>
      <div className="catalog-grid-v2" aria-label={`Loading ${label}`}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="catalog-card-v2-skeleton">
            <div className="skeleton-poster" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const getPosterUrl = (posterPath) =>
  posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://picsum.photos/seed/kflix-catalog-placeholder/500/750";

const getBackdropUrl = (backdropPath) =>
  `https://image.tmdb.org/t/p/original${backdropPath}`;

const formatDate = (date) => {
  if (!date) return "TBA";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short" }).format(
    new Date(`${date}T00:00:00`)
  );
};

const getYear = (date) => {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).getFullYear();
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
    return Array.from({ length: 50 }, (_, i) => String(currentYear - i));
  }, []);

  const selectedGenreName = useMemo(() => {
    if (!genre) return "";
    return genres.find((g) => String(g.id) === genre)?.name || "";
  }, [genre, genres]);

  const isSearchMode = Boolean(query);

  const heading = useMemo(() => {
    if (isSearchMode) return { title: "Search Results", subtitle: `Results for "${query}"` };
    if (sortBy === "vote_average.desc") return {
      title: `Top Rated ${mediaLabel}`,
      subtitle: `Critically acclaimed ${mediaLabel.toLowerCase()} ranked by audience score.`,
    };
    const filterParts = [
      selectedGenreName,
      year && `from ${year}`,
      rating && `rated ${rating}+`,
    ].filter(Boolean);
    if (filterParts.length) return {
      title: selectedGenreName ? `${selectedGenreName} ${mediaLabel}` : `${mediaLabel} Finder`,
      subtitle: `Showing ${filterParts.join(" · ")}.`,
    };
    return {
      title: `Popular ${mediaLabel}`,
      subtitle: `What the world is watching right now.`,
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
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
            accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch ${mediaLabel.toLowerCase()}`);
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
  }, [browseEndpoint, genre, isSearchMode, mediaLabel, page, query, rating, searchEndpoint, sortBy, year, yearParam]);

  const featured = items.find((item) => item.backdrop_path) || items[0];
  const activeFilterCount = [query, genre, year, rating, sortBy !== "popularity.desc"].filter(Boolean).length;

  const handlePrevPage = () => {
    if (page > 1) { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handleNextPage = () => {
    if (page < totalPages) { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    setPage(1);
    setQuery(trimmed);
    setSearchParams(trimmed ? { search: trimmed } : {});
  };
  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const handleResetFilters = () => {
    setSearch(""); setQuery(""); setSearchParams({});
    setSortBy("popularity.desc"); setGenre(""); setYear(""); setRating(""); setPage(1);
  };

  if (loading) return <CatalogSkeleton label={mediaLabel} />;

  return (
    <div className="catalog-shell">

      {/* ─── Cinematic Hero ─────────────────────────────────── */}
      <section className="catalog-hero-full">
        {featured && (
          <img
            src={featured.backdrop_path ? getBackdropUrl(featured.backdrop_path) : getPosterUrl(featured.poster_path)}
            alt=""
            aria-hidden="true"
            className="catalog-hero-backdrop"
          />
        )}
        <div className="catalog-hero-vignette" />

        {featured?.poster_path && (
          <div className="catalog-hero-poster-pin" aria-hidden="true">
            <img src={getPosterUrl(featured.poster_path)} alt="" />
          </div>
        )}

        <div className="catalog-inner catalog-hero-body">
          <div className="catalog-hero-copy">
            <p className="eyebrow mb-4">{pageEyebrow}</p>
            <h1 className="catalog-hero-title">{heading.title}</h1>
            <p className="catalog-hero-subtitle">{heading.subtitle}</p>

            <div className="catalog-hero-meta">
              <span className="catalog-meta-chip">
                <span className="catalog-meta-number">{items.length}</span>
                titles
              </span>
              <span className="catalog-meta-divider" />
              <span className="catalog-meta-chip">
                Page {page}<span className="catalog-meta-muted"> of {totalPages}</span>
              </span>
              {activeFilterCount > 0 && (
                <>
                  <span className="catalog-meta-divider" />
                  <span className="catalog-meta-chip catalog-meta-chip--active">
                    {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                  </span>
                </>
              )}
            </div>

            {featured && (
              <Link
                to={`${detailBasePath}/${featured.id}`}
                className="catalog-hero-cta"
                aria-label={`View ${featured[titleKey]}`}
              >
                <PlayIcon />
                Play {featured[titleKey]}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Body ───────────────────────────────────────────── */}
      <div className="catalog-inner">

        {/* Filter bar */}
        <form onSubmit={handleSearchSubmit} className="catalog-bar">
          <div className="catalog-search-wrap">
            <label htmlFor={`${emptyLabel}-search`} className="sr-only">Search {emptyLabel}</label>
            <span className="catalog-search-icon"><SearchIcon /></span>
            <input
              id={`${emptyLabel}-search`}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${emptyLabel}...`}
              className="catalog-search-input"
            />
          </div>

          <div className="catalog-filters">
            <select value={sortBy} onChange={handleFilterChange(setSortBy)} className="catalog-select" aria-label="Sort by">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <select value={genre} onChange={handleFilterChange(setGenre)} className="catalog-select" aria-label="Genre">
              <option value="">All Genres</option>
              {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>

            <select value={year} onChange={handleFilterChange(setYear)} className="catalog-select" aria-label="Year">
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select value={rating} onChange={handleFilterChange(setRating)} className="catalog-select" aria-label="Min rating">
              <option value="">Any Rating</option>
              {RATING_OPTIONS.map((r) => <option key={r} value={r}>{r}+ Stars</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button type="button" onClick={handleResetFilters} className="catalog-clear-btn" aria-label="Clear filters">
                <CloseIcon />
                Clear
              </button>
            )}
          </div>
        </form>

        {/* States + Grid */}
        {error ? (
          <div className="catalog-state-panel" role="alert">
            <p className="eyebrow mb-3">Unavailable</p>
            <h2>Could not load catalog</h2>
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="catalog-state-panel">
            <p className="eyebrow mb-3">No matches</p>
            <h2>Nothing found</h2>
            <p>
              {isSearchMode
                ? `No results for "${query}". Try a different title or clear filters.`
                : "No titles match these filters. Try broadening genre, year, or rating."}
            </p>
          </div>
        ) : (
          <div className="catalog-grid-v2">
            {items.map((item, index) => (
              <Link
                to={`${detailBasePath}/${item.id}`}
                key={item.id}
                className="catalog-card-v2"
                style={{ "--index": index }}
              >
                <div className="catalog-card-media">
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item[titleKey]}
                    className="catalog-card-img"
                    loading="lazy"
                  />
                  <span className="catalog-card-badge">{item.vote_average?.toFixed(1) || "NR"}</span>
                  <div className="catalog-card-overlay">
                    <strong className="catalog-card-overlay-title">{item[titleKey]}</strong>
                    <p className="catalog-card-overlay-year">{getYear(item[dateKey])}</p>
                    <p className="catalog-card-overlay-overview">{item.overview || "Synopsis unavailable."}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <nav className="catalog-pagination-v2" aria-label={`${mediaLabel} pagination`}>
          <button onClick={handlePrevPage} disabled={page === 1} className="catalog-page-btn">
            <ChevronLeft />
            Prev
          </button>
          <span className="catalog-page-count">
            {page}
            <span className="catalog-page-sep">/</span>
            {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={page === totalPages} className="catalog-page-btn">
            Next
            <ChevronRight />
          </button>
        </nav>

      </div>
    </div>
  );
};

export default CatalogPage;
