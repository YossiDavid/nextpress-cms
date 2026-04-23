import { prisma } from '@nextpress/db';
import { ApiKeysPanel } from '@/components/admin/ApiKeysPanel';

export default async function ApiKeysPage() {
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true, lastUsedAt: true },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">מפתחות API</h1>
        <p className="text-muted-foreground text-sm mt-1">
          מפתחות לגישה חיצונית ל-API. שלח כ-<code className="font-mono text-xs">Authorization: Bearer &lt;key&gt;</code>
        </p>
      </div>
      <ApiKeysPanel initialKeys={keys} />
    </div>
  );
}
