const mapMediaCard = (item, mediaType) => ({
  id: item.id,
  mediaType,
  title: mediaType === 'movie' ? item.title || '' : '',
  name: mediaType === 'tv' ? item.name || '' : '',
  posterPath: item.poster_path || '',
  backdropPath: item.backdrop_path || '',
  overview: item.overview || '',
  releaseDate: item.release_date || '',
  firstAirDate: item.first_air_date || '',
  voteAverage: Number(item.vote_average) || 0,
  genreIds: Array.isArray(item.genre_ids) ? item.genre_ids : [],
});

module.exports = { mapMediaCard };
