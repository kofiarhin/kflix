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
          `https://api.themoviedb.org/3/movie/${id}?language=en-US&append_to_response=videos,similar,recommendations,reviews,watch/providers,external_ids,credits`,
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
  const imdbId = movie?.external_ids?.imdb_id;
  const playImdbUrl = imdbId
    ? `https://www.playimdb.com/title/${imdbId}`
    : "";

  const similarMovies = useMemo(
    () => movie?.similar?.results?.slice(0, 8) || [],
    [movie?.similar?.results],
  );
  const recommendedMovies = useMemo(
    () => movie?.recommendations?.results?.slice(0, 8) || [],
    [movie?.recommendations?.results],
  );
  const reviews = useMemo(
    () => movie?.reviews?.results?.slice(0, 6) || [],
    [movie?.reviews?.results],
  );
  const cast = useMemo(
    () => movie?.credits?.cast?.slice(0, 8) || [],
    [movie?.credits?.cast],
  );

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

  if (loading) {
    return (
      <section className="page-shell">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="aspect-video animate-pulse rounded-[1.5rem] bg-white/10" />
          <div className="space-y-4">
            <div className="h-96 animate-pulse rounded-[1.5rem] bg-white/10" />
            <div className="h-12 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (error) return <p className="page-shell text-red-200">{error}</p>;
  if (!movie) return <p className="page-shell text-white">Movie not found.</p>;

  const detailFacts = [
    { label: "Released", value: movie.release_date || "N/A" },
    { label: "Rating", value: movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : "N/A" },
    { label: "Runtime", value: movie.runtime ? `${movie.runtime} min` : "N/A" },
    { label: "Status", value: movie.status || "Unknown" },
  ];

  return (
    <section className="text-white">
      <div className="relative overflow-hidden">
        {movie.backdrop_path && (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-35 blur-sm"
            style={{
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,16,0.68),#0c0d10_82%)]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-24 sm:px-6 lg:pb-14">
          <Link to="/movies" className="secondary-action mb-5 w-fit">
            Back to Movies
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111217] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.9)]">
              <div className="aspect-video w-full bg-[#15161b]">
                {trailer ? (
                  <iframe
                    key={trailer.key}
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name || movie.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : movie.backdrop_path ? (
                  <img
                    src={getBackdropUrl(movie.backdrop_path)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Trailer unavailable
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-sm text-slate-300 sm:px-5">
                <div>
                  <p className="text-base font-bold text-white">{movie.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {trailer?.name || "Featured video"}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {playImdbUrl && (
                    <a
                      href={playImdbUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Play ${movie.title}`}
                      className="primary-action min-w-32 flex-1 gap-2 sm:flex-none"
                    >
                      <span
                        aria-hidden="true"
                        className="h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-current"
                      />
                      Play
                    </a>
                  )}
                  {trailer && (
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-action min-w-32 flex-1 sm:flex-none"
                    >
                      Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>

            <aside className="grid gap-4 sm:grid-cols-[150px_1fr] lg:block">
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="aspect-[2/3] w-full rounded-[1.25rem] border border-white/10 object-cover shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)] sm:max-w-[180px] lg:max-w-none"
              />

              <div className="mt-0 lg:mt-4">
                <button
                  type="button"
                  onClick={handleWatchlistToggle}
                  className="primary-action w-full"
                >
                  {savedInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {detailFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"
                    >
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">
                        {fact.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {fact.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-7 max-w-5xl">
            <p className="eyebrow">Movie details</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-4 text-xl italic text-slate-300">
                {movie.tagline}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-red-300/20 bg-red-500/18 px-3 py-1 text-xs font-bold text-red-100"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="mt-5 max-w-3xl leading-8 text-slate-200">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>
      </div>

      <div className="page-shell">
        {cast.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Top Cast</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {cast.map((person) => (
                <div key={person.id} className="group">
                  <img
                    src={
                      person.profile_path
                        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }
                    alt={person.name}
                    className="aspect-[3/4] w-full rounded-2xl border border-white/10 object-cover transition duration-300 group-hover:-translate-y-1 group-hover:border-red-200/30"
                  />
                  <h3 className="mt-3 line-clamp-1 text-sm font-semibold">
                    {person.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                    {person.character || "Unknown role"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {providerData && (
          <div className="glass-panel mb-12 rounded-[1.75rem] p-6">
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
                  className="secondary-action"
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
          <div className="glass-panel mb-12 rounded-[1.75rem] p-6">
            <h2 className="text-2xl font-bold">Where to Watch</h2>
            <p className="mt-2 text-slate-400">
              No provider data available for {region}.
            </p>
          </div>
        )}

        <div className="glass-panel mt-12 rounded-[1.75rem] p-6">
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
                    className="rounded-2xl border border-white/10 bg-black/22 p-5"
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
                        className="mt-4 text-sm font-bold text-red-200 transition hover:text-white"
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
                  className="media-card"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="aspect-[2/3] w-full object-cover"
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
                  className="media-card"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title}
                    className="aspect-[2/3] w-full object-cover"
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
    <div className="rounded-2xl border border-white/10 bg-black/22 p-5">
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
