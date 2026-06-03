import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../lib/firebase';
import { AppError } from '../lib/errors';
import { enqueueEmbed, enqueueTagSuggest } from '../lib/tasks';
import { COLLECTIONS } from '@fount/shared/constants';
import type { Drop, CreateDropInput } from '@fount/shared/types';

export const dropsRouter = Router();

// ─── Create drop ─────────────────────────────────────────────────────────────

const CreateDropSchema = z.object({
  type: z.enum(['note', 'link', 'file', 'voice', 'scan']),
  title: z.string().optional(),
  body: z.string().optional(),
  url: z.string().url().optional(),
  fileRef: z.string().optional(),
  fileMimeType: z.string().optional(),
  sourceUrl: z.string().optional(),
});

dropsRouter.post('/', async (req, res, next) => {
  try {
    const input = CreateDropSchema.parse(req.body) as CreateDropInput;
    const ref = db.collection(COLLECTIONS.DROPS).doc();
    const now = FieldValue.serverTimestamp();

    const drop: Omit<Drop, 'id'> = {
      userId: req.uid,
      ...input,
      tags: [],
      suggestedTags: [],
      flowIds: [],
      createdAt: now as any,
      updatedAt: now as any,
    };

    await ref.set(drop);

    // Enqueue async background jobs
    await Promise.all([
      enqueueEmbed(ref.id, req.uid),
      enqueueTagSuggest(ref.id, req.uid),
    ]);

    res.status(201).json({ id: ref.id, ...drop });
  } catch (err) {
    next(err);
  }
});

// ─── List drops ───────────────────────────────────────────────────────────────

dropsRouter.get('/', async (req, res, next) => {
  try {
    const { tag, type, limit = '20', cursor } = req.query as Record<string, string>;

    let query = db.collection(COLLECTIONS.DROPS)
      .where('userId', '==', req.uid)
      .where('deletedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .limit(Number(limit));

    if (tag) query = query.where('tags', 'array-contains', tag) as any;
    if (type) query = query.where('type', '==', type) as any;
    if (cursor) {
      const cursorDoc = await db.collection(COLLECTIONS.DROPS).doc(cursor).get();
      query = query.startAfter(cursorDoc) as any;
    }

    const snap = await query.get();
    const drops = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const nextCursor = snap.docs.length === Number(limit)
      ? snap.docs[snap.docs.length - 1].id
      : null;

    res.json({ drops, nextCursor });
  } catch (err) {
    next(err);
  }
});

// ─── Get drop ─────────────────────────────────────────────────────────────────

dropsRouter.get('/:id', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.DROPS).doc(req.params.id).get();
    if (!snap.exists || snap.data()?.userId !== req.uid) {
      throw new AppError(404, 'Drop not found');
    }
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    next(err);
  }
});

// ─── Update drop ──────────────────────────────────────────────────────────────

const UpdateDropSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

dropsRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = UpdateDropSchema.parse(req.body);
    const ref = db.collection(COLLECTIONS.DROPS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) {
      throw new AppError(404, 'Drop not found');
    }
    await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    res.json({ id: req.params.id, ...input });
  } catch (err) {
    next(err);
  }
});

// ─── Soft delete ──────────────────────────────────────────────────────────────

dropsRouter.delete('/:id', async (req, res, next) => {
  try {
    const ref = db.collection(COLLECTIONS.DROPS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) {
      throw new AppError(404, 'Drop not found');
    }
    await ref.update({ deletedAt: FieldValue.serverTimestamp() });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── Confirm / dismiss suggested tag ─────────────────────────────────────────

dropsRouter.post('/:id/tags/confirm', async (req, res, next) => {
  try {
    const { tag } = z.object({ tag: z.string() }).parse(req.body);
    const ref = db.collection(COLLECTIONS.DROPS).doc(req.params.id);
    await ref.update({
      tags: FieldValue.arrayUnion(tag),
      suggestedTags: FieldValue.arrayRemove(tag),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

dropsRouter.post('/:id/tags/dismiss', async (req, res, next) => {
  try {
    const { tag } = z.object({ tag: z.string() }).parse(req.body);
    const ref = db.collection(COLLECTIONS.DROPS).doc(req.params.id);
    await ref.update({
      suggestedTags: FieldValue.arrayRemove(tag),
      updatedAt: FieldValue.serverTimestamp(),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
