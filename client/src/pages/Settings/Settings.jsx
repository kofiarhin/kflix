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
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const nextPreferences = await fetchPreferences();

        if (isMounted) {
          setFavoriteGenres(
            Array.isArray(nextPreferences.favoriteGenres)
              ? nextPreferences.favoriteGenres
              : [],
          );
        }
      } catch {
        if (isMounted) {
          setFavoriteGenres(
            Array.isArray(preferences.favoriteGenres) ? preferences.favoriteGenres : [],
          );
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [fetchPreferences, preferences.favoriteGenres]);

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
        Select your favorite genres to personalize your For You movie feed.
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
            Pick one or more genres to tailor the movies you see in For You.
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
