import { useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistService } from '../../services/watchlistService';

export const useWatchlistMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['watchlist'] });

  return {
    addMutation: useMutation({ mutationFn: watchlistService.addToWatchlist, onSuccess: invalidate }),
    removeMutation: useMutation({ mutationFn: ({ tmdbId, mediaType }) => watchlistService.removeFromWatchlist(tmdbId, mediaType), onSuccess: invalidate }),
  };
};
