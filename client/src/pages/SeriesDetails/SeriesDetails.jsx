import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RecentlyViewedSection from "../../components/RecentlyViewed/RecentlyViewedSection";
import { useRecentlyViewed } from "../../context/RecentlyViewedContext";
import { useWatchlist } from "../../context/WatchlistContext";

const RECENTLY_VIEWED_RECORD_DEDUP_WINDOW_MS = 2000;
const recentlyViewedRecordTimestamps = new Map();

const SeriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { recordRecentlyViewed } = useRecentlyViewed();
  const [series, setSeries] = useState(null);
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
    const fetchSeriesDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?language=en-US&append_to_response=videos,similar,recommendations,reviews,watch/providers,credits,content_ratings,external_ids`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
              accept: "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch series details");
        }

        const data = await res.json();
        setSeries(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSeriesDetails();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !series?.id || !series.name) {
      return;
    }

    const itemKey = `tv-${series.id}`;
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
      tmdbId: series.id,
      mediaType: "tv",
      title: series.name || "",
      posterPath: series.poster_path || "",
      backdropPath: series.backdrop_path || "",
      overview: series.overview || "",
      releaseDate: series.first_air_date || "",
      voteAverage: Number(series.vote_average) || 0,
    }).catch(() => {
      recordedKeyRef.current = "";
    });
  }, [isAuthenticated, recordRecentlyViewed, series]);

  const trailer =
    series?.videos?.results?.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) || series?.videos?.results?.find((video) => video.site === "YouTube");
  const imdbId = series?.external_ids?.imdb_id;
  const playImdbUrl = imdbId
    ? `https://www.playimdb.com/title/${imdbId}`
    : "";

  const similarSeries = series?.similar?.results?.slice(0, 8) || [];
  const recommendedSeries = series?.recommendations?.results?.slice(0, 8) || [];
  const reviews = series?.reviews?.results?.slice(0, 6) || [];
  const cast = series?.credits?.cast?.slice(0, 8) || [];

  const providerData =
    series?.["watch/providers"]?.results?.[region] ||
    series?.["watch/providers"]?.results?.US ||
    null;

  const streamProviders = providerData?.flatrate || [];
  const rentProviders = providerData?.rent || [];
  const buyProviders = providerData?.buy || [];

  const contentRating =
    series?.content_ratings?.results?.find((item) => item.iso_3166_1 === region)
      ?.rating ||
    series?.content_ratings?.results?.find((item) => item.iso_3166_1 === "US")
      ?.rating ||
    "N/A";

  const creators =
    series?.created_by?.map((person) => person.name).join(", ") || "N/A";

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

  const savedInWatchlist = series ? isInWatchlist(series.id, "tv") : false;

  const handleWatchlistToggle = async () => {
    if (!series) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (savedInWatchlist) {
      await removeFromWatchlist(series.id, "tv");
      return;
    }

    await addToWatchlist({
      tmdbId: series.id,
      mediaType: "tv",
      title: series.name || "",
      posterPath: series.poster_path || "",
      backdropPath: series.backdrop_path || "",
      overview: series.overview || "",
      releaseDate: series.first_air_date || "",
      voteAverage: Number(series.vote_average) || 0,
    });
  };

  if (loading) return <p className="p-6 text-white">Loading...</p>;
  if (error) return <p className="p-6 text-red-400">{error}</p>;
  if (!series) return <p className="p-6 text-white">Series not found.</p>;

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div
        className="relative"
        style={{
          backgroundImage: series.backdrop_path
            ? `url(${getBackdropUrl(series.backdrop_path)})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[320px_1fr]">
          <div>
            <img
              src={getPosterUrl(series.poster_path)}
              alt={series.name}
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>

          <div className="flex flex-col justify-center">
            <Link
              to="/series"
              className="mb-6 inline-block w-fit rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-slate-950"
            >
              ← Back to Series
            </Link>

            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              {series.name}
            </h1>

            {series.tagline && (
              <p className="mb-4 text-xl italic text-slate-300">
                {series.tagline}
              </p>
            )}

            <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {series.first_air_date || "N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                ⭐ {series.vote_average?.toFixed(1) || "N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {series.number_of_seasons
                  ? `${series.number_of_seasons} season${series.number_of_seasons > 1 ? "s" : ""}`
                  : "Seasons N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {series.number_of_episodes
                  ? `${series.number_of_episodes} episodes`
                  : "Episodes N/A"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {series.status || "Unknown"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                {contentRating}
              </span>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {series.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-red-600/80 px-3 py-1 text-xs font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="max-w-3xl leading-8 text-slate-200">
              {series.overview || "No overview available."}
            </p>

            {(trailer || playImdbUrl) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
                  >
                    ▶ Watch Trailer
                  </a>
                )}
                {playImdbUrl && (
                  <a
                    href={playImdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-yellow-300"
                  >
                    Play IMDb
                  </a>
                )}
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Series Info</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Original Name:</span>{" "}
                {series.original_name || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-white">Created By:</span>{" "}
                {creators}
              </p>
              <p>
                <span className="font-semibold text-white">Language:</span>{" "}
                {series.original_language?.toUpperCase() || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-white">Popularity:</span>{" "}
                {series.popularity || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-white">Vote Count:</span>{" "}
                {series.vote_count || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-white">Last Air Date:</span>{" "}
                {series.last_air_date || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-white">In Production:</span>{" "}
                {series.in_production ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Network & Production</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                <span className="font-semibold text-white">Networks:</span>{" "}
                {series.networks?.length
                  ? series.networks.map((network) => network.name).join(", ")
                  : "Not available"}
              </p>
              <p>
                <span className="font-semibold text-white">
                  Production Companies:
                </span>{" "}
                {series.production_companies?.length
                  ? series.production_companies
                      .map((company) => company.name)
                      .join(", ")
                  : "Not available"}
              </p>
              <p>
                <span className="font-semibold text-white">
                  Production Countries:
                </span>{" "}
                {series.production_countries?.length
                  ? series.production_countries
                      .map((country) => country.name)
                      .join(", ")
                  : "Not available"}
              </p>
              <p>
                <span className="font-semibold text-white">Homepage:</span>{" "}
                {series.homepage ? (
                  <a
                    href={series.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline"
                  >
                    Visit Official Site
                  </a>
                ) : (
                  "Not available"
                )}
              </p>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Top Cast</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
                >
                  <img
                    src={
                      person.profile_path
                        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                        : "https://via.placeholder.com/300x450?text=No+Image"
                    }
                    alt={person.name}
                    className="h-[260px] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {person.character || "Unknown role"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {providerData && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-slate-900 p-6">
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

        {trailer && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Trailer</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="aspect-video w-full">
                <iframe
                  key={trailer.key}
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name || series.name}
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

        {recommendedSeries.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Recommended Series</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {recommendedSeries.map((item) => (
                <Link
                  key={item.id}
                  to={`/series/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02]"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.name}
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.first_air_date || "N/A"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {similarSeries.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Similar Series</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {similarSeries.map((item) => (
                <Link
                  key={item.id}
                  to={`/series/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:scale-[1.02]"
                >
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.name}
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {item.first_air_date || "N/A"}
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

export default SeriesDetails;
