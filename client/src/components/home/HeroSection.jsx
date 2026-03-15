import { Link } from "react-router-dom";
import HeroSidebar from "./HeroSidebar";

const HeroSection = ({
  currentHeroItem,
  heroItems,
  heroIndex,
  setHeroIndex,
  handlePrev,
  handleNext,
  getBackdropUrl,
  getPosterUrl,
  getDetailPath,
  getBrowsePath,
  getTitle,
  getReleaseDate,
  getMediaLabel,
}) => {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
      <div className="grid min-h-130 lg:grid-cols-[1.7fr_420px]">
        <div
          className="relative min-h-130 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url(${getBackdropUrl(currentHeroItem.backdrop_path)})`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/75 to-black/25" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

          <div className="relative z-10 flex min-130 items-end px-6 py-8 md:px-10">
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

        <HeroSidebar
          heroItems={heroItems}
          heroIndex={heroIndex}
          setHeroIndex={setHeroIndex}
          handleNext={handleNext}
          getPosterUrl={getPosterUrl}
          getTitle={getTitle}
          getReleaseDate={getReleaseDate}
          getMediaLabel={getMediaLabel}
        />
      </div>
    </section>
  );
};

export default HeroSection;
