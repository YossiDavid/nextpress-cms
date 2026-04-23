import cron from 'node-cron';
import { prisma } from '@nextpress/db';

export function startScheduler() {
  // Publish scheduled posts every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const result = await prisma.post.updateMany({
        where: {
          status: 'SCHEDULED',
          publishedAt: { lte: now },
        },
        data: { status: 'PUBLISHED' },
      });

      if (result.count > 0) {
        console.log(`[Scheduler] Published ${result.count} scheduled posts`);
      }
    } catch (err) {
      console.error('[Scheduler] Error publishing scheduled posts:', err);
    }
  });

  console.log('[Scheduler] Started');
}
