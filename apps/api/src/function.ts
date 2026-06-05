/**
 * Firebase Functions entry point.
 * Wraps the Express app as a callable HTTP function.
 */

import { onRequest } from 'firebase-functions/v2/https';
import app from './index';

export const api = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  app,
);
