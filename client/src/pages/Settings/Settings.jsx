import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GENRE_GROUPS,
  GENRE_LOOKUP,
  MOVIE_GENRE_IDS,
  TV_GENRE_IDS,
} from "../../constants/genres";
import { usePreferences } from "../../context/PreferencesContext";

const CONTENT_TYPE_OPTIONS = [
  {
    value: "movie",
    label: "Movies",
    helper: "Prioritize film recommendations.",
  },
  {
    value: "tv",
    label: "Series",
    helper: "Prioritize episodic recommendations.",
  },
  {
    value: "both",
    label: "Both",
    helper: "Blend movies and series together.",
  },
];

const DISCOVERY_STYLE_OPTIONS = [
  {
    value: "popular",
    label: "Popular right now",
    helper: "Trending picks with broad appeal.",
  },
  {
    value: "top_rated",
    label: "Top rated",
    helper: "High-scoring titles from critics and viewers.",
  },
  {
    value: "new",
    label: "New releases",
    helper: "Fresh content and recently released titles.",
  },
];

const EMPTY_FEEDBACK = { type: "", message: "" };

const areArraysEqual = (a, b) => {
  if (a.length !== b.length) return false;

  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);

  return left.every((value, index) => value === right[index]);
};

const Settings = () => {
  const { loading, saving, error, fetchPreferences, updatePreferences } =
    usePreferences();

  const [initialized, setInitialized] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState({
    favoriteGenres: [],
    contentType: "both",
    discoveryStyle: "popular",
  });
  const [savedPreferences, setSavedPreferences] = useState({
    favoriteGenres: [],
    contentType: "both",
    discoveryStyle: "popular",
  });
  const [feedback, setFeedback] = useState(EMPTY_FEEDBACK);

  const loadPreferences = useCallback(async () => {
    try {
      const nextPreferences = await fetchPreferences();
      setDraftPreferences(nextPreferences);
      setSavedPreferences(nextPreferences);
    } finally {
      setInitialized(true);
    }
  }, [fetchPreferences]);

  useEffect(() => {
    loadPreferences().catch(() => {
      setDraftPreferences({
        favoriteGenres: [],
        contentType: "both",
        discoveryStyle: "popular",
      });
      setSavedPreferences({
        favoriteGenres: [],
        contentType: "both",
        discoveryStyle: "popular",
      });
    });
  }, [loadPreferences]);

  const draftGenreSet = useMemo(
    () => new Set(draftPreferences.favoriteGenres),
    [draftPreferences.favoriteGenres],
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      !areArraysEqual(
        draftPreferences.favoriteGenres,
        savedPreferences.favoriteGenres,
      ) ||
      draftPreferences.contentType !== savedPreferences.contentType ||
      draftPreferences.discoveryStyle !== savedPreferences.discoveryStyle
    );
  }, [draftPreferences, savedPreferences]);

  const favoriteGenreNames = useMemo(() => {
    return draftPreferences.favoriteGenres
      .map((genreId) => GENRE_LOOKUP.get(genreId)?.name)
      .filter(Boolean);
  }, [draftPreferences.favoriteGenres]);

  const favoriteGenreCoverage = useMemo(() => {
    const selected = draftPreferences.favoriteGenres;
    const hasMovieGenre = selected.some((genreId) => MOVIE_GENRE_IDS.has(genreId));
    const hasTvGenre = selected.some((genreId) => TV_GENRE_IDS.has(genreId));

    if (hasMovieGenre && hasTvGenre) {
      return "Covers both movie and series genres";
    }

    if (hasMovieGenre) {
      return "Focused on movie genres";
    }

    if (hasTvGenre) {
      return "Focused on series genres";
    }

    return "No genre focus selected yet";
  }, [draftPreferences.favoriteGenres]);

  const toggleGenre = (genreId) => {
    setFeedback(EMPTY_FEEDBACK);
    setDraftPreferences((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genreId)
        ? prev.favoriteGenres.filter((id) => id !== genreId)
        : [...prev.favoriteGenres, genreId],
    }));
  };

  const selectContentType = (contentType) => {
    setFeedback(EMPTY_FEEDBACK);
    setDraftPreferences((prev) => ({
      ...prev,
      contentType,
    }));
  };

  const selectDiscoveryStyle = (discoveryStyle) => {
    setFeedback(EMPTY_FEEDBACK);
    setDraftPreferences((prev) => ({
      ...prev,
      discoveryStyle,
    }));
  };

  const handleDiscard = () => {
    setDraftPreferences(savedPreferences);
    setFeedback({ type: "success", message: "Changes discarded" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(EMPTY_FEEDBACK);

    try {
      const response = await updatePreferences(draftPreferences);
      const nextSaved = response?.data || draftPreferences;
      setSavedPreferences(nextSaved);
      setDraftPreferences(nextSaved);
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
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-700/60" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-slate-700/50" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60" />
            <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60" />
          </div>
          <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60" />
        </div>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-2xl font-semibold">Couldn&apos;t load settings</h1>
          <p className="mt-2 text-sm text-red-200">
            We couldn&apos;t fetch your personalization preferences. Try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setInitialized(false);
              loadPreferences().catch(() => {});
            }}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 pb-28">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-sm text-slate-300">
            Shape your For You feed with your genres, content type, and discovery
            style.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            hasUnsavedChanges
              ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
        </span>
      </div>

      {(feedback.message || (error && initialized)) && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {feedback.message || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Favorite genres</h2>
            <p className="mt-1 text-sm text-slate-300">
              Pick the genres that should carry the most weight in your For You
              recommendations.
            </p>

            <div className="mt-5 space-y-4">
              {GENRE_GROUPS.map((group) => (
                <div key={group.key}>
                  <h3 className="text-sm font-semibold text-slate-100">{group.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{group.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.genres.map((genre) => {
                      const isSelected = draftGenreSet.has(genre.id);

                      return (
                        <button
                          key={genre.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleGenre(genre.id)}
                          className={`rounded-full border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                            isSelected
                              ? "border-red-500/50 bg-red-500/15 text-red-100"
                              : "border-white/15 bg-white/[0.02] text-slate-200 hover:border-white/30"
                          }`}
                        >
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Content preference</h2>
            <p className="mt-1 text-sm text-slate-300">
              Decide whether to prioritize movies, series, or both.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CONTENT_TYPE_OPTIONS.map((option) => {
                const isSelected = draftPreferences.contentType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectContentType(option.value)}
                    className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isSelected
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-300">{option.helper}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Recommendation style</h2>
            <p className="mt-1 text-sm text-slate-300">
              Choose how your recommendations should be ranked.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DISCOVERY_STYLE_OPTIONS.map((option) => {
                const isSelected = draftPreferences.discoveryStyle === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectDiscoveryStyle(option.value)}
                    className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isSelected
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-300">{option.helper}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold">Taste profile</h2>
            <p className="mt-1 text-sm text-slate-300">
              These settings directly power your For You recommendations.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Genres</p>
                <p className="mt-1 text-sm text-slate-200">
                  {favoriteGenreNames.length} selected
                </p>
                {favoriteGenreNames.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {favoriteGenreNames.map((genreName) => (
                      <span
                        key={genreName}
                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200"
                      >
                        {genreName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Start with a few genres to personalize your feed.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-200">
                {favoriteGenreCoverage}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Content type</p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {
                    CONTENT_TYPE_OPTIONS.find(
                      (option) => option.value === draftPreferences.contentType,
                    )?.label
                  }
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Discovery style</p>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {
                    DISCOVERY_STYLE_OPTIONS.find(
                      (option) => option.value === draftPreferences.discoveryStyle,
                    )?.label
                  }
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-300">
              {hasUnsavedChanges
                ? "You have unsaved personalization changes"
                : "Your personalization profile is up to date"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving || loading || !hasUnsavedChanges}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Discard changes
              </button>
              <button
                type="submit"
                disabled={saving || loading || !hasUnsavedChanges}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save preferences"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
