import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreateDropInput, UpdateDropInput } from '@fount/shared/types';

export function useDrops(params?: { tag?: string; type?: string }) {
  return useQuery({
    queryKey: ['drops', params],
    queryFn: () => api.drops.list(params),
  });
}

export function useDrop(id: string) {
  return useQuery({
    queryKey: ['drops', id],
    queryFn: () => api.drops.get(id),
    enabled: !!id,
  });
}

export function useCreateDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDropInput) => api.drops.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drops'] }),
  });
}

export function useUpdateDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDropInput }) =>
      api.drops.update(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['drops', id] });
      qc.invalidateQueries({ queryKey: ['drops'] });
    },
  });
}

export function useDeleteDrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.drops.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drops'] }),
  });
}

export function useConfirmTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dropId, tag }: { dropId: string; tag: string }) =>
      api.drops.confirmTag(dropId, tag),
    onSuccess: (_data, { dropId }) =>
      qc.invalidateQueries({ queryKey: ['drops', dropId] }),
  });
}

export function useDismissTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dropId, tag }: { dropId: string; tag: string }) =>
      api.drops.dismissTag(dropId, tag),
    onSuccess: (_data, { dropId }) =>
      qc.invalidateQueries({ queryKey: ['drops', dropId] }),
  });
}
