import path from 'path';
import fs from 'fs/promises';
import { prisma } from '@nextpress/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { PluginToggle } from './PluginToggle';

interface PluginMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  active: boolean;
}

async function getPlugins(): Promise<PluginMeta[]> {
  const pluginsDir = path.join(process.cwd(), '..', '..', 'plugins');
  let entries: string[] = [];
  try {
    entries = await fs.readdir(pluginsDir);
  } catch {
    return [];
  }

  // Load all active options at once
  const options = await prisma.option.findMany({
    where: { key: { startsWith: 'plugin_active_' } },
  });
  const activeMap = new Map(options.map((o) => [o.key, o.value === 'true']));

  const plugins: PluginMeta[] = [];

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    const entryPath = path.join(pluginsDir, entry);
    try {
      const stat = await fs.stat(entryPath);
      if (!stat.isDirectory()) continue;

      let name = entry;
      let version = '0.0.0';
      let description = '';

      try {
        const pkgRaw = await fs.readFile(path.join(entryPath, 'package.json'), 'utf-8');
        const pkg = JSON.parse(pkgRaw) as { name?: string; version?: string; description?: string };
        name = pkg.name ?? entry;
        version = pkg.version ?? '0.0.0';
        description = pkg.description ?? '';
      } catch {
        // no package.json — use directory name
      }

      const active = activeMap.get(`plugin_active_${entry}`) ?? false;

      plugins.push({ id: entry, name, version, description, active });
    } catch {
      // skip unreadable entries
    }
  }

  return plugins;
}

export default async function PluginsPage() {
  const plugins = await getPlugins();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">תוספים</h1>
        <p className="text-muted-foreground text-sm mt-1">ניהול תוספים מותקנים</p>
      </div>

      {plugins.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-2">ללא תוספים</p>
            <p className="text-sm text-muted-foreground">הוסף תוספים לתיקיית /plugins</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plugins.map((plugin) => (
            <Card key={plugin.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{plugin.name}</CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">v{plugin.version}</Badge>
                      {plugin.active && <Badge variant="default" className="text-xs">פעיל</Badge>}
                    </div>
                    {plugin.description && (
                      <p className="text-sm text-muted-foreground mt-1">{plugin.description}</p>
                    )}
                  </div>
                  <PluginToggle pluginId={plugin.id} active={plugin.active} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
