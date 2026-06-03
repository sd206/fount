/**
 * Cloud Tasks client — enqueue background jobs.
 * All async work (embedding, tag suggestion, commentary) goes through here.
 */

import { CloudTasksClient } from '@google-cloud/tasks';

const client = new CloudTasksClient();

const PROJECT = process.env.GCP_PROJECT_ID!;
const REGION = process.env.GCP_REGION ?? 'us-central1';
const JOBS_URL = process.env.JOBS_SERVICE_URL!; // e.g. https://jobs-xxxx-uc.a.run.app

function queuePath(queue: string) {
  return client.queuePath(PROJECT, REGION, queue);
}

interface EnqueueOptions {
  queue: 'embed' | 'tag-suggest' | 'commentary';
  endpoint: string;
  body: Record<string, unknown>;
  delaySeconds?: number;
}

export async function enqueue({ queue, endpoint, body, delaySeconds }: EnqueueOptions) {
  const url = `${JOBS_URL}${endpoint}`;
  const payload = Buffer.from(JSON.stringify(body)).toString('base64');

  const task: any = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      oidcToken: {
        serviceAccountEmail: process.env.JOBS_SERVICE_ACCOUNT,
      },
    },
  };

  if (delaySeconds) {
    const scheduleTime = new Date(Date.now() + delaySeconds * 1000);
    task.scheduleTime = {
      seconds: Math.floor(scheduleTime.getTime() / 1000),
    };
  }

  await client.createTask({ parent: queuePath(queue), task });
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const enqueueEmbed = (dropId: string, userId: string) =>
  enqueue({ queue: 'embed', endpoint: '/jobs/embed', body: { dropId, userId } });

export const enqueueTagSuggest = (dropId: string, userId: string) =>
  enqueue({ queue: 'tag-suggest', endpoint: '/jobs/tag-suggest', body: { dropId, userId } });
