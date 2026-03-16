import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { usePreferencesQuery } from '../hooks/queries/usePreferencesQuery';
import { usePreferencesMutation } from '../hooks/mutations/usePreferencesMutation';

const defaultPreferences = { favoriteGenres: [], contentType: 'both', discoveryStyle: 'popular' };

export const usePreferences = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, error, refetch } = usePreferencesQuery(isAuthenticated);
  const mutation = usePreferencesMutation();

  return {
    preferences: data?.data || defaultPreferences,
    loading: isLoading,
    saving: mutation.isPending,
    error: error?.message || mutation.error?.message || '',
    fetchPreferences: refetch,
    updatePreferences: mutation.mutateAsync,
    defaultPreferences,
  };
};

export const PreferencesProvider = ({ children }) => children;
