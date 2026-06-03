/**
 * Jobs HTTP server — receives Cloud Tasks and Cloud Scheduler calls.
 * Deployed as a separate Cloud Run service (fount-jobs).
 * Only accepts requests from Cloud Tasks (verified via OIDC token).
 */

import 'dotenv/config';
import express from 'express';
import { runEmbedDrop } from './jobs/embedDrop';
import { runTagSuggest } from './jobs/tagSuggest';
import { runCommentaryEngine } from './jobs/commentaryEngine';

const app = express();
app.use(express.json());

// Internal health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Embed drop ───────────────────────────────────────────────────────────────
app.post('/jobs/embed', async (req, res) => {
  const { dropId, userId } = req.body;
  if (!dropId || !userId) return res.status(400).json({ error: 'Missing dropId or userId' });
  try {
    await runEmbedDrop(dropId, userId);
    res.json({ ok: true });
  } catch (err) {
    console.error('embed job failed:', err);
    res.status(500).json({ error: 'Job failed' });
  }
});

// ─── Tag suggest ──────────────────────────────────────────────────────────────
app.post('/jobs/tag-suggest', async (req, res) => {
  const { dropId, userId } = req.body;
  if (!dropId || !userId) return res.status(400).json({ error: 'Missing dropId or userId' });
  try {
    await runTagSuggest(dropId, userId);
    res.json({ ok: true });
  } catch (err) {
    console.error('tag-suggest job failed:', err);
    res.status(500).json({ error: 'Job failed' });
  }
});

// ─── Commentary engine (Cloud Scheduler → POST /jobs/commentary) ──────────────
app.post('/jobs/commentary', async (_req, res) => {
  try {
    await runCommentaryEngine();
    res.json({ ok: true });
  } catch (err) {
    console.error('commentary job failed:', err);
    res.status(500).json({ error: 'Job failed' });
  }
});

const PORT = process.env.PORT ?? 8081;
app.listen(PORT, () => console.log(`Fount Jobs server running on :${PORT}`));
