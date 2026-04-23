import kleur from 'kleur';
import fs from 'fs/promises';
import path from 'path';
import { findPluginsDir } from '../utils/find-root.mjs';

export async function pluginRemove(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const pluginsDir = await findPluginsDir();
  const dest = path.join(pluginsDir, slug);

  try {
    await fs.access(dest);
  } catch {
    console.error(kleur.red(`Plugin "${slug}" not found at ${dest}`));
    process.exit(1);
  }

  await fs.rm(dest, { recursive: true, force: true });

  console.log(kleur.green(`✔ Plugin "${slug}" removed.`));
}
