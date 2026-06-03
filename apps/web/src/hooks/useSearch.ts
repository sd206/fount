import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useSearch() {
  return useMutation({
    mutationFn: ({ query, limit }: { query: string; limit?: number }) =>
      api.search.query(query, limit),
  });
}
