import { useEffect, useMemo, useState } from "react";
import { GENRES } from "../../constants/genres";
import { usePreferences } from "../../context/PreferencesContext";

const Settings = () => {
  const {
    preferences,
    loading,
    saving,
    error,
    fetchPreferences,
    updatePreferences,
  } = usePreferences();

  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [contentType, setContentType] = useState("both");
  const [discoveryStyle, setDiscoveryStyle] = useState("popular");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchPreferences().catch(() => {});
  }, [fetchPreferences]);

  useEffect(() => {
    setFavoriteGenres(Array.isArray(preferences.favoriteGenres) ? preferences.favoriteGenres : []);
    setContentType(preferences.contentType || "both");
    setDiscoveryStyle(preferences.discoveryStyle || "popular");
  }, [preferences]);

  const genreSet = useMemo(() => new Set(favoriteGenres), [favoriteGenres]);

  const toggleGenre = (genreId) => {
    setFavoriteGenres((prev) => {
      const exists = prev.includes(genreId);

      if (exists) {
        return prev.filter((id) => id !== genreId);
      }

      return [...prev, genreId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    try {
      const response = await updatePreferences({
        favoriteGenres,
        contentType,
        discoveryStyle,
      });

      setFeedback({
        type: "success",
        message: response.message || "Preferences saved",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to save preferences",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Settings</h1>
      <p className="mb-8 text-sm text-slate-300">
        Choose what you like and we&apos;ll personalize your For You feed.
      </p>

      {(error || feedback.message) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {feedback.message || error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-white/10 bg-slate-900/60 p-6"
      >
        <section>
          <h2 className="mb-3 text-xl font-semibold">Favorite Genres</h2>
          <p className="mb-4 text-sm text-slate-300">
            Select one or more genres to tune recommendations.
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {GENRES.map((genre) => (
              <label
                key={genre.id}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={genreSet.has(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                  className="h-4 w-4"
                />
                <span>{genre.name}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Content Type</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contentType"
                value="movie"
                checked={contentType === "movie"}
                onChange={(event) => setContentType(event.target.value)}
              />
              <span>Movies</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contentType"
                value="tv"
                checked={contentType === "tv"}
                onChange={(event) => setContentType(event.target.value)}
              />
              <span>TV Series</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="contentType"
                value="both"
                checked={contentType === "both"}
                onChange={(event) => setContentType(event.target.value)}
              />
              <span>Both</span>
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Discovery Style</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discoveryStyle"
                value="popular"
                checked={discoveryStyle === "popular"}
                onChange={(event) => setDiscoveryStyle(event.target.value)}
              />
              <span>Popular</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discoveryStyle"
                value="top_rated"
                checked={discoveryStyle === "top_rated"}
                onChange={(event) => setDiscoveryStyle(event.target.value)}
              />
              <span>Top Rated</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discoveryStyle"
                value="new"
                checked={discoveryStyle === "new"}
                onChange={(event) => setDiscoveryStyle(event.target.value)}
              />
              <span>New</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
