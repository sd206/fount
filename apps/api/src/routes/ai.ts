import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../lib/firebase';
import { AppError } from '../lib/errors';
import { COLLECTIONS } from '@fount/shared/constants';

export const aiRouter = Router();

// ─── Get commentary cards ─────────────────────────────────────────────────────

aiRouter.get('/commentary', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.COMMENTARY)
      .where('userId', '==', req.uid)
      .where('dismissed', '==', false)
      .orderBy('generatedAt', 'desc')
      .limit(10)
      .get();

    const now = new Date();
    const cards = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((c: any) => !c.snoozedUntil || c.snoozedUntil.toDate() < now);

    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

// ─── Dismiss commentary ───────────────────────────────────────────────────────

aiRouter.post('/commentary/:id/dismiss', async (req, res, next) => {
  try {
    const ref = db.collection(COLLECTIONS.COMMENTARY).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Not found');
    await ref.update({ dismissed: true });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─── Snooze commentary ────────────────────────────────────────────────────────

aiRouter.post('/commentary/:id/snooze', async (req, res, next) => {
  try {
    const { until } = z.object({ until: z.string().datetime() }).parse(req.body);
    const ref = db.collection(COLLECTIONS.COMMENTARY).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Not found');
    await ref.update({ snoozedUntil: new Date(until) });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─── Suggest tags for a drop ──────────────────────────────────────────────────
// This is normally triggered async by Cloud Tasks, but exposed as an API
// so the client can also request it on demand.

aiRouter.post('/tags/suggest', async (req, res, next) => {
  try {
    const { dropId } = z.object({ dropId: z.string() }).parse(req.body);
    const snap = await db.collection(COLLECTIONS.DROPS).doc(dropId).get();
    if (!snap.exists || snap.data()?.userId !== req.uid) throw new AppError(404, 'Drop not found');

    // Tag suggestion is handled by the jobs service — enqueue and return 202
    // TODO: enqueue Cloud Tasks job
    res.status(202).json({ message: 'Tag suggestion queued' });
  } catch (err) {
    next(err);
  }
});
