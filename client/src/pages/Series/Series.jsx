import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeriesQuery } from '../../hooks/queries/useCatalogQueries';

const Series = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useSeriesQuery({ search, page: 1 });
  const items = data?.data?.results || [];

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Series</h1>
      <input aria-label="Search series" value={search} onChange={(e) => setSearch(e.target.value)} className="my-4 w-full rounded bg-slate-900 p-2" />
      {isLoading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => <Link key={item.id} to={`/series/${item.id}`} className="rounded bg-slate-900 p-3">{item.name}</Link>)}
      </div>
    </main>
  );
};

export default Series;
