import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const AUTO_PLAY_INTERVAL = 5000;

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [heroItems, setHeroItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPosterUrl = (posterPath) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "https://via.placeholder.com/500x750?text=No+Image";
  };

  const getBackdropUrl = (backdropPath) => {
    return backdropPath
      ? `https://image.tmdb.org/t/p/original${backdropPath}`
      : "https://via.placeholder.com/1280x720?text=No+Backdrop";
  };

  const getDetailPath = (item) =>
    item.media_type === "tv" ? `/series/${item.id}` : `/movies/${item.id}`;

  const getBrowsePath = (item) =>
    item.media_type === "tv" ? "/series" : "/movies";

  const getTitle = (item) => item.title || item.name || "Untitled";

  const getReleaseDate = (item) =>
    item.release_date || item.first_air_date || "N/A";

  const getMediaLabel = (item) =>
    item.media_type === "tv" ? "Series" : "Movie";

  const currentHeroItem = useMemo(
    () => heroItems[heroIndex] || null,
    [heroItems, heroIndex],
  );

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
          accept: "application/json",
        };

        const [
          trendingAllRes,
          popularMoviesRes,
          trendingMoviesRes,
          popularSeriesRes,
          trendingSeriesRes,
        ] = await Promise.all([
          fetch("https://api.themoviedb.org/3/trending/all/week", { headers }),
          fetch(
            "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
            { headers },
          ),
          fetch("https://api.themoviedb.org/3/trending/movie/week", {
            headers,
          }),
          fetch(
            "https://api.themoviedb.org/3/tv/popular?language=en-US&page=1",
            {
              headers,
            },
          ),
          fetch("https://api.themoviedb.org/3/trending/tv/week", {
            headers,
          }),
        ]);

        if (
          !trendingAllRes.ok ||
          !popularMoviesRes.ok ||
          !trendingMoviesRes.ok ||
          !popularSeriesRes.ok ||
          !trendingSeriesRes.ok
        ) {
          throw new Error("Failed to fetch home page content");
        }

        const [
          trendingAllData,
          popularMoviesData,
          trendingMoviesData,
          popularSeriesData,
          trendingSeriesData,
        ] = await Promise.all([
          trendingAllRes.json(),
          popularMoviesRes.json(),
          trendingMoviesRes.json(),
          popularSeriesRes.json(),
          trendingSeriesRes.json(),
        ]);

        const featuredItems =
          trendingAllData.results
            ?.filter(
              (item) =>
                item.media_type !== "person" &&
                item.backdrop_path &&
                (item.title || item.name),
            )
            .slice(0, 5) || [];

        setHeroItems(featuredItems);
        setPopularMovies(popularMoviesData.results?.slice(0, 6) || []);
        setTrendingMovies(trendingMoviesData.results?.slice(0, 6) || []);
        setPopularSeries(popularSeriesData.results?.slice(0, 6) || []);
        setTrendingSeries(trendingSeriesData.results?.slice(0, 6) || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (heroItems.length <= 1) return;

    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(interval);
  }, [heroItems]);

  const handlePrev = () => {
    if (!heroItems.length) return;
    setHeroIndex((prev) => (prev === 0 ? heroItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!heroItems.length) return;
    setHeroIndex((prev) => (prev + 1) % heroItems.length);
  };

  if (loading) {
    return <p className="p-6 text-white">Loading...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-12 pb-10">
      {currentHeroItem && (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
          <div className="grid min-h-[520px] lg:grid-cols-[1.7fr_420px]">
            <div
              className="relative min-h-[520px] overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `url(${getBackdropUrl(
                  currentHeroItem.backdrop_path,
                )})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="relative z-10 flex min-h-[520px] items-end px-6 py-8 md:px-10">
                <div className="max-w-2xl">
                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-red-400">
                    Featured {getMediaLabel(currentHeroItem)}
                  </p>

                  <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
                    {getTitle(currentHeroItem)}
                  </h1>

                  <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-200">
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      ⭐ {currentHeroItem.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      {getReleaseDate(currentHeroItem)}
                    </span>
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      {getMediaLabel(currentHeroItem)}
                    </span>
                  </div>

                  <p className="max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                    {currentHeroItem.overview || "No overview available."}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to={getDetailPath(currentHeroItem)}
                      className="inline-flex items-center rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
                    >
                      ▶ View Details
                    </Link>

                    <Link
                      to={getBrowsePath(currentHeroItem)}
                      className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
                    >
                      Browse More
                    </Link>
                  </div>
                </div>
              </div>

              {heroItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-4 py-3 text-white transition hover:bg-black/65"
                    aria-label="Previous slide"
                  >
                    ←
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-4 py-3 text-white transition hover:bg-black/65 lg:hidden"
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <aside className="border-t border-white/10 bg-black/95 p-5 lg:border-l lg:border-t-0">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Up next</h2>

                {heroItems.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="hidden rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20 lg:inline-flex"
                    aria-label="Next slide"
                  >
                    Next →
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {heroItems.map((item, index) => {
                  const isActive = index === heroIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-3 text-left transition ${
                        isActive
                          ? "border-yellow-400 bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <img
                        src={getPosterUrl(item.poster_path)}
                        alt={getTitle(item)}
                        className="h-24 w-16 shrink-0 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <p className="mb-1 line-clamp-2 font-semibold text-white">
                          {getTitle(item)}
                        </p>

                        <p className="mb-2 text-sm text-slate-400">
                          {getReleaseDate(item)}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                          <span>
                            ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                          </span>
                          <span>•</span>
                          <span>{getMediaLabel(item)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {heroItems.length > 1 && (
                <div className="mt-5 flex justify-center gap-2">
                  {heroItems.map((item, index) => (
                    <button
                      key={`dot-${item.id}`}
                      type="button"
                      onClick={() => setHeroIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        heroIndex === index ? "bg-yellow-400" : "bg-white/35"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      <ContentSection
        title="Popular Movies"
        items={popularMovies}
        type="movie"
        getPosterUrl={getPosterUrl}
        viewAllLink="/movies"
      />

      <ContentSection
        title="Trending Movies"
        items={trendingMovies}
        type="movie"
        getPosterUrl={getPosterUrl}
        viewAllLink="/movies"
      />

      <ContentSection
        title="Popular Series"
        items={popularSeries}
        type="series"
        getPosterUrl={getPosterUrl}
        viewAllLink="/series"
      />

      <ContentSection
        title="Trending Series"
        items={trendingSeries}
        type="series"
        getPosterUrl={getPosterUrl}
        viewAllLink="/series"
      />
    </div>
  );
};

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

export default Home;
