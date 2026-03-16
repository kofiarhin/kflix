import { useSelector } from 'react-redux';
import { selectAuthLoading, selectAuthUser, selectIsAuthenticated } from '../features/auth/authSelectors';
import { useAuthMutations } from '../hooks/mutations/useAuthMutations';

export const useAuth = () => {
  const user = useSelector(selectAuthUser);
  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const {
    registerMutation,
    loginMutation,
    logoutMutation,
    updateProfileMutation,
    uploadProfileImageMutation,
    removeProfileImageMutation,
  } = useAuthMutations();

  return {
    user,
    loading,
    isAuthenticated,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadProfileImage: uploadProfileImageMutation.mutateAsync,
    removeProfileImage: removeProfileImageMutation.mutateAsync,
  };
};

export const AuthProvider = ({ children }) => children;
