import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForYou from '../ForYou/ForYou';
import * as forYou from '../../hooks/queries/useForYouQuery';
import { vi } from 'vitest';

vi.spyOn(forYou, 'useForYouQuery');

describe('ForYou states', () => {
  it('renders loading', () => {
    forYou.useForYouQuery.mockReturnValue({ isLoading: true });
    render(<MemoryRouter><ForYou /></MemoryRouter>);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders configured empty list', () => {
    forYou.useForYouQuery.mockReturnValue({ isLoading: false, error: null, data: { data: [], meta: { preferencesConfigured: true } } });
    render(<MemoryRouter><ForYou /></MemoryRouter>);
    expect(screen.getByText(/For You/i)).toBeInTheDocument();
  });
});
