import kleur from 'kleur';
import { execa } from 'execa';
import { findProjectRoot } from '../utils/find-root.mjs';

export async function pluginAdd(name) {
  const packageName = name.startsWith('nextpress-plugin-')
    ? name
    : `nextpress-plugin-${name}`;

  const root = await findProjectRoot();

  console.log(kleur.dim(`Installing ${packageName}...`));

  try {
    // Detect package manager
    const pm = await detectPackageManager(root);
    const installCmd = pm === 'yarn' ? ['yarn', 'add', packageName]
      : pm === 'pnpm' ? ['pnpm', 'add', packageName]
      : ['npm', 'install', packageName];

    await execa(installCmd[0], installCmd.slice(1), { cwd: root, stdio: 'inherit' });

    console.log(kleur.green(`✔ Plugin "${packageName}" installed.`));
    console.log(`  Restart your dev server to activate it.`);
  } catch (err) {
    console.error(kleur.red(`Failed to install ${packageName}: ${err.message}`));
    process.exit(1);
  }
}

async function detectPackageManager(root) {
  const { default: fs } = await import('fs/promises');
  const path = await import('path');
  try {
    await fs.access(path.join(root, 'pnpm-lock.yaml'));
    return 'pnpm';
  } catch {}
  try {
    await fs.access(path.join(root, 'yarn.lock'));
    return 'yarn';
  } catch {}
  return 'npm';
}
