import fs from 'fs/promises';
import path from 'path';

export async function findProjectRoot(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    const pkgPath = path.join(dir, 'package.json');
    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(raw);
      if (pkg.name === 'nextpress-app' || pkg.nextpress) {
        return dir;
      }
    } catch {}

    // Check for plugins dir as a signal
    try {
      await fs.access(path.join(dir, 'plugins'));
      return dir;
    } catch {}

    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('Could not find NextPress project root. Run this command from inside a NextPress project.');
    }
    dir = parent;
  }
}

export async function findPluginsDir(startDir = process.cwd()) {
  const root = await findProjectRoot(startDir);
  const pluginsDir = path.join(root, 'plugins');
  await fs.mkdir(pluginsDir, { recursive: true });
  return pluginsDir;
}
