import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { useWatchlistQuery } from '../hooks/queries/useWatchlistQuery';
import { useWatchlistMutations } from '../hooks/mutations/useWatchlistMutations';

export const useWatchlist = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, error, refetch } = useWatchlistQuery(isAuthenticated);
  const { addMutation, removeMutation } = useWatchlistMutations();
  const watchlist = Array.isArray(data?.data) ? data.data : [];

  const isInWatchlist = (tmdbId, mediaType) => watchlist.some((item) => item.tmdbId === Number(tmdbId) && item.mediaType === mediaType);

  return {
    watchlist,
    loading: isLoading,
    error: error?.message || '',
    fetchWatchlist: refetch,
    addToWatchlist: addMutation.mutateAsync,
    removeFromWatchlist: (tmdbId, mediaType) => removeMutation.mutateAsync({ tmdbId, mediaType }),
    isInWatchlist,
  };
};

export const WatchlistProvider = ({ children }) => children;
