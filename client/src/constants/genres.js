export const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
  { id: 10759, name: "Action & Adventure" },
  { id: 10762, name: "Kids" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
];

const MOVIE_GENRE_IDS = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
  10770, 53, 10752, 37,
]);

const TV_GENRE_IDS = new Set([
  10759, 16, 35, 80, 99, 18, 10751, 9648, 10762, 10763, 10764, 10765, 10766,
  10767, 10768,
]);

const pickGenres = (genreIds) => {
  const idSet = new Set(genreIds);
  return GENRES.filter((genre) => idSet.has(genre.id));
};

export const GENRE_GROUPS = [
  {
    key: "core",
    title: "Core picks",
    description: "Blockbusters and narrative favorites.",
    genres: pickGenres([28, 12, 35, 80, 18, 14, 27, 9648, 10749, 878, 53]),
  },
  {
    key: "story-world",
    title: "Family & world",
    description: "Family-friendly, factual, and period stories.",
    genres: pickGenres([16, 99, 10751, 36, 10402, 10752, 37]),
  },
  {
    key: "episodic",
    title: "Series & episodic",
    description: "TV-native formats and ongoing series genres.",
    genres: pickGenres([
      10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768, 10770,
    ]),
  },
];

export const GENRE_LOOKUP = new Map(GENRES.map((genre) => [genre.id, genre]));

export { MOVIE_GENRE_IDS, TV_GENRE_IDS };
