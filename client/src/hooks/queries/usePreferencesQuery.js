import { useQuery } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferencesService';

export const usePreferencesQuery = (enabled = true) => useQuery({
  queryKey: ['preferences'],
  queryFn: preferencesService.getPreferences,
  enabled,
});
