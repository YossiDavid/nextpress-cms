import path from 'path';
import { PluginLoader } from '@nextpress/core';
import { pluginRegistry } from './plugin-registry';

// Use globalThis to survive Next.js HMR in dev mode
const g = globalThis as typeof globalThis & { _npPluginsInit?: Promise<void> };

async function doInit(): Promise<void> {
  const pluginsDir = path.join(process.cwd(), '..', '..', 'plugins');
  const loader = new PluginLoader(pluginsDir, {
    registerAdminPage: (page) => pluginRegistry.registerAdminPage(page),
  });
  await loader.loadAll();
}

export function initPlugins(): Promise<void> {
  if (!g._npPluginsInit) {
    g._npPluginsInit = doInit().catch((err) => {
      // Reset on failure so it can retry
      g._npPluginsInit = undefined;
      console.error('[NextPress] Plugin init failed:', err);
    }) as Promise<void>;
  }
  return g._npPluginsInit;
}
