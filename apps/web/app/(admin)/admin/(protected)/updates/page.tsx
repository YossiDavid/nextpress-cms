import { getVersionInfo } from '@/app/actions/updates';
import { UpdatesPanel } from '@/components/admin/UpdatesPanel';

export const dynamic = 'force-dynamic';

export default async function UpdatesPage() {
  const info = await getVersionInfo();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">עדכונים</h1>
        <p className="text-muted-foreground text-sm mt-1">בדוק ועדכן את גרסת NextPress</p>
      </div>
      <UpdatesPanel {...info} />
    </div>
  );
}
