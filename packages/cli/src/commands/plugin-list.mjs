import kleur from 'kleur';
import fs from 'fs/promises';
import path from 'path';
import { findPluginsDir } from '../utils/find-root.mjs';

export async function pluginList() {
  const pluginsDir = await findPluginsDir();

  let entries;
  try {
    entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  } catch {
    console.log(kleur.dim('No plugins directory found.'));
    return;
  }

  const dirs = entries.filter((e) => e.isDirectory());

  if (dirs.length === 0) {
    console.log(kleur.dim('No plugins installed.'));
    console.log(`  Run ${kleur.cyan('nextpress plugin new <name>')} to scaffold one.`);
    return;
  }

  console.log(kleur.bold('Installed plugins:\n'));

  for (const dir of dirs) {
    const pkgPath = path.join(pluginsDir, dir.name, 'package.json');
    let version = '';
    let description = '';
    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(raw);
      version = pkg.version ? kleur.dim(`v${pkg.version}`) : '';
      description = pkg.description ? kleur.dim(` — ${pkg.description}`) : '';
    } catch {}

    console.log(`  ${kleur.green('●')} ${kleur.cyan(dir.name)} ${version}${description}`);
  }
}
