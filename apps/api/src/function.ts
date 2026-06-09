/**
 * Firebase Functions entry point (Gen 1).
 * Gen 1 does not require Cloud Build service account permissions.
 * Wraps the Express app as a callable HTTP function.
 */

import * as functions from 'firebase-functions';
import app from './index';

// Secrets are loaded via environment variables set in Firebase Functions config
export const api = functions
  .region('us-central1')
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60,
    maxInstances: 10,
    secrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'PINECONE_API_KEY'],
  })
  .https.onRequest(app);
