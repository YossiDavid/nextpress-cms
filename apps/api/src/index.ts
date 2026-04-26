import express from 'express';
import cors from 'cors';
import { hooks } from '@nextpress/core';
import v1Router from './routes/v1/index.js';
import { startScheduler } from './crons/scheduler.js';

const app = express();
const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3001;

app.use(cors({ origin: process.env['NEXTJS_URL'] ?? 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'nextpress-api' }));
app.use('/api/v1', v1Router);

async function start() {
  await hooks.doAction('nextpress.ready');
  startScheduler();
  app.listen(PORT, () => console.log(`[NextPress API] Running on http://localhost:${PORT}`));
}

void start();
