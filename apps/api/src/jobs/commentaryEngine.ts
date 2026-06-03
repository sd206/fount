/**
 * AI Commentary Engine — runs on a schedule (2x daily via Cloud Scheduler).
 * For each active user, generates proactive insights and stores them as
 * AiCommentary documents that surface on the dashboard.
 */

import { db } from '../lib/firebase';
import { callAi } from '../lib/aiRouter';
import { COLLECTIONS, AI_TASKS } from '@fount/shared/constants';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { AiCommentary, CommentaryType } from '@fount/shared/types';

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return Timestamp.fromDate(d);
};

export async function runCommentaryEngine(): Promise<void> {
  // Get all users active in the last 30 days
  const usersSnap = await db.collection(COLLECTIONS.USERS)
    .where('lastActiveAt', '>=', THIRTY_DAYS_AGO())
    .get();

  await Promise.allSettled(usersSnap.docs.map(u => processUser(u.id)));
}

async function processUser(userId: string): Promise<void> {
  const since = THIRTY_DAYS_AGO();

  // 1. Fetch recent drops
  const dropsSnap = await db.collection(COLLECTIONS.DROPS)
    .where('userId', '==', userId)
    .where('createdAt', '>=', since)
    .where('deletedAt', '==', null)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  // 2. Fetch overdue tasks
  const now = Timestamp.now();
  const tasksSnap = await db.collection(COLLECTIONS.TASKS)
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .where('dueDate', '<', now)
    .get();

  const drops = dropsSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  const overdueTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

  const commentary: Omit<AiCommentary, 'id'>[] = [];

  // 3. Missed activity cards (one per overdue task)
  for (const task of overdueTasks.slice(0, 3)) {
    commentary.push({
      userId,
      type: 'missed_activity' as CommentaryType,
      message: `You have a missed task: **${task.title}** — it was due ${formatDate(task.dueDate)}.`,
      actions: [
        { label: 'Mark complete', actionType: 'dismiss', payload: { taskId: task.id } },
        { label: 'Snooze', actionType: 'snooze' },
      ],
      dismissed: false,
      relatedDropIds: task.linkedDropIds ?? [],
      relatedFlowIds: [],
      generatedAt: FieldValue.serverTimestamp() as any,
    });
  }

  // 4. Proactive tip — ask Claude to analyze drop topics and suggest actions
  if (drops.length >= 3) {
    const summary = drops.slice(0, 20)
      .map(d => `- [${d.type}] ${d.title ?? d.url ?? 'Untitled'}: ${(d.tags ?? []).join(', ')}`)
      .join('\n');

    const raw = await callAi({
      task: AI_TASKS.COMMENTARY,
      systemPrompt: `You are a personal knowledge assistant. Analyze the user's recent drops and suggest one proactive tip or question.
Be conversational, specific, and helpful. Keep it under 2 sentences.
Return JSON: { "message": string, "type": "proactive_tip"|"grouping_nudge"|"conflict" }`,
      userPrompt: `Recent drops:\n${summary}`,
      maxTokens: 256,
    });

    try {
      const { message, type } = JSON.parse(raw);
      commentary.push({
        userId,
        type: type as CommentaryType,
        message,
        actions: [
          { label: 'Explore', actionType: 'open_drop' },
          { label: 'Dismiss', actionType: 'dismiss' },
        ],
        dismissed: false,
        relatedDropIds: drops.slice(0, 5).map(d => d.id),
        relatedFlowIds: [],
        generatedAt: FieldValue.serverTimestamp() as any,
      });
    } catch { /* skip if AI returned malformed JSON */ }
  }

  // 5. Write commentary to Firestore
  const batch = db.batch();
  for (const card of commentary) {
    const ref = db.collection(COLLECTIONS.COMMENTARY).doc();
    batch.set(ref, card);
  }
  await batch.commit();
}

function formatDate(ts: Timestamp): string {
  if (!ts) return 'recently';
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
