import { useParams } from 'react-router-dom';
import { useMovieDetailsQuery } from '../../hooks/queries/useCatalogQueries';
import { useWatchlist } from '../../context/WatchlistContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useMovieDetailsQuery(id);
  const { addToWatchlist } = useWatchlist();
  const movie = data?.data;

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error.message}</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{movie?.title}</h1>
      <p className="my-3">{movie?.overview}</p>
      <button className="rounded bg-red-600 px-4 py-2" onClick={() => addToWatchlist({ tmdbId: movie.id, mediaType: 'movie', title: movie.title, overview: movie.overview })}>Add to watchlist</button>
    </main>
  );
};

export default MovieDetails;
