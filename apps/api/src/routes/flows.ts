import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../lib/firebase';
import { AppError } from '../lib/errors';
import { callAi } from '../lib/aiRouter';
import { COLLECTIONS, AI_TASKS } from '@fount/shared/constants';
import type { GenerateType } from '@fount/shared/types';

export const flowsRouter = Router();

const GENERATE_PROMPTS: Record<GenerateType, string> = {
  summary: 'Condense the following drops into a clear 3–5 paragraph summary.',
  report: 'Structure the following drops into an executive report with findings and recommendations.',
  action_plan: 'Extract all actionable items from the following drops and group them by priority.',
  study_guide: 'Format the following drops as a Q&A study guide with key concepts.',
};

// ─── Create flow ──────────────────────────────────────────────────────────────

flowsRouter.post('/', async (req, res, next) => {
  try {
    const input = z.object({
      name: z.string().min(1),
      dropIds: z.array(z.string()),
      description: z.string().optional(),
    }).parse(req.body);

    const ref = db.collection(COLLECTIONS.FLOWS).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({ userId: req.uid, ...input, createdAt: now, updatedAt: now });
    res.status(201).json({ id: ref.id, ...input });
  } catch (err) {
    next(err);
  }
});

// ─── List flows ───────────────────────────────────────────────────────────────

flowsRouter.get('/', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.FLOWS)
      .where('userId', '==', req.uid)
      .orderBy('updatedAt', 'desc')
      .get();
    const flows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ flows });
  } catch (err) {
    next(err);
  }
});

// ─── Get flow ─────────────────────────────────────────────────────────────────

flowsRouter.get('/:id', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.FLOWS).doc(req.params.id).get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Flow not found');
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    next(err);
  }
});

// ─── Update flow ──────────────────────────────────────────────────────────────

flowsRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      dropIds: z.array(z.string()).optional(),
      coverDropId: z.string().optional(),
    }).parse(req.body);

    const ref = db.collection(COLLECTIONS.FLOWS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Flow not found');
    await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    res.json({ id: req.params.id, ...input });
  } catch (err) {
    next(err);
  }
});

// ─── Delete flow ──────────────────────────────────────────────────────────────

flowsRouter.delete('/:id', async (req, res, next) => {
  try {
    const ref = db.collection(COLLECTIONS.FLOWS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Flow not found');
    await ref.delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── Generate ─────────────────────────────────────────────────────────────────

flowsRouter.post('/:id/generate', async (req, res, next) => {
  try {
    const { type } = z.object({
      type: z.enum(['summary', 'report', 'action_plan', 'study_guide']),
    }).parse(req.body);

    const flowSnap = await db.collection(COLLECTIONS.FLOWS).doc(req.params.id).get();
    if (!flowSnap.exists || flowSnap.data()?.userId !== req.uid) throw new AppError(404, 'Flow not found');

    const { dropIds } = flowSnap.data() as { dropIds: string[] };

    // Fetch drop content
    const dropSnaps = await Promise.all(
      dropIds.map(id => db.collection(COLLECTIONS.DROPS).doc(id).get())
    );
    const dropsText = dropSnaps
      .filter(s => s.exists)
      .map(s => {
        const d = s.data()!;
        return `## ${d.title ?? 'Untitled'}\n${d.body ?? d.url ?? ''}`;
      })
      .join('\n\n---\n\n');

    const content = await callAi({
      task: AI_TASKS.GENERATE,
      systemPrompt: GENERATE_PROMPTS[type as GenerateType],
      userPrompt: dropsText,
      maxTokens: 2048,
    });

    const generatedContent = {
      type,
      content,
      generatedAt: FieldValue.serverTimestamp(),
      provider: 'claude',
    };

    await flowSnap.ref.update({ generatedContent, updatedAt: FieldValue.serverTimestamp() });
    res.json({ type, content });
  } catch (err) {
    next(err);
  }
});
