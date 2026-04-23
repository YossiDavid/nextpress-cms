import { prisma } from '@nextpress/db';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ספריית מדיה</h1>
        <p className="text-muted-foreground text-sm mt-1">תמונות, קבצים ומדיה</p>
      </div>
      <MediaLibrary initialMedia={media} />
    </div>
  );
}
