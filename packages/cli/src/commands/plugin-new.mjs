import kleur from 'kleur';
import fs from 'fs/promises';
import path from 'path';
import { findPluginsDir } from '../utils/find-root.mjs';

export async function pluginNew(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const pluginsDir = await findPluginsDir();
  const dest = path.join(pluginsDir, slug);

  try {
    await fs.access(dest);
    console.error(kleur.red(`Plugin "${slug}" already exists at ${dest}`));
    process.exit(1);
  } catch {
    // doesn't exist — good
  }

  await fs.mkdir(dest, { recursive: true });

  // package.json
  await fs.writeFile(path.join(dest, 'package.json'), JSON.stringify({
    name: `nextpress-plugin-${slug}`,
    version: '0.1.0',
    description: `NextPress plugin: ${slug}`,
    type: 'module',
  }, null, 2) + '\n');

  // index.ts
  await fs.writeFile(path.join(dest, 'index.ts'), `import type { NextPressPlugin, PluginContext } from '@nextpress/types';

const plugin: NextPressPlugin = {
  id: '${slug}',
  name: '${name}',
  version: '0.1.0',
  description: 'A NextPress plugin',
  author: 'Your Name',

  async register({ hooks, db }: PluginContext) {
    // Register action hooks
    hooks.addAction('post.afterSave', async (post) => {
      // Do something after a post is saved
    });

    // Register filter hooks
    hooks.addFilter('product.price', async (price, product) => {
      // Modify product price
      return price;
    });

    // Example: custom admin page
    // ctx.registerAdminPage?.({
    //   label: '${name}',
    //   href: '/admin/plugins/${slug}',
    
    // });
  },
};

export default plugin;
`);

  // README
  await fs.writeFile(path.join(dest, 'README.md'), `# nextpress-plugin-${slug}

A NextPress plugin.

## Installation

Copy this folder to your NextPress project's \`/plugins\` directory.

## Development

Edit \`index.ts\` to implement your plugin logic.
`);

  console.log(kleur.green(`✔ Plugin scaffolded at plugins/${slug}/`));
  console.log(`  ${kleur.dim('index.ts')}     — plugin entry point`);
  console.log(`  ${kleur.dim('package.json')} — plugin manifest`);
  console.log(`\n${kleur.bold('Next steps:')}`);
  console.log(`  1. Edit ${kleur.cyan(`plugins/${slug}/index.ts`)}`);
  console.log(`  2. Restart your dev server — the plugin loads automatically`);
}
