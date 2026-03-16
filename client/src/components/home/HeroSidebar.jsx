import { Link } from "react-router-dom";

const HeroSidebar = ({
  heroItems,
  heroIndex,
  setHeroIndex,
  handleNext,
}) => {
  const handlePreviewKeyDown = (event, index) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setHeroIndex(index);
    }
  };

  const stopPreviewPropagation = (event) => {
    event.stopPropagation();
  };

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
            <div
              key={item.id}
              onClick={() => setHeroIndex(index)}
              onKeyDown={(event) => handlePreviewKeyDown(event, index)}
              tabIndex={0}
              role="button"
              aria-label={`Preview ${item.title}`}
              className={`w-full rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 ${
                isActive
                  ? "border-yellow-400/90 bg-white/10 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <Link
                  to={item.detailRoute}
                  onClick={stopPreviewPropagation}
                  className="shrink-0 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  aria-label={`View details for ${item.title}`}
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="h-24 w-16 object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={item.detailRoute}
                    onClick={stopPreviewPropagation}
                    className="mb-1 line-clamp-2 block font-semibold text-white hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  >
                    {item.title}
                  </Link>

                  <p className="mb-2 text-sm text-slate-400">{item.releaseDate}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span>⭐ {item.rating ? item.rating.toFixed(1) : "N/A"}</span>
                    <span>•</span>
                    <span>{item.releaseYear}</span>
                    <span>•</span>
                    <span>{item.mediaLabel}</span>
                  </div>

                  <Link
                    to={item.detailRoute}
                    onClick={stopPreviewPropagation}
                    className="mt-3 inline-flex text-sm font-medium text-yellow-300 transition hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </div>
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
