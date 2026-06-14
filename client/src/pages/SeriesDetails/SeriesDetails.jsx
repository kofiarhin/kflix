import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RecentlyViewedSection from "../../components/RecentlyViewed/RecentlyViewedSection";
import { useAuth } from "../../context/AuthContext";
import { useRecentlyViewed } from "../../context/RecentlyViewedContext";
import { useWatchlist } from "../../context/WatchlistContext";

const RECENTLY_VIEWED_RECORD_DEDUP_WINDOW_MS = 2000;
const recentlyViewedRecordTimestamps = new Map();

const tmdbHeaders = {
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
  accept: "application/json",
};

const getPosterUrl = (posterPath) =>
  posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Image";

const getBackdropUrl = (backdropPath) =>
  backdropPath ? `https://image.tmdb.org/t/p/original${backdropPath}` : "";

const getStillUrl = (stillPath) =>
  stillPath ? `https://image.tmdb.org/t/p/w500${stillPath}` : "";

const SeriesDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { recordRecentlyViewed } = useRecentlyViewed();
  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState("");
  const [episodesError, setEpisodesError] = useState("");
  const recordedKeyRef = useRef("");

  const region =
    (navigator.language || "en-US").split("-")[1]?.toUpperCase() || "US";

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        setLoading(true);
        setError("");
        setSeasonDetails(null);

        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?language=en-US&append_to_response=videos,similar,recommendations,reviews,watch/providers,credits,content_ratings,external_ids`,
          { method: "GET", headers: tmdbHeaders },
        );

        if (!res.ok) throw new Error("Failed to fetch series details");

        const data = await res.json();
        const firstRealSeason = data.seasons?.find(
          (season) => season.season_number > 0 && season.episode_count > 0,
        );

        setSeries(data);
        setSelectedSeason(firstRealSeason?.season_number ?? data.seasons?.[0]?.season_number ?? 1);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSeriesDetails();
  }, [id]);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!id || selectedSeason === null || selectedSeason === undefined) return;

      try {
        setEpisodesLoading(true);
        setEpisodesError("");

        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}?language=en-US`,
          { headers: tmdbHeaders },
        );

        if (!res.ok) throw new Error("Failed to fetch season episodes");

        const data = await res.json();
        setSeasonDetails(data);
      } catch (err) {
        setEpisodesError(err.message || "Failed to load episodes");
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchSeasonDetails();
  }, [id, selectedSeason]);

  useEffect(() => {
    if (!isAuthenticated || !series?.id || !series.name) return;

    const itemKey = `tv-${series.id}`;
    const now = Date.now();
    const lastRecordedAt = recentlyViewedRecordTimestamps.get(itemKey) || 0;

    if (recordedKeyRef.current === itemKey) return;

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
  const playImdbUrl = imdbId ? `https://www.playimdb.com/title/${imdbId}` : "";

  const similarSeries = useMemo(
    () => series?.similar?.results?.slice(0, 8) || [],
    [series?.similar?.results],
  );
  const recommendedSeries = useMemo(
    () => series?.recommendations?.results?.slice(0, 8) || [],
    [series?.recommendations?.results],
  );
  const cast = useMemo(
    () => series?.credits?.cast?.slice(0, 8) || [],
    [series?.credits?.cast],
  );

  const providerData =
    series?.["watch/providers"]?.results?.[region] ||
    series?.["watch/providers"]?.results?.US ||
    null;

  const contentRating =
    series?.content_ratings?.results?.find((item) => item.iso_3166_1 === region)
      ?.rating ||
    series?.content_ratings?.results?.find((item) => item.iso_3166_1 === "US")
      ?.rating ||
    "N/A";

  const creators =
    series?.created_by?.map((person) => person.name).join(", ") || "N/A";

  const savedInWatchlist = series ? isInWatchlist(series.id, "tv") : false;

  const handleWatchlistToggle = async () => {
    if (!series) return;

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

  if (loading) {
    return (
      <section className="page-shell pt-28">
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

  if (error) return <p className="page-shell pt-28 text-red-200">{error}</p>;
  if (!series) return <p className="page-shell pt-28 text-white">Series not found.</p>;

  const detailFacts = [
    { label: "First aired", value: series.first_air_date || "N/A" },
    {
      label: "Rating",
      value: series.vote_average ? `${series.vote_average.toFixed(1)}/10` : "N/A",
    },
    { label: "Seasons", value: series.number_of_seasons || "N/A" },
    { label: "Episodes", value: series.number_of_episodes || "N/A" },
    { label: "Status", value: series.status || "Unknown" },
    { label: "Rated", value: contentRating },
  ];

  return (
    <section className="text-white">
      <div className="relative overflow-hidden">
        {series.backdrop_path && (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-35 blur-sm"
            style={{
              backgroundImage: `url(${getBackdropUrl(series.backdrop_path)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,16,0.68),#0c0d10_82%)]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-24 sm:px-6 lg:pb-14">
          <Link to="/series" className="secondary-action mb-5 w-fit">
            Back to Series
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111217] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.9)]">
              <div className="aspect-video w-full bg-[#15161b]">
                {trailer ? (
                  <iframe
                    key={trailer.key}
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name || series.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : series.backdrop_path ? (
                  <img
                    src={getBackdropUrl(series.backdrop_path)}
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
                  <p className="text-base font-bold text-white">{series.name}</p>
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
                      aria-label={`Play ${series.name}`}
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
                src={getPosterUrl(series.poster_path)}
                alt={series.name}
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
                    <Fact key={fact.label} label={fact.label} value={fact.value} />
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-7 max-w-5xl">
            <p className="eyebrow">Series details</p>
            <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
              {series.name}
            </h1>

            {series.tagline && (
              <p className="mt-4 text-xl italic text-slate-300">{series.tagline}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {series.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-red-300/20 bg-red-500/18 px-3 py-1 text-xs font-bold text-red-100"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <p className="mt-5 max-w-3xl leading-8 text-slate-200">
              {series.overview || "No overview available."}
            </p>
          </div>
        </div>
      </div>

      <div className="page-shell">
        <div className="glass-panel rounded-[1.75rem] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Episodes</p>
              <h2 className="mt-2 text-2xl font-bold">
                {seasonDetails?.name || `Season ${selectedSeason}`}
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              {seasonDetails?.episodes?.length || 0} episodes
            </p>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {series.seasons
              ?.filter((season) => season.episode_count > 0)
              .map((season) => (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                    selectedSeason === season.season_number
                      ? "border-red-300/40 bg-red-500/25 text-white"
                      : "border-white/10 bg-white/[0.045] text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {season.season_number === 0 ? "Specials" : `Season ${season.season_number}`}
                </button>
              ))}
          </div>

          {episodesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl bg-white/10"
                />
              ))}
            </div>
          ) : episodesError ? (
            <p className="text-red-200">{episodesError}</p>
          ) : seasonDetails?.episodes?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {seasonDetails.episodes.map((episode) => (
                <Link
                  key={episode.id}
                  to={`/series/${id}/season/${selectedSeason}/episode/${episode.episode_number}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-black/22 transition duration-300 hover:-translate-y-1 hover:border-red-200/30"
                >
                  <div className="aspect-video bg-[#15161b]">
                    {episode.still_path ? (
                      <img
                        src={getStillUrl(episode.still_path)}
                        alt={episode.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>Episode {episode.episode_number}</span>
                      <span>{episode.air_date || "N/A"}</span>
                    </div>
                    <h3 className="line-clamp-2 font-bold text-white">
                      {episode.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                      {episode.overview || "No overview available."}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">
                        {episode.runtime ? `${episode.runtime} min` : "Runtime N/A"}
                      </span>
                      <span className="font-bold text-red-100">Open</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No episodes available for this season.</p>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="mb-4 text-xl font-semibold">Series Info</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <Info label="Original Name" value={series.original_name || "N/A"} />
              <Info label="Created By" value={creators} />
              <Info
                label="Language"
                value={series.original_language?.toUpperCase() || "N/A"}
              />
              <Info label="Popularity" value={series.popularity || "N/A"} />
              <Info label="Vote Count" value={series.vote_count || "N/A"} />
              <Info label="Last Air Date" value={series.last_air_date || "N/A"} />
              <Info label="In Production" value={series.in_production ? "Yes" : "No"} />
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-6">
            <h2 className="mb-4 text-xl font-semibold">Network & Production</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <Info
                label="Networks"
                value={
                  series.networks?.length
                    ? series.networks.map((network) => network.name).join(", ")
                    : "Not available"
                }
              />
              <Info
                label="Production Companies"
                value={
                  series.production_companies?.length
                    ? series.production_companies.map((company) => company.name).join(", ")
                    : "Not available"
                }
              />
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
          <div className="glass-panel mt-12 rounded-[1.75rem] p-6">
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
          </div>
        )}

        <RecentlyViewedSection />

        <MediaRail title="Recommended Series" items={recommendedSeries} />
        <MediaRail title="Similar Series" items={similarSeries} />
      </div>
    </section>
  );
};

const Fact = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
  </div>
);

const Info = ({ label, value }) => (
  <p>
    <span className="font-semibold text-white">{label}:</span> {value}
  </p>
);

const MediaRail = ({ title, items }) => {
  if (!items.length) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} to={`/series/${item.id}`} className="media-card">
            <img
              src={getPosterUrl(item.poster_path)}
              alt={item.name}
              className="aspect-[2/3] w-full object-cover"
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
  );
};

export default SeriesDetails;
