import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../../components/home/HeroSection";
import ContentSection from "../../components/home/ContentSection";
import { GENRES } from "../../constants/genres";

const AUTO_PLAY_INTERVAL = 5000;

const storefrontTabs = [
  "All",
  "Movies",
  "Series",
  "Action",
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Family",
];

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [heroItems, setHeroItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const genreLookup = useMemo(() => {
    return GENRES.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  }, []);

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

  const currentHeroItem = useMemo(() => {
    return heroItems[heroIndex] || null;
  }, [heroItems, heroIndex]);

  const normalizeHeroItem = useCallback((item) => {
    const mediaType = item.media_type === "tv" ? "tv" : "movie";
    const releaseDate = item.release_date || item.first_air_date || "N/A";

    return {
      id: item.id,
      media_type: mediaType,
      title: item.title || item.name || "Untitled",
      releaseDate,
      releaseYear: releaseDate !== "N/A" ? releaseDate.slice(0, 4) : "N/A",
      rating: Number(item.vote_average) || 0,
      overview: item.overview || "No overview available.",
      posterPath: item.poster_path || "",
      backdropPath: item.backdrop_path || "",
      posterUrl: getPosterUrl(item.poster_path),
      backdropUrl: getBackdropUrl(item.backdrop_path),
      detailRoute: mediaType === "tv" ? `/series/${item.id}` : `/movies/${item.id}`,
      exploreRoute: mediaType === "tv" ? "/series" : "/movies",
      mediaLabel: mediaType === "tv" ? "Series" : "Movie",
      genres: (item.genre_ids || [])
        .map((genreId) => genreLookup[genreId])
        .filter(Boolean)
        .slice(0, 3),
    };
  }, [genreLookup]);

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
            { headers },
          ),
          fetch("https://api.themoviedb.org/3/trending/tv/week", { headers }),
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
            .slice(0, 5)
            .map(normalizeHeroItem) || [];

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
  }, [normalizeHeroItem]);

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
    return (
      <div className="page-shell home-storefront">
        <div className="h-[680px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.05]" />
        <div className="mt-10 flex gap-3 overflow-hidden">
          {storefrontTabs.map((tab) => (
            <div key={tab} className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="page-shell text-red-200">{error}</p>;
  }

  return (
    <div className="page-shell home-storefront space-y-10">
      {currentHeroItem && (
        <HeroSection
          currentHeroItem={currentHeroItem}
          heroItems={heroItems}
          heroIndex={heroIndex}
          setHeroIndex={setHeroIndex}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      )}

      <section className="storefront-channel" aria-label="Browse channels">
        <div className="storefront-tabs" role="list" aria-label="Featured categories">
          {storefrontTabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`storefront-tab ${index === 0 ? "storefront-tab-active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="storefront-feature-grid">
          {trendingMovies.slice(0, 2).map((item, index) => (
            <Link
              key={`movie-feature-${item.id}`}
              to={`/movies/${item.id}`}
              className={`storefront-feature-tile ${index === 0 ? "storefront-feature-tile-wide" : ""}`}
            >
              <img
                src={getBackdropUrl(item.backdrop_path)}
                alt=""
                className="storefront-feature-backdrop"
                aria-hidden="true"
              />
              <div className="storefront-feature-copy">
                <span>Trending Movie</span>
                <strong>{item.title}</strong>
                <p>{item.overview || "Explore what audiences are watching this week."}</p>
              </div>
            </Link>
          ))}

          {trendingSeries.slice(0, 2).map((item) => (
            <Link
              key={`series-feature-${item.id}`}
              to={`/series/${item.id}`}
              className="storefront-feature-tile"
            >
              <img
                src={getBackdropUrl(item.backdrop_path)}
                alt=""
                className="storefront-feature-backdrop"
                aria-hidden="true"
              />
              <div className="storefront-feature-copy">
                <span>Series Spotlight</span>
                <strong>{item.name}</strong>
                <p>{item.overview || "Catch up on episodes and new audience favorites."}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ContentSection
        eyebrow="Movies"
        title="Popular right now"
        items={popularMovies}
        type="movie"
        getPosterUrl={getPosterUrl}
        getBackdropUrl={getBackdropUrl}
        viewAllLink="/movies"
      />

      <ContentSection
        eyebrow="New this week"
        title="Trending movies"
        items={trendingMovies}
        type="movie"
        getPosterUrl={getPosterUrl}
        getBackdropUrl={getBackdropUrl}
        viewAllLink="/movies"
      />

      <ContentSection
        eyebrow="Series"
        title="Popular shows"
        items={popularSeries}
        type="series"
        getPosterUrl={getPosterUrl}
        getBackdropUrl={getBackdropUrl}
        viewAllLink="/series"
      />

      <ContentSection
        eyebrow="Binge picks"
        title="Trending series"
        items={trendingSeries}
        type="series"
        getPosterUrl={getPosterUrl}
        getBackdropUrl={getBackdropUrl}
        viewAllLink="/series"
      />
    </div>
  );
};

export default Home;
