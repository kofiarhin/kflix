import { Link } from 'react-router-dom';
import { useForYouQuery } from '../../hooks/queries/useForYouQuery';

const ForYou = () => {
  const { data, isLoading, error, refetch } = useForYouQuery(true);

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <button className="m-4 rounded bg-slate-700 px-3 py-2" onClick={() => refetch()}>Retry</button>;

  const items = data?.data || [];
  const configured = data?.meta?.preferencesConfigured !== false;

  if (!configured) {
    return <div className="p-4">Configure preferences in <Link to="/settings" className="underline">Settings</Link>.</div>;
  }

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">For You</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => <article key={`${item.id}-${item.media_type || item.mediaType}`} className="rounded bg-slate-900 p-3">{item.title || item.name}</article>)}
      </div>
    </main>
  );
};

export default ForYou;
