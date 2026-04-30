import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWatchlist } from "../../context/WatchlistContext";
import { useAuth } from "../../context/AuthContext";

const HeroSection = ({
  currentHeroItem,
  heroItems,
  heroIndex,
  setHeroIndex,
  handlePrev,
  handleNext,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [watchlistPending, setWatchlistPending] = useState(false);

  const savedInWatchlist = isInWatchlist(
    currentHeroItem.id,
    currentHeroItem.media_type,
  );

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setWatchlistPending(true);

    try {
      if (savedInWatchlist) {
        await removeFromWatchlist(currentHeroItem.id, currentHeroItem.media_type);
        return;
      }

      await addToWatchlist({
        tmdbId: currentHeroItem.id,
        mediaType: currentHeroItem.media_type,
        title: currentHeroItem.title,
        posterPath: currentHeroItem.posterPath,
        backdropPath: currentHeroItem.backdropPath,
        overview: currentHeroItem.overview,
        releaseDate: currentHeroItem.releaseDate,
        voteAverage: currentHeroItem.rating,
      });
    } finally {
      setWatchlistPending(false);
    }
  };

  return (
    <section className="relative isolate -mx-4 -mt-2 overflow-hidden bg-[#101116] shadow-[0_34px_110px_-86px_rgba(0,0,0,0.95)] sm:-mx-6 lg:rounded-b-[1.75rem]">
      <img
        key={`hero-backdrop-${currentHeroItem.media_type}-${currentHeroItem.id}`}
        src={currentHeroItem.backdropUrl}
        alt=""
        className="hero-backdrop-enter absolute inset-0 h-full w-full object-cover object-center opacity-90"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#101116] via-[#101116]/48 to-[#101116]/0" />
      <div className="absolute inset-0 bg-linear-to-t from-[#101116] via-[#101116]/6 to-[#101116]/10" />
      <div className="absolute inset-y-0 right-0 hidden w-1/4 bg-linear-to-l from-[#101116]/38 to-transparent lg:block" />

      <div className="relative flex min-h-[620px] flex-col justify-end px-4 pb-16 pt-20 sm:px-8 md:min-h-[680px] lg:px-12 lg:pb-20">
        <div
          key={`hero-copy-${currentHeroItem.media_type}-${currentHeroItem.id}`}
          className="hero-copy-enter max-w-2xl"
        >
          <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-red-200">
            Featured {currentHeroItem.mediaLabel}
          </p>

          <h1 className="max-w-[11ch] text-5xl font-black leading-[0.9] tracking-tight text-white md:text-7xl xl:text-8xl">
            {currentHeroItem.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-200">
            <span>{currentHeroItem.releaseYear}</span>
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span>{currentHeroItem.rating ? currentHeroItem.rating.toFixed(1) : "N/A"} rating</span>
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span>{currentHeroItem.mediaLabel}</span>
          </div>

          <p className="mt-5 line-clamp-3 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
            {currentHeroItem.overview}
          </p>

          {currentHeroItem.genres.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {currentHeroItem.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/14 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={currentHeroItem.detailRoute}
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 text-sm font-black text-[#101116] transition hover:bg-slate-200 active:translate-y-px"
            >
              Play
            </Link>

            <button
              type="button"
              onClick={handleWatchlistToggle}
              disabled={watchlistPending}
              className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/18 px-7 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/24 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savedInWatchlist ? "In My List" : "Add to My List"}
            </button>
          </div>
        </div>

        {heroItems.length > 1 && (
          <div className="absolute bottom-6 right-4 flex items-center gap-3 sm:right-8 lg:bottom-10 lg:right-12">
            <div className="hidden items-center gap-1.5 sm:flex">
              {heroItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === heroIndex ? "w-9 bg-white" : "w-4 bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Show ${item.title}`}
                  aria-pressed={index === heroIndex}
                />
              ))}
            </div>

            <div className="flex rounded-full border border-white/10 bg-[#101116]/55 p-1 backdrop-blur">
              <button
                type="button"
                onClick={handlePrev}
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-black text-white transition hover:bg-white/12 active:translate-y-px"
                aria-label="Previous slide"
              >
                &lt;
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-black text-white transition hover:bg-white/12 active:translate-y-px"
                aria-label="Next slide"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#101116] to-transparent" />
    </section>
  );
};

export default HeroSection;
