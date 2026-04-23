import kleur from 'kleur';
import { pluginAdd } from './commands/plugin-add.mjs';
import { pluginNew } from './commands/plugin-new.mjs';
import { pluginList } from './commands/plugin-list.mjs';
import { pluginRemove } from './commands/plugin-remove.mjs';

const HELP = `
${kleur.bold('nextpress')} — CLI for NextPress projects

${kleur.bold('Usage:')}
  nextpress <command> [options]

${kleur.bold('Commands:')}
  plugin add <name>     Install a plugin from npm (nextpress-plugin-<name>)
  plugin new <name>     Scaffold a new plugin in /plugins/<name>
  plugin list           List installed plugins
  plugin remove <name>  Remove an installed plugin

${kleur.bold('Examples:')}
  nextpress plugin new my-plugin
  nextpress plugin add seo
  nextpress plugin list
`;

export async function run(args) {
  const [cmd, sub, name] = args;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(HELP);
    return;
  }

  if (cmd === 'plugin') {
    switch (sub) {
      case 'add':
        if (!name) { console.error(kleur.red('Usage: nextpress plugin add <name>')); process.exit(1); }
        return pluginAdd(name);
      case 'new':
        if (!name) { console.error(kleur.red('Usage: nextpress plugin new <name>')); process.exit(1); }
        return pluginNew(name);
      case 'list':
        return pluginList();
      case 'remove':
        if (!name) { console.error(kleur.red('Usage: nextpress plugin remove <name>')); process.exit(1); }
        return pluginRemove(name);
      default:
        console.error(kleur.red(`Unknown plugin command: ${sub}`));
        console.log(HELP);
        process.exit(1);
    }
  }

  console.error(kleur.red(`Unknown command: ${cmd}`));
  console.log(HELP);
  process.exit(1);
}
