import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const refreshAuth = () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

  return {
    registerMutation: useMutation({ mutationFn: authService.register, onSuccess: refreshAuth }),
    loginMutation: useMutation({ mutationFn: authService.login, onSuccess: refreshAuth }),
    logoutMutation: useMutation({ mutationFn: authService.logout, onSuccess: refreshAuth }),
    updateProfileMutation: useMutation({ mutationFn: authService.updateProfile, onSuccess: refreshAuth }),
    uploadProfileImageMutation: useMutation({ mutationFn: authService.updateProfileImage, onSuccess: refreshAuth }),
    removeProfileImageMutation: useMutation({ mutationFn: authService.removeProfileImage, onSuccess: refreshAuth }),
  };
};
