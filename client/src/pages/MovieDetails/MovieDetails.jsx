import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RecentlyViewedSection from "../../components/RecentlyViewed/RecentlyViewedSection";
import { useRecentlyViewed } from "../../context/RecentlyViewedContext";
import { useWatchlist } from "../../context/WatchlistContext";

const RECENTLY_VIEWED_RECORD_DEDUP_WINDOW_MS = 2000;
const recentlyViewedRecordTimestamps = new Map();

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { recordRecentlyViewed } = useRecentlyViewed();
  const [movie, setMovie] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recordedKeyRef = useRef("");

  const region =
    (navigator.language || "en-US").split("-")[1]?.toUpperCase() || "US";

  const getPosterUrl = (posterPath) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "https://via.placeholder.com/500x750?text=No+Image";
  };

  const getBackdropUrl = (backdropPath) => {
    return backdropPath
      ? `https://image.tmdb.org/t/p/original${backdropPath}`
      : "";
  };

  const truncateText = (text, limit = 260) => {
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  };

  const toggleReview = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US&append_to_response=videos,similar,recommendations,reviews,watch/providers`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
              accept: "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !movie?.id || !movie.title) {
      return;
    }

    const itemKey = `movie-${movie.id}`;
    const now = Date.now();
    const lastRecordedAt = recentlyViewedRecordTimestamps.get(itemKey) || 0;

    if (recordedKeyRef.current === itemKey) {
      return;
    }

    if (now - lastRecordedAt < RECENTLY_VIEWED_RECORD_DEDUP_WINDOW_MS) {
      recordedKeyRef.current = itemKey;
      return;
    }

    recordedKeyRef.current = itemKey;
    recentlyViewedRecordTimestamps.set(itemKey, now);

    recordRecentlyViewed({
      tmdbId: movie.id,
      mediaType: "movie",
      title: movie.title || "",
      posterPath: movie.poster_path || "",
      backdropPath: movie.backdrop_path || "",
      overview: movie.overview || "",
      releaseDate: movie.release_date || "",
      voteAverage: Number(movie.vote_average) || 0,
    }).catch(() => {
      recordedKeyRef.current = "";
    });
  }, [isAuthenticated, movie, recordRecentlyViewed]);

  const trailer =
    movie?.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) || movie?.videos?.results?.find((video) => video.site === "YouTube");

  const similarMovies = movie?.similar?.results?.slice(0, 8) || [];
  const recommendedMovies = movie?.recommendations?.results?.slice(0, 8) || [];
  const reviews = movie?.reviews?.results?.slice(0, 6) || [];

  const providerData =
    movie?.["watch/providers"]?.results?.[region] ||
    movie?.["watch/providers"]?.results?.US ||
    null;

  const streamProviders = providerData?.flatrate || [];
  const rentProviders = providerData?.rent || [];
  const buyProviders = providerData?.buy || [];

  const reviewStats = useMemo(() => {
    const ratedReviews = reviews.filter(
      (review) =>
        typeof review.author_details?.rating === "number" &&
        !Number.isNaN(review.author_details.rating),
    );

    if (!ratedReviews.length) {
      return {
        average: null,
        label: "No scored reviews",
      };
    }

    const average =
      ratedReviews.reduce(
        (sum, review) => sum + review.author_details.rating,
        0,
      ) / ratedReviews.length;

    let label = "Mixed";
    if (average >= 7.5) label = "Very Positive";
    else if (average >= 6) label = "Positive";
    else if (average >= 4) label = "Mixed";
    else label = "Negative";

    return {
      average,
      label,
    };
  }, [reviews]);

  const savedInWatchlist = movie ? isInWatchlist(movie.id, "movie") : false;

  const handleWatchlistToggle = async () => {
    if (!movie) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (savedInWatchlist) {
      await removeFromWatchlist(movie.id, "movie");
      return;
    }

    await addToWatchlist({
      tmdbId: movie.id,
      mediaType: "movie",
      title: movie.title || "",
      posterPath: movie.poster_path || "",
      backdropPath: movie.backdrop_path || "",
      overview: movie.overview || "",
      releaseDate: movie.release_date || "",
      voteAverage: Number(movie.vote_average) || 0,
    });
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;
  if (!movie) return <p className="p-6 text-white">Movie not found.</p>;

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div
        className="relative"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(${getBackdropUrl(movie.backdrop_path)})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[320px_1fr]">
          <div>
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>

          <div className="flex flex-col justify-center">
            <Link
              to="/movies"
              className="mb-6 inline-block w-fit rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-slate-950"
            >
              ← Back to Movies
            </Link>

            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mb-4 text-xl italic text-slate-300">
                {movie.tagline}
              </p>
            )}

            <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {movie.release_date || "N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {movie.runtime ? `${movie.runtime} mins` : "Runtime N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {movie.status || "Unknown"}
              </span>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-red-600/80 px-3 py-1 text-xs font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="max-w-3xl leading-8 text-slate-200">
              {movie.overview || "No overview available."}
            </p>

            {trailer && (
              <div className="mt-8">
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
                >
                  ▶ Watch Trailer
                </a>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={handleWatchlistToggle}
                className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                {savedInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {providerData && (
          <div className="mb-12 rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Where to Watch</h2>
                <p className="mt-1 text-sm text-slate-400">Region: {region}</p>
              </div>

              {providerData.link && (
                <a
                  href={providerData.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-slate-950"
                >
                  View all providers
                </a>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <ProviderSection title="Stream" providers={streamProviders} />
              <ProviderSection title="Rent" providers={rentProviders} />
              <ProviderSection title="Buy" providers={buyProviders} />
            </div>
          </div>
        )}

        {!providerData && (
          <div className="mb-12 rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Where to Watch</h2>
            <p className="mt-2 text-slate-400">
              No provider data available for {region}.
            </p>
          </div>
        )}

        {trailer && (
          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Trailer</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="aspect-video w-full">
                <iframe
                  key={trailer.key}
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name || movie.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Reviews</h2>

            <div className="rounded-full border border-white/20 px-4 py-2 text-sm">
              {reviewStats.average !== null ? (
                <span>
                  Sentiment:{" "}
                  <span className="font-semibold text-emerald-400">
                    {reviewStats.label}
                  </span>{" "}
                  · Avg {reviewStats.average.toFixed(1)}/10
                </span>
              ) : (
                <span className="text-slate-400">{reviewStats.label}</span>
              )}
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map((review) => {
                const isExpanded = expandedReviews[review.id];
                const content = isExpanded
                  ? review.content
                  : truncateText(review.content);

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {review.author || "Anonymous"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {review.author_details?.username || "Unknown user"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {typeof review.author_details?.rating === "number" && (
                          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-300">
                            {review.author_details.rating}/10
                          </span>
                        )}
                        <span className="text-sm text-slate-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="leading-7 text-slate-300">{content}</p>

                    {review.content?.length > 260 && (
                      <button
                        onClick={() => toggleReview(review.id)}
                        className="mt-4 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400">No reviews available.</p>
          )}
        </div>

        <RecentlyViewedSection />

        {recommendedMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Recommended</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {recommendedMovies.map((item) => (
                <Link
                  key={item.id}
                  to={`/movies/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02]"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.release_date || "N/A"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {similarMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Similar Movies</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {similarMovies.map((item) => (
                <Link
                  key={item.id}
                  to={`/movies/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02]"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.release_date || "N/A"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ProviderSection = ({ title, providers }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>

      {providers.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={`${title}-${provider.provider_id}`}
              className="flex flex-col items-center rounded-xl border border-white/10 p-3 text-center"
            >
              <img
                src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`}
                alt={provider.provider_name}
                className="mb-3 h-14 w-14 rounded-xl object-cover"
              />
              <p className="text-sm text-slate-300">{provider.provider_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No providers available.</p>
      )}
    </div>
  );
};

export default MovieDetails;
