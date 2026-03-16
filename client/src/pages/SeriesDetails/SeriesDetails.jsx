import { useParams } from 'react-router-dom';
import { useSeriesDetailsQuery } from '../../hooks/queries/useCatalogQueries';
import { useWatchlist } from '../../context/WatchlistContext';

const SeriesDetails = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useSeriesDetailsQuery(id);
  const { addToWatchlist } = useWatchlist();
  const series = data?.data;

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4">{error.message}</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{series?.name}</h1>
      <p className="my-3">{series?.overview}</p>
      <button className="rounded bg-red-600 px-4 py-2" onClick={() => addToWatchlist({ tmdbId: series.id, mediaType: 'tv', title: series.name, overview: series.overview })}>Add to watchlist</button>
    </main>
  );
};

export default SeriesDetails;
