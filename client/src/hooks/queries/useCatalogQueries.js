import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService';

export const useHomeFeedQuery = () => useQuery({ queryKey: ['catalog', 'home'], queryFn: catalogService.getHome });

export const useMoviesQuery = (params) => useQuery({ queryKey: ['catalog', 'movies', params], queryFn: () => catalogService.browseMovies(params) });

export const useSeriesQuery = (params) => useQuery({ queryKey: ['catalog', 'series', params], queryFn: () => catalogService.browseSeries(params) });

export const useMovieDetailsQuery = (id) => useQuery({ queryKey: ['catalog', 'movie', id], queryFn: () => catalogService.movieDetails(id), enabled: Boolean(id) });

export const useSeriesDetailsQuery = (id) => useQuery({ queryKey: ['catalog', 'tv', id], queryFn: () => catalogService.seriesDetails(id), enabled: Boolean(id) });
