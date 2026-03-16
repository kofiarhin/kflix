import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMoviesQuery } from '../../hooks/queries/useCatalogQueries';

const Movies = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useMoviesQuery({ search, page: 1 });
  const movies = data?.data?.results || [];

  return (
    <main className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold">Movies</h1>
      <input aria-label="Search movies" value={search} onChange={(e) => setSearch(e.target.value)} className="my-4 w-full rounded bg-slate-900 p-2" />
      {isLoading && <p>Loading...</p>}
      {error && <p>{error.message}</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {movies.map((m) => <Link key={m.id} to={`/movies/${m.id}`} className="rounded bg-slate-900 p-3">{m.title}</Link>)}
      </div>
    </main>
  );
};

export default Movies;
