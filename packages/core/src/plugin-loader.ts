import type { NextPressPlugin, PluginContext, AdminPage } from '@nextpress/types';
import { hooks } from './hooks';
import { prisma } from '@nextpress/db';
import path from 'path';
import fs from 'fs/promises';

interface PluginLoaderOptions {
  registerAdminPage?: (page: AdminPage & { pluginId: string }) => void;
}

export class PluginLoader {
  private loaded = new Map<string, NextPressPlugin>();
  private pluginsDir: string;
  private options: PluginLoaderOptions;

  constructor(pluginsDir: string, options: PluginLoaderOptions = {}) {
    this.pluginsDir = pluginsDir;
    this.options = options;
  }

  async loadAll(): Promise<void> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.pluginsDir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      const indexPath = path.join(this.pluginsDir, entry, 'index.ts');
      try {
        const stat = await fs.stat(indexPath);
        if (!stat.isFile()) continue;

        const mod = await import(indexPath) as { default: NextPressPlugin };
        const plugin = mod.default;

        const baseContext: PluginContext = { hooks, db: prisma };

        // Only attach registerAdminPage if a handler is provided
        const pluginContext: PluginContext = this.options.registerAdminPage
          ? {
              ...baseContext,
              registerAdminPage: (page: AdminPage) =>
                this.options.registerAdminPage!({ ...page, pluginId: plugin.id }),
            }
          : baseContext;

        await plugin.register(pluginContext);
        this.loaded.set(plugin.id, plugin);
        await hooks.doAction('plugin.activated', plugin);
        console.log(`[NextPress] Plugin loaded: ${plugin.name} v${plugin.version}`);
      } catch (err) {
        console.error(`[NextPress] Failed to load plugin: ${entry}`, err);
      }
    }
  }

  getLoaded(): NextPressPlugin[] {
    return Array.from(this.loaded.values());
  }
}
