import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { dropsRouter } from './routes/drops';
import { flowsRouter } from './routes/flows';
import { searchRouter } from './routes/search';
import { aiRouter } from './routes/ai';
import { calendarRouter } from './routes/calendar';
import { tasksRouter } from './routes/tasks';
import { authenticate } from './middleware/authenticate';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  'https://fount-app-prod-fb.web.app',
  'https://fount-app-prod-fb.firebaseapp.com',
  'http://localhost:3000',
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Routes (all require auth) ────────────────────────────────────────────────
app.use('/v1', authenticate);
app.use('/v1/drops', dropsRouter);
app.use('/v1/flows', flowsRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/ai', aiRouter);
app.use('/v1/calendar', calendarRouter);
app.use('/v1/tasks', tasksRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => console.log(`Fount API running on :${PORT}`));

export default app;
