import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const useAuthQuery = () => useQuery({
  queryKey: ['auth', 'me'],
  queryFn: authService.me,
  retry: false,
});
