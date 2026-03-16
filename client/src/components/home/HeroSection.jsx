import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroSidebar from "./HeroSidebar";
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
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
      <div className="grid min-h-130 lg:grid-cols-[1.7fr_420px]">
        <div
          className="relative min-h-130 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentHeroItem.backdropUrl})`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/85 to-black/35" />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-black/30" />

          <div className="relative z-10 flex min-130 items-end px-6 py-8 md:px-10">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-red-400">
                Featured {currentHeroItem.mediaLabel}
              </p>

              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">
                {currentHeroItem.title}
              </h1>

              {currentHeroItem.genres.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-100">
                  {currentHeroItem.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/20 px-3 py-1">
                  * {currentHeroItem.rating ? currentHeroItem.rating.toFixed(1) : "N/A"}
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  {currentHeroItem.releaseYear}
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  {currentHeroItem.mediaLabel}
                </span>
              </div>

              <p className="line-clamp-3 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                {currentHeroItem.overview}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={currentHeroItem.detailRoute}
                  className="inline-flex items-center rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:bg-yellow-300"
                >
                  View Details
                </Link>

                <button
                  type="button"
                  onClick={handleWatchlistToggle}
                  disabled={watchlistPending}
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savedInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>

                <Link
                  to={currentHeroItem.exploreRoute}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-slate-950"
                >
                  {currentHeroItem.media_type === "tv"
                    ? "Explore Series"
                    : "Explore Movies"}
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
                <-
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-4 py-3 text-white transition hover:bg-black/65 lg:hidden"
                aria-label="Next slide"
              >
                ->
              </button>
            </>
          )}
        </div>

        <HeroSidebar
          heroItems={heroItems}
          heroIndex={heroIndex}
          setHeroIndex={setHeroIndex}
          handleNext={handleNext}
        />
      </div>
    </section>
  );
};

export default HeroSection;
