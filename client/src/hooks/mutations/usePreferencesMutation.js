import { useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferencesService';

export const usePreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: preferencesService.updatePreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preferences'] }),
  });
};
