import { useEffect, useMemo, useState } from "react";
import { GENRES } from "../../constants/genres";
import { usePreferences } from "../../context/PreferencesContext";

const Settings = () => {
  const { loading, saving, error, fetchPreferences, updatePreferences } =
    usePreferences();

  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [savedGenres, setSavedGenres] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const nextPreferences = await fetchPreferences();
        const nextFavoriteGenres = Array.isArray(
          nextPreferences?.favoriteGenres,
        )
          ? nextPreferences.favoriteGenres
          : [];

        if (isMounted) {
          setFavoriteGenres(nextFavoriteGenres);
          setSavedGenres(nextFavoriteGenres);
          setInitialized(true);
        }
      } catch {
        if (isMounted) {
          setFavoriteGenres([]);
          setSavedGenres([]);
          setInitialized(true);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [fetchPreferences]);

  const genreSet = useMemo(() => new Set(favoriteGenres), [favoriteGenres]);

  const savedGenreNames = useMemo(() => {
    const genreMap = new Map(GENRES.map((genre) => [genre.id, genre.name]));

    return savedGenres.map((genreId) => genreMap.get(genreId)).filter(Boolean);
  }, [savedGenres]);

  const hasUnsavedChanges = useMemo(() => {
    if (favoriteGenres.length !== savedGenres.length) return true;

    const current = [...favoriteGenres].sort((a, b) => a - b);
    const saved = [...savedGenres].sort((a, b) => a - b);

    return current.some((genreId, index) => genreId !== saved[index]);
  }, [favoriteGenres, savedGenres]);

  const toggleGenre = (genreId) => {
    setFavoriteGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    try {
      const response = await updatePreferences({
        favoriteGenres,
      });

      setSavedGenres(favoriteGenres);

      setFeedback({
        type: "success",
        message: response?.message || "Preferences saved",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to save preferences",
      });
    }
  };

  if (!initialized && loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-3xl font-bold">Settings</h1>
        <p className="text-sm text-slate-300">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Settings</h1>
      <p className="mb-8 text-sm text-slate-300">
        Select your favorite genres to personalize your For You feed.
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

      <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Currently Saved Preferences</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              hasUnsavedChanges
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
          </span>
        </div>

        {savedGenreNames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {savedGenreNames.map((genreName) => (
              <span
                key={genreName}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
              >
                {genreName}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-300">
            No preferences saved yet. Select genres below and save them.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border border-white/10 bg-slate-900/60 p-6"
      >
        <section>
          <h2 className="mb-3 text-xl font-semibold">Favorite Genres</h2>
          <p className="mb-4 text-sm text-slate-300">
            Pick one or more genres to tailor the movies and series you see in
            For You.
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {GENRES.map((genre) => (
              <label
                key={genre.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  genreSet.has(genre.id)
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-white/10"
                }`}
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
          disabled={saving || loading || !hasUnsavedChanges}
          className="rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
