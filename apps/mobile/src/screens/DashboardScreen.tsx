import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommentary, useDismissCommentary } from '../hooks/useCommentary';
import { useTasks } from '../hooks/useTasks';
import type { AiCommentary, Task } from '@fount/shared/types';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const BG_TERTIARY = '#eceae3';
const TEXT_PRIMARY = '#18181a';
const TEXT_SECONDARY = '#6b6a67';
const TEXT_TERTIARY = '#9b9996';
const BORDER = 'rgba(0,0,0,0.09)';

export function DashboardScreen() {
  const { data: commentaryData, isLoading } = useCommentary();
  const { data: tasksData } = useTasks();
  const dismiss = useDismissCommentary();

  const cards = commentaryData?.cards ?? [];
  const todayTasks = (tasksData?.tasks ?? []).filter(isTodayTask);

  if (isLoading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator color={BRAND} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* AI Commentary */}
        {cards.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>FOUNT</Text>
            {cards.map(card => (
              <CommentaryCard
                key={card.id}
                card={card}
                onDismiss={() => dismiss.mutate(card.id)}
              />
            ))}
          </View>
        )}

        {/* Today's tasks */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>TODAY</Text>
          {todayTasks.length === 0 ? (
            <Text style={{ color: TEXT_TERTIARY, fontSize: 14 }}>Nothing due — you're clear.</Text>
          ) : (
            todayTasks.map(task => <TaskRow key={task.id} task={task} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CommentaryCard({ card, onDismiss }: { card: AiCommentary; onDismiss: () => void }) {
  return (
    <View style={s.card}>
      <View style={s.aiDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.cardMessage}>{card.message.replace(/\*\*(.*?)\*\*/g, '$1')}</Text>
        <View style={s.actions}>
          {card.actions.slice(0, 2).map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={action.actionType === 'dismiss' ? onDismiss : undefined}
              style={[s.actionBtn, i === 0 ? s.actionBtnPrimary : s.actionBtnSecondary]}
            >
              <Text style={[s.actionBtnText, i === 0 ? { color: '#fff' } : { color: TEXT_SECONDARY }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <View style={s.taskRow}>
      <View style={s.taskDot} />
      <Text style={s.taskTitle}>{task.title}</Text>
    </View>
  );
}

function isTodayTask(task: Task) {
  if (task.status !== 'pending' || !task.dueDate) return false;
  const due = (task.dueDate as any).toDate?.() ?? new Date(task.dueDate as any);
  return due.toDateString() === new Date().toDateString();
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    color: TEXT_TERTIARY, marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    padding: 14, flexDirection: 'row', gap: 10, marginBottom: 10,
  },
  aiDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: BRAND, marginTop: 6,
  },
  cardMessage: { fontSize: 14, color: TEXT_PRIMARY, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnPrimary: { backgroundColor: BRAND },
  actionBtnSecondary: { backgroundColor: BG_TERTIARY },
  actionBtnText: { fontSize: 12, fontWeight: '500' },
  taskRow: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
  taskTitle: { fontSize: 14, color: TEXT_PRIMARY, flex: 1 },
});
