import { useCallback, useEffect, useMemo, useState } from "react";
import HeroSection from "../../components/home/HeroSection";
import ContentSection from "../../components/home/ContentSection";
import { GENRES } from "../../constants/genres";

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
      <div className="page-shell">
        <div className="h-[680px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.05]" />
      </div>
    );
  }

  if (error) {
    return <p className="page-shell text-red-200">{error}</p>;
  }

  return (
    <div className="page-shell space-y-14">
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

export default Home;
