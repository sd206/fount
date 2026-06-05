'use client';

import { AppShell } from '../../components/layout/AppShell';
import { useCommentary, useDismissCommentary } from '../../hooks/useCommentary';
import { useTasks } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/auth';
import type { AiCommentary, Task } from '@fount/shared/types';

export default function DashboardPage() {
  const { user, loading } = useAuthStore();
  const { data: commentaryData } = useCommentary();
  const { data: tasksData } = useTasks();
  const dismiss = useDismissCommentary();

  if (loading || !user) return null;

  const cards = commentaryData?.cards ?? [];
  const todayTasks = (tasksData?.tasks ?? []).filter(isTodayTask);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* AI Commentary Feed */}
        {cards.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
              Fount
            </h2>
            <div className="flex flex-col gap-3">
              {cards.map(card => (
                <CommentaryCard
                  key={card.id}
                  card={card}
                  onDismiss={() => dismiss.mutate(card.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Today's Tasks */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">
            Today
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)]">Nothing due today — you're clear.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayTasks.map(task => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function CommentaryCard({ card, onDismiss }: { card: AiCommentary; onDismiss: () => void }) {
  const iconMap: Record<string, string> = {
    missed_activity: 'alert-circle',
    suggestion: 'sparkles',
    conflict: 'alert-triangle',
    grouping_nudge: 'stack-2',
    proactive_tip: 'bulb',
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border-tertiary)] p-4 flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[var(--color-background-secondary)] flex items-center justify-center shrink-0">
        <i className={`ti ti-${iconMap[card.type] ?? 'sparkles'} text-[var(--color-brand)]`} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-[var(--color-text-primary)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: card.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {card.actions.map((action, i) => (
            <button
              key={i}
              onClick={action.actionType === 'dismiss' ? onDismiss : undefined}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                i === 0
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border-tertiary)] px-4 py-3 flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-[var(--color-brand)] shrink-0" />
      <span className="text-sm text-[var(--color-text-primary)] flex-1">{task.title}</span>
    </div>
  );
}

function isTodayTask(task: Task): boolean {
  if (task.status !== 'pending' || !task.dueDate) return false;
  const due = (task.dueDate as any).toDate?.() ?? new Date(task.dueDate as any);
  const today = new Date();
  return due.toDateString() === today.toDateString();
}
