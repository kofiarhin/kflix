import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const tmdbHeaders = {
  Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
  accept: "application/json",
};

const getStillUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/original${path}` : "";

const getProfileUrl = (path) =>
  path
    ? `https://image.tmdb.org/t/p/w300${path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

const EpisodeDetails = () => {
  const { id, seasonNumber, episodeNumber } = useParams();
  const [series, setSeries] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        setLoading(true);
        setError("");

        const [seriesRes, episodeRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, {
            headers: tmdbHeaders,
          }),
          fetch(
            `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?language=en-US&append_to_response=videos,credits,external_ids`,
            { headers: tmdbHeaders },
          ),
        ]);

        if (!seriesRes.ok || !episodeRes.ok) {
          throw new Error("Failed to fetch episode details");
        }

        const [seriesData, episodeData] = await Promise.all([
          seriesRes.json(),
          episodeRes.json(),
        ]);

        setSeries(seriesData);
        setEpisode(episodeData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id && seasonNumber && episodeNumber) fetchEpisode();
  }, [id, seasonNumber, episodeNumber]);

  const trailer = useMemo(
    () =>
      episode?.videos?.results?.find(
        (video) => video.site === "YouTube" && video.type === "Trailer",
      ) || episode?.videos?.results?.find((video) => video.site === "YouTube"),
    [episode?.videos?.results],
  );

  const imdbId = episode?.external_ids?.imdb_id;
  const playUrl = imdbId ? `https://www.playimdb.com/title/${imdbId}` : "";
  const cast = episode?.credits?.cast?.slice(0, 10) || [];
  const guestStars = episode?.credits?.guest_stars?.slice(0, 10) || [];
  const people = cast.length ? cast : guestStars;

  if (loading) {
    return (
      <section className="page-shell pt-28">
        <div className="aspect-video animate-pulse rounded-[1.5rem] bg-white/10" />
        <div className="mt-8 h-40 animate-pulse rounded-[1.5rem] bg-white/10" />
      </section>
    );
  }

  if (error) return <p className="page-shell pt-28 text-red-200">{error}</p>;
  if (!episode) return <p className="page-shell pt-28">Episode not found.</p>;

  return (
    <section className="text-white">
      <div className="relative overflow-hidden">
        {episode.still_path && (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-35 blur-sm"
            style={{
              backgroundImage: `url(${getStillUrl(episode.still_path)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,16,0.68),#0c0d10_82%)]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-24 sm:px-6 lg:pb-14">
          <Link to={`/series/${id}`} className="secondary-action mb-5 w-fit">
            Back to Episodes
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111217] shadow-[0_28px_90px_-48px_rgba(0,0,0,0.9)]">
              <div className="aspect-video w-full bg-[#15161b]">
                {trailer ? (
                  <iframe
                    key={trailer.key}
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name || episode.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : episode.still_path ? (
                  <img
                    src={getStillUrl(episode.still_path)}
                    alt={episode.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Episode image unavailable
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-base font-bold text-white">
                    {series?.name || "Series"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Season {seasonNumber}, Episode {episodeNumber}
                  </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                  {playUrl && (
                    <a
                      href={playUrl}
                      target="_blank"
                      rel="noreferrer"
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

            <aside className="glass-panel rounded-[1.5rem] p-5">
              <p className="eyebrow">Episode</p>
              <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
                {episode.name}
              </h1>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Fact label="Air date" value={episode.air_date || "N/A"} />
                <Fact
                  label="Runtime"
                  value={episode.runtime ? `${episode.runtime} min` : "N/A"}
                />
                <Fact
                  label="Rating"
                  value={
                    episode.vote_average
                      ? `${episode.vote_average.toFixed(1)}/10`
                      : "N/A"
                  }
                />
                <Fact label="Votes" value={episode.vote_count || "N/A"} />
              </div>
            </aside>
          </div>

          <div className="mt-8 max-w-4xl">
            <p className="leading-8 text-slate-200">
              {episode.overview || "No overview available for this episode."}
            </p>
          </div>
        </div>
      </div>

      <div className="page-shell">
        {people.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Cast</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-10">
              {people.map((person) => (
                <div key={`${person.credit_id || person.id}`} className="group">
                  <img
                    src={getProfileUrl(person.profile_path)}
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

export default EpisodeDetails;
