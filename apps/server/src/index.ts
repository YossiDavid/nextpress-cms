import express from 'express';
import { emailQueue, emailWorker } from './queues/email.queue.js';
import { mediaQueue, mediaWorker } from './queues/media.queue.js';
import { startScheduler } from './crons/scheduler.js';
import { hooks } from '@nextpress/core';

const app = express();
const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3001;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', queues: ['email', 'media'] });
});

app.post('/api/queue/email', async (req, res) => {
  const job = await emailQueue.add('send-email', req.body as object);
  res.json({ jobId: job.id });
});

async function start() {
  await hooks.doAction('nextpress.ready');
  startScheduler();

  app.listen(PORT, () => {
    console.log(`[NextPress Server] Running on port ${PORT}`);
  });
}

void start();
