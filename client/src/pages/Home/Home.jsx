import { Link } from 'react-router-dom';
import { useHomeFeedQuery } from '../../hooks/queries/useCatalogQueries';

const Home = () => {
  const { data, isLoading, error } = useHomeFeedQuery();

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6">{error.message}</p>;

  const cards = data?.data?.trending?.results?.slice(0, 12) || [];

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Trending this week</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((item) => {
          const path = item.media_type === 'tv' ? `/series/${item.id}` : `/movies/${item.id}`;
          return (
            <Link key={`${item.media_type}-${item.id}`} to={path} className="rounded bg-slate-900 p-3 focus:outline-none focus:ring-2">
              <p className="font-semibold">{item.title || item.name}</p>
              <p className="text-sm text-slate-300">{item.media_type}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
};

export default Home;
