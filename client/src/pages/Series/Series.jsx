import CatalogPage from "../../components/catalog/CatalogPage";
import { GENRES } from "../../constants/genres";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "first_air_date.asc", label: "Oldest" },
];

const seriesGenreIds = new Set([
  16, 35, 80, 99, 18, 10751, 10762, 9648, 10759, 10763, 10764, 10765, 10766,
  10767, 10768, 37,
]);

const SERIES_GENRES = GENRES.filter((genre) => seriesGenreIds.has(genre.id));

const Series = () => (
  <CatalogPage
    browseEndpoint="https://api.themoviedb.org/3/discover/tv"
    detailBasePath="/series"
    emptyLabel="series"
    genres={SERIES_GENRES}
    mediaLabel="Series"
    pageEyebrow="Series catalog"
    searchEndpoint="https://api.themoviedb.org/3/search/tv"
    sortOptions={SORT_OPTIONS}
    titleKey="name"
    dateKey="first_air_date"
    yearParam="first_air_date_year"
  />
);

export default Series;
