import { useQuery } from '@tanstack/react-query';
import { watchlistService } from '../../services/watchlistService';

export const useWatchlistQuery = (enabled = true) => useQuery({
  queryKey: ['watchlist'],
  queryFn: watchlistService.getWatchlist,
  enabled,
});
