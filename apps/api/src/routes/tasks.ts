import { Router } from 'express';
import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../lib/firebase';
import { AppError } from '../lib/errors';
import { COLLECTIONS } from '@fount/shared/constants';

export const tasksRouter = Router();

tasksRouter.get('/', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.TASKS)
      .where('userId', '==', req.uid)
      .where('status', '!=', 'skipped')
      .orderBy('status')
      .orderBy('dueDate', 'asc')
      .get();
    res.json({ tasks: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const input = z.object({
      title: z.string().min(1),
      dueDate: z.string().datetime().optional(),
      linkedDropIds: z.array(z.string()).optional(),
    }).parse(req.body);

    const ref = db.collection(COLLECTIONS.TASKS).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({
      userId: req.uid,
      ...input,
      dueDate: input.dueDate ? Timestamp.fromDate(new Date(input.dueDate)) : null,
      linkedDropIds: input.linkedDropIds ?? [],
      status: 'pending',
      source: 'user',
      createdAt: now,
    });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  try {
    const input = z.object({
      status: z.enum(['pending', 'completed', 'skipped']).optional(),
      dueDate: z.string().datetime().optional(),
    }).parse(req.body);

    const ref = db.collection(COLLECTIONS.TASKS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Task not found');

    const update: Record<string, any> = { ...input };
    if (input.dueDate) update.dueDate = Timestamp.fromDate(new Date(input.dueDate));
    if (input.status === 'completed') update.completedAt = FieldValue.serverTimestamp();

    await ref.update(update);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const ref = db.collection(COLLECTIONS.TASKS).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Task not found');
    await ref.delete();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
