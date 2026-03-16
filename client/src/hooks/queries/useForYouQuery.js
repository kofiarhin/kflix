import { useQuery } from '@tanstack/react-query';
import { recommendationsService } from '../../services/recommendationsService';

export const useForYouQuery = (enabled = true) => useQuery({
  queryKey: ['recommendations', 'for-you'],
  queryFn: recommendationsService.getForYou,
  enabled,
});
