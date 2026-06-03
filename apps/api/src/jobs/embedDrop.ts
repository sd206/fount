/**
 * Embed Drop Job
 * Triggered by Cloud Tasks after a drop is created or its content changes.
 * Generates a vector embedding and upserts it into Pinecone.
 */

import { db } from '../lib/firebase';
import { getIndex } from '../lib/pinecone';
import { createEmbedding } from '../lib/aiRouter';
import { COLLECTIONS } from '@fount/shared/constants';

export async function runEmbedDrop(dropId: string, userId: string): Promise<void> {
  const snap = await db.collection(COLLECTIONS.DROPS).doc(dropId).get();
  if (!snap.exists || snap.data()?.userId !== userId) return;

  const drop = snap.data()!;
  if (drop.deletedAt) return; // skip soft-deleted

  // Build text representation for embedding
  const parts = [
    drop.title,
    drop.body,
    drop.url,
    drop.aiSummary,
    ...(drop.tags ?? []),
  ].filter(Boolean);

  if (!parts.length) return;

  const text = parts.join('\n');
  const embedding = await createEmbedding(text);

  const index = getIndex();
  await index.upsert([{
    id: dropId,
    values: embedding,
    metadata: {
      userId,
      dropId,
      type: drop.type,
      tags: drop.tags ?? [],
      title: drop.title ?? '',
      createdAt: drop.createdAt?.toMillis?.() ?? Date.now(),
    },
  }]);
}

/**
 * Delete a drop's vector from Pinecone (call on hard delete or soft-delete cleanup).
 */
export async function deleteDropEmbedding(dropId: string): Promise<void> {
  const index = getIndex();
  await index.deleteOne(dropId);
}
