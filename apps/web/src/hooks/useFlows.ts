import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CreateFlowInput, UpdateFlowInput, GenerateType } from '@fount/shared/types';

export function useFlows() {
  return useQuery({
    queryKey: ['flows'],
    queryFn: () => api.flows.list(),
  });
}

export function useFlow(id: string) {
  return useQuery({
    queryKey: ['flows', id],
    queryFn: () => api.flows.get(id),
    enabled: !!id,
  });
}

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFlowInput) => api.flows.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flows'] }),
  });
}

export function useUpdateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFlowInput }) =>
      api.flows.update(id, input),
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: ['flows', id] }),
  });
}

export function useDeleteFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.flows.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flows'] }),
  });
}

export function useGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ flowId, type }: { flowId: string; type: GenerateType }) =>
      api.flows.generate(flowId, type),
    onSuccess: (_data, { flowId }) => qc.invalidateQueries({ queryKey: ['flows', flowId] }),
  });
}
