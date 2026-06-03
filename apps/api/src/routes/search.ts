import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/firebase';
import { getIndex } from '../lib/pinecone';
import { callAi, createEmbedding } from '../lib/aiRouter';
import { COLLECTIONS, AI_TASKS } from '@fount/shared/constants';

export const searchRouter = Router();

searchRouter.post('/', async (req, res, next) => {
  try {
    const { query, limit = 10, filters } = z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(20).optional(),
      filters: z.record(z.string()).optional(),
    }).parse(req.body);

    // 1. Embed the query
    const queryEmbedding = await createEmbedding(query);

    // 2. Query Pinecone
    const index = getIndex();
    const pineconeResults = await index.query({
      vector: queryEmbedding,
      topK: limit,
      filter: { userId: req.uid, ...filters },
      includeMetadata: true,
    });

    const dropIds = pineconeResults.matches
      .map(m => m.metadata?.dropId as string)
      .filter(Boolean);

    // 3. Fetch drops from Firestore
    const dropSnaps = await Promise.all(
      dropIds.map(id => db.collection(COLLECTIONS.DROPS).doc(id).get())
    );
    const drops = dropSnaps
      .filter(s => s.exists && s.data()?.userId === req.uid)
      .map(s => ({ id: s.id, ...s.data() }));

    // 4. Generate AI answer
    const context = drops
      .map((d: any) => `Title: ${d.title ?? 'Untitled'}\n${d.body ?? d.url ?? d.aiSummary ?? ''}`)
      .join('\n\n---\n\n');

    const answer = await callAi({
      task: AI_TASKS.SEARCH,
      systemPrompt: 'You are a personal knowledge assistant. Answer the user\'s question using only the drops provided. Be concise. If the drops don\'t contain the answer, say so.',
      userPrompt: `Question: ${query}\n\nDrops:\n${context}`,
      maxTokens: 512,
    });

    res.json({
      answer,
      sources: drops,
      confidence: pineconeResults.matches[0]?.score ?? 0,
    });
  } catch (err) {
    next(err);
  }
});
