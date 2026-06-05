import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { Task } from '@fount/shared/types';

export function useTasks() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.tasks.list(),
    enabled: !!user,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, dueDate }: { title: string; dueDate?: string }) =>
      api.tasks.create(title, dueDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, dueDate }: { id: string; status: Task['status']; dueDate?: string }) =>
      api.tasks.update(id, status, dueDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
