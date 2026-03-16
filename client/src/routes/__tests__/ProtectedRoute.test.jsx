import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as auth from '../../context/AuthContext';
import { vi } from 'vitest';

vi.spyOn(auth, 'useAuth');

describe('ProtectedRoute', () => {
  it('shows loading state', () => {
    auth.useAuth.mockReturnValue({ loading: true, isAuthenticated: false });
    render(<MemoryRouter><ProtectedRoute><div>Private</div></ProtectedRoute></MemoryRouter>);
    expect(screen.getByText(/Checking authentication/i)).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    auth.useAuth.mockReturnValue({ loading: false, isAuthenticated: true });
    render(<MemoryRouter><ProtectedRoute><div>Private</div></ProtectedRoute></MemoryRouter>);
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('redirects guests', () => {
    auth.useAuth.mockReturnValue({ loading: false, isAuthenticated: false });
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
