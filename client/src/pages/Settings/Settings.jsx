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
const DEFAULT_PREFERENCES = {
  favoriteGenres: [],
  contentType: "both",
  discoveryStyle: "popular",
};

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
  const [draftPreferences, setDraftPreferences] = useState(DEFAULT_PREFERENCES);
  const [savedPreferences, setSavedPreferences] = useState(DEFAULT_PREFERENCES);
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
      setDraftPreferences(DEFAULT_PREFERENCES);
      setSavedPreferences(DEFAULT_PREFERENCES);
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
    const hasMovieGenre = selected.some((genreId) =>
      MOVIE_GENRE_IDS.has(genreId),
    );
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

  const selectedContentTypeLabel = useMemo(() => {
    return (
      CONTENT_TYPE_OPTIONS.find(
        (option) => option.value === draftPreferences.contentType,
      )?.label || "Both"
    );
  }, [draftPreferences.contentType]);

  const selectedDiscoveryStyleLabel = useMemo(() => {
    return (
      DISCOVERY_STYLE_OPTIONS.find(
        (option) => option.value === draftPreferences.discoveryStyle,
      )?.label || "Popular right now"
    );
  }, [draftPreferences.discoveryStyle]);

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
      <div className="page-shell">
        <div className="mb-6 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-700/60" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-slate-700/50" />
        </div>

        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
          <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-44 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
            <div className="h-44 animate-pulse rounded-3xl border border-white/10 bg-slate-900/70" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="page-shell">
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-2xl font-semibold text-white">
            Couldn&apos;t load settings
          </h1>
          <p className="mt-2 text-sm text-red-200">
            We couldn&apos;t fetch your personalization preferences. Try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setInitialized(false);
              loadPreferences().catch(() => {});
            }}
            className="mt-4 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-28">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">
            Personalization
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">
            Tune your Kflix feed
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Pick the genres and discovery style that should shape your
            recommendations.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
            hasUnsavedChanges
              ? "bg-amber-500/10 text-amber-200 ring-1 ring-inset ring-amber-500/30"
              : "bg-emerald-500/10 text-emerald-200 ring-1 ring-inset ring-emerald-500/30"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              hasUnsavedChanges ? "bg-amber-300" : "bg-emerald-300"
            }`}
          />
          {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
        </div>
      </div>

      {(feedback.message || (error && initialized)) && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-200 ring-1 ring-inset ring-emerald-500/30"
              : "bg-red-500/10 text-red-200 ring-1 ring-inset ring-red-500/30"
          }`}
        >
          {feedback.message || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Your taste profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                A quick summary of what your feed is optimized for right now.
              </p>
            </div>

            {favoriteGenreNames.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
                {favoriteGenreNames.slice(0, 6).map((genreName) => (
                  <span
                    key={genreName}
                    className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-inset ring-white/10"
                  >
                    {genreName}
                  </span>
                ))}
                {favoriteGenreNames.length > 6 && (
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                    +{favoriteGenreNames.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-black/22 p-4 ring-1 ring-inset ring-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Genres
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {favoriteGenreNames.length}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {favoriteGenreCoverage}
              </p>
            </div>

            <div className="rounded-2xl bg-black/22 p-4 ring-1 ring-inset ring-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Content type
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedContentTypeLabel}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Controls whether movies, series, or both are prioritized.
              </p>
            </div>

            <div className="rounded-2xl bg-black/22 p-4 ring-1 ring-inset ring-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Discovery style
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedDiscoveryStyleLabel}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Sets how titles are ranked across your recommendations.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Favorite genres
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose the genres that should carry the most weight in your
                feed.
              </p>
            </div>

            <div className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
              {favoriteGenreNames.length} selected
            </div>
          </div>

          {favoriteGenreNames.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Selected now
              </p>
              <div className="flex flex-wrap gap-2">
                {favoriteGenreNames.map((genreName) => (
                  <span
                    key={genreName}
                    className="rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-100 ring-1 ring-inset ring-red-500/30"
                  >
                    {genreName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-6">
            {GENRE_GROUPS.map((group) => (
              <div
                key={group.key}
                className="rounded-2xl bg-black/20 p-4 ring-1 ring-inset ring-white/10"
              >
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {group.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.genres.map((genre) => {
                    const isSelected = draftGenreSet.has(genre.id);

                    return (
                      <button
                        key={genre.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleGenre(genre.id)}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isSelected
                            ? "bg-red-500/12 text-red-100 ring-1 ring-inset ring-red-500/35"
                            : "bg-white/[0.03] text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.06] hover:ring-white/20"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isSelected ? "bg-red-300" : "bg-slate-500"
                          }`}
                        />
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                Content preference
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Decide whether to prioritize movies, series, or both.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {CONTENT_TYPE_OPTIONS.map((option) => {
                const isSelected =
                  draftPreferences.contentType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectContentType(option.value)}
                    className={`rounded-2xl p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isSelected
                        ? "bg-red-500/10 ring-1 ring-inset ring-red-500/35"
                        : "bg-slate-950/35 ring-1 ring-inset ring-white/10 hover:bg-white/[0.04] hover:ring-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {option.helper}
                        </p>
                      </div>

                      <span
                        className={`mt-1 h-5 w-5 rounded-full border transition ${
                          isSelected
                            ? "border-red-400 bg-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.15)]"
                            : "border-white/20 bg-transparent"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                Recommendation style
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose how your recommendations should be ranked.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {DISCOVERY_STYLE_OPTIONS.map((option) => {
                const isSelected =
                  draftPreferences.discoveryStyle === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectDiscoveryStyle(option.value)}
                    className={`rounded-2xl p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isSelected
                        ? "bg-red-500/10 ring-1 ring-inset ring-red-500/35"
                        : "bg-slate-950/35 ring-1 ring-inset ring-white/10 hover:bg-white/[0.04] hover:ring-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {option.helper}
                        </p>
                      </div>

                      <span
                        className={`mt-1 h-5 w-5 rounded-full border transition ${
                          isSelected
                            ? "border-red-400 bg-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.15)]"
                            : "border-white/20 bg-transparent"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {hasUnsavedChanges && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0c0d10]/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  You have unsaved personalization changes
                </p>
                <p className="text-xs text-slate-400">
                  Save now to update the recommendations in your For You feed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={saving || loading || !hasUnsavedChanges}
                  className="secondary-action disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Discard
                </button>

                <button
                  type="submit"
                  disabled={saving || loading || !hasUnsavedChanges}
                  className="primary-action disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save preferences"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
