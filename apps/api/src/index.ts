import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
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

// ─── CORS — must be first, before auth and routes ────────────────────────────
const corsOptions: cors.CorsOptions = {
  origin: [
    'https://fount-app-prod-fb.web.app',
    'https://fount-app-prod-fb.firebaseapp.com',
    'http://localhost:3000',
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests before any other middleware
app.options('*', cors(corsOptions));

// ─── General middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// ─── Auth middleware — skip OPTIONS preflight ─────────────────────────────────
app.use('/v1', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') return next();
  return authenticate(req, res, next);
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/v1/drops', dropsRouter);
app.use('/v1/flows', flowsRouter);
app.use('/v1/search', searchRouter);
app.use('/v1/ai', aiRouter);
app.use('/v1/calendar', calendarRouter);
app.use('/v1/tasks', tasksRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// Only start the HTTP server when run directly (node dist/index.js).
// When imported by function.ts, require.main !== module so this is skipped.
if (require.main === module) {
  const PORT = process.env.PORT ?? 8080;
  app.listen(PORT, () => console.log(`Fount API running on :${PORT}`));
}

export default app;
