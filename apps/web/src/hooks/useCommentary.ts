import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export function useCommentary() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['commentary'],
    queryFn: () => api.ai.getCommentary(),
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useDismissCommentary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.ai.dismissCommentary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commentary'] }),
  });
}

export function useSnoozeCommentary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      api.ai.snoozeCommentary(id, until),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commentary'] }),
  });
}
