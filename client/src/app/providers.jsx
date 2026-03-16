import { Provider, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { store } from './store';
import { queryClient } from '../lib/queryClient';
import { useAuthQuery } from '../hooks/queries/useAuthQuery';
import { clearUser, setAuthLoading, setUser } from '../features/auth/authSlice';

const AuthBootstrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useAuthQuery();

  useEffect(() => {
    dispatch(setAuthLoading(isLoading));
    if (data?.data) dispatch(setUser(data.data));
    if (isError) dispatch(clearUser());
  }, [dispatch, data, isLoading, isError]);

  return children;
};

export const AppProviders = ({ children }) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapper>{children}</AuthBootstrapper>
    </QueryClientProvider>
  </Provider>
);
