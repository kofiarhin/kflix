import CatalogPage from "../../components/catalog/CatalogPage";
import { GENRES } from "../../constants/genres";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
];

const movieGenreIds = new Set([
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
  10770, 53, 10752, 37,
]);

const MOVIE_GENRES = GENRES.filter((genre) => movieGenreIds.has(genre.id));

const Movies = () => (
  <CatalogPage
    browseEndpoint="https://api.themoviedb.org/3/discover/movie"
    detailBasePath="/movies"
    emptyLabel="movies"
    genres={MOVIE_GENRES}
    mediaLabel="Movies"
    pageEyebrow="Cinema catalog"
    searchEndpoint="https://api.themoviedb.org/3/search/movie"
    sortOptions={SORT_OPTIONS}
    titleKey="title"
    dateKey="release_date"
    yearParam="primary_release_year"
  />
);

export default Movies;
