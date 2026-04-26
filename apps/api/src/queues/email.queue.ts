import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email', { connection });

export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, body } = job.data as { to: string; subject: string; body: string };
    // TODO: integrate with email provider (SendGrid, SES, etc.)
    console.log(`[Email Queue] Sending to ${to}: ${subject}`);
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  console.log(`[Email Queue] Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Email Queue] Job ${job?.id} failed:`, err);
});
