import { Router } from 'express';
import { z } from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../lib/firebase';
import { callAi } from '../lib/aiRouter';
import { COLLECTIONS, AI_TASKS } from '@fount/shared/constants';

export const calendarRouter = Router();

// ─── Scan image for calendar events (OCR) ────────────────────────────────────

calendarRouter.post('/scan', async (req, res, next) => {
  try {
    const { imageBase64 } = z.object({ imageBase64: z.string() }).parse(req.body);

    // Gemini vision call via aiRouter — returns JSON with extracted events
    const raw = await callAi({
      task: AI_TASKS.OCR,
      systemPrompt: `You are a calendar OCR assistant. Extract all events from the image.
Return a JSON array: [{ "title": string, "startAt": ISO8601, "endAt": ISO8601|null, "location": string|null, "notes": string|null }]
Return only the JSON array, no other text.`,
      userPrompt: `Image (base64): ${imageBase64.slice(0, 100)}... [truncated for routing]`,
      maxTokens: 1024,
    });

    let events: any[] = [];
    try { events = JSON.parse(raw); } catch { events = []; }

    res.json({ events, rawText: raw });
  } catch (err) {
    next(err);
  }
});

// ─── List events ──────────────────────────────────────────────────────────────

calendarRouter.get('/events', async (req, res, next) => {
  try {
    const snap = await db.collection(COLLECTIONS.EVENTS)
      .where('userId', '==', req.uid)
      .orderBy('startAt', 'asc')
      .get();
    res.json({ events: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    next(err);
  }
});

// ─── Create event(s) ──────────────────────────────────────────────────────────

const EventSchema = z.object({
  title: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['user', 'ocr']).default('user'),
  linkedDropId: z.string().optional(),
});

calendarRouter.post('/events', async (req, res, next) => {
  try {
    const body = req.body;
    const inputs = Array.isArray(body) ? body : [body];
    const parsed = inputs.map(i => EventSchema.parse(i));

    const batch = db.batch();
    const ids: string[] = [];

    for (const input of parsed) {
      const ref = db.collection(COLLECTIONS.EVENTS).doc();
      ids.push(ref.id);
      batch.set(ref, {
        userId: req.uid,
        ...input,
        startAt: Timestamp.fromDate(new Date(input.startAt)),
        endAt: input.endAt ? Timestamp.fromDate(new Date(input.endAt)) : null,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    res.status(201).json({ ids });
  } catch (err) {
    next(err);
  }
});
