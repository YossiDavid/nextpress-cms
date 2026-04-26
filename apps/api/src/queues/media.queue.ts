import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const mediaQueue = new Queue('media', { connection });

export const mediaWorker = new Worker(
  'media',
  async (job) => {
    const { mediaId, action } = job.data as { mediaId: string; action: string };
    // TODO: image processing (resize, optimize, generate thumbnails)
    console.log(`[Media Queue] Processing ${action} for media ${mediaId}`);
  },
  { connection }
);

mediaWorker.on('completed', (job) => {
  console.log(`[Media Queue] Job ${job.id} completed`);
});

mediaWorker.on('failed', (job, err) => {
  console.error(`[Media Queue] Job ${job?.id} failed:`, err);
});
