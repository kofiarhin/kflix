const HeroSidebar = ({
  heroItems,
  heroIndex,
  setHeroIndex,
  handleNext,
  getPosterUrl,
  getTitle,
  getReleaseDate,
  getMediaLabel,
}) => {
  return (
    <aside className="border-t border-white/10 bg-black/95 p-5 lg:border-l lg:border-t-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Up next</h2>

        {heroItems.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20 lg:inline-flex"
            aria-label="Next slide"
          >
            Next →
          </button>
        )}
      </div>

      <div className="space-y-4">
        {heroItems.map((item, index) => {
          const isActive = index === heroIndex;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`flex w-full items-start gap-4 rounded-2xl border p-3 text-left transition ${
                isActive
                  ? "border-yellow-400 bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <img
                src={getPosterUrl(item.poster_path)}
                alt={getTitle(item)}
                className="h-24 w-16 shrink-0 rounded-lg object-cover"
              />

              <div className="min-w-0">
                <p className="mb-1 line-clamp-2 font-semibold text-white">
                  {getTitle(item)}
                </p>

                <p className="mb-2 text-sm text-slate-400">
                  {getReleaseDate(item)}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span>⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                  <span>•</span>
                  <span>{getMediaLabel(item)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {heroItems.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {heroItems.map((item, index) => (
            <button
              key={`dot-${item.id}`}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                heroIndex === index ? "bg-yellow-400" : "bg-white/35"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </aside>
  );
};

export default HeroSidebar;
