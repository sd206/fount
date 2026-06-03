/**
 * Tag Suggestion Job
 * Triggered by Cloud Tasks after a drop is created.
 * Suggests tags and stores them in drop.suggestedTags.
 */

import { db } from '../lib/firebase';
import { callAi } from '../lib/aiRouter';
import { COLLECTIONS, AI_TASKS } from '@fount/shared/constants';
import { FieldValue } from 'firebase-admin/firestore';

export async function runTagSuggest(dropId: string, userId: string): Promise<void> {
  const snap = await db.collection(COLLECTIONS.DROPS).doc(dropId).get();
  if (!snap.exists || snap.data()?.userId !== userId) return;

  const drop = snap.data()!;
  const content = [drop.title, drop.body, drop.url].filter(Boolean).join('\n');
  if (!content.trim()) return;

  // Fetch user's existing tag vocabulary
  const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();
  const vocabulary: string[] = userSnap.data()?.tagVocabulary ?? [];

  const raw = await callAi({
    task: AI_TASKS.TAG_SUGGEST,
    systemPrompt: `You are a personal knowledge assistant. Suggest 3–5 relevant tags for the content.
Prefer tags from the user's existing vocabulary if applicable. Return a JSON array of strings only, e.g. ["tag1","tag2"].
Existing vocabulary: ${vocabulary.join(', ') || 'none yet'}.`,
    userPrompt: content,
    maxTokens: 128,
  });

  let tags: string[] = [];
  try { tags = JSON.parse(raw); } catch { return; }

  // Remove tags the user already has
  const newTags = tags.filter((t: string) => !drop.tags?.includes(t));
  if (!newTags.length) return;

  await snap.ref.update({
    suggestedTags: FieldValue.arrayUnion(...newTags),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
