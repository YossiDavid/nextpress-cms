#!/usr/bin/env node
import prompts from 'prompts';
import kleur from 'kleur';
import { execa } from 'execa';
import tiged from 'tiged';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const { bold, green, cyan, yellow, red, dim } = kleur;

// Update this when the repo is published
const NEXTPRESS_REPO = 'nextpress-cms/nextpress';

console.log('');
console.log(bold().cyan('  NextPress'));
console.log(dim('  A modern CMS + eCommerce built with Next.js'));
console.log('');

const response = await prompts(
  [
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-nextpress-site',
      validate: (v) =>
        /^[a-z0-9-_]+$/.test(v) || 'Use lowercase letters, numbers, hyphens or underscores',
    },
    {
      type: 'text',
      name: 'siteTitle',
      message: 'Site title:',
      initial: 'My NextPress Site',
    },
    {
      type: 'select',
      name: 'database',
      message: 'Database:',
      choices: [
        { title: 'PostgreSQL via Docker Compose (recommended)', value: 'postgres-docker' },
        { title: 'PostgreSQL — I have my own', value: 'postgres-existing' },
      ],
      initial: 0,
    },
    {
      type: (_, values) => (values.database === 'postgres-existing' ? 'text' : null),
      name: 'databaseUrl',
      message: 'Database URL:',
      initial: 'postgresql://user:password@localhost:5432/nextpress',
    },
    {
      type: 'text',
      name: 'adminEmail',
      message: 'Admin email:',
      initial: 'admin@example.com',
      validate: (v) => v.includes('@') || 'Enter a valid email address',
    },
    {
      type: 'password',
      name: 'adminPassword',
      message: 'Admin password:',
      validate: (v) => v.length >= 8 || 'Password must be at least 8 characters',
    },
    {
      type: 'confirm',
      name: 'autoSetup',
      message: 'Run install + database setup automatically?',
      initial: true,
    },
  ],
  {
    onCancel: () => {
      console.log(red('\n  Cancelled.\n'));
      process.exit(1);
    },
  },
);

const { projectName, siteTitle, database, adminEmail, adminPassword, databaseUrl, autoSetup } = response;
const projectDir = join(process.cwd(), projectName);

function step(msg) {
  process.stdout.write(`\n  ${cyan('→')} ${msg}... `);
}
function ok() {
  process.stdout.write(green('✓'));
}
function warn(msg) {
  process.stdout.write(yellow(`⚠ ${msg}`));
}

console.log('');

// 1. Check target directory
if (existsSync(projectDir)) {
  console.error(red(`\n  Error: "${projectName}" already exists.\n`));
  process.exit(1);
}

// 2. Download NextPress via degit (no git history)
step('Downloading NextPress');
try {
  const emitter = tiged(NEXTPRESS_REPO, { disableCache: true, force: true });
  await emitter.clone(projectDir);
  ok();
} catch {
  // Fallback: git clone (works when repo not on GitHub yet, e.g. local dev)
  try {
    mkdirSync(projectDir, { recursive: true });
    warn('degit failed, trying git clone');
    await execa('git', ['clone', '--depth=1', `https://github.com/${NEXTPRESS_REPO}.git`, projectDir], {
      stdio: 'ignore',
    });
    ok();
  } catch {
    console.error(red(`\n\n  Could not download NextPress. Check your internet connection or visit:\n  https://github.com/${NEXTPRESS_REPO}\n`));
    process.exit(1);
  }
}

// 3. Write .env.local
step('Writing .env.local');
const dbUrl =
  database === 'postgres-docker'
    ? `postgresql://nextpress:nextpress@localhost:5432/nextpress`
    : (databaseUrl ?? 'postgresql://user:password@localhost:5432/nextpress');

const authSecret = Buffer.from(
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
).toString('base64');

const envContent = [
  `DATABASE_URL="${dbUrl}"`,
  `AUTH_SECRET="${authSecret}"`,
  `NEXT_PUBLIC_URL="http://localhost:3000"`,
  `ADMIN_EMAIL="${adminEmail}"`,
  `ADMIN_PASSWORD="${adminPassword}"`,
  `SITE_TITLE="${siteTitle}"`,
  `UPLOAD_DIR="./uploads"`,
  `UPLOAD_URL="http://localhost:3000/uploads"`,
].join('\n') + '\n';

writeFileSync(join(projectDir, '.env.local'), envContent);
ok();

// 4. Auto setup
if (autoSetup) {
  step('Installing dependencies');
  try {
    await execa('pnpm', ['install'], { cwd: projectDir, stdio: 'ignore' });
    ok();
  } catch {
    warn('install failed — run `pnpm install` manually');
  }

  if (database === 'postgres-docker') {
    step('Starting database (Docker)');
    try {
      // Only start the db service, not the full stack
      await execa('docker', ['compose', '-f', 'docker-compose.dev.yml', 'up', '-d'], {
        cwd: projectDir,
        stdio: 'ignore',
      });
      ok();
      // Wait for Postgres to be ready
      await new Promise((r) => setTimeout(r, 3000));
    } catch {
      warn('docker compose failed — start Postgres manually');
    }
  }

  step('Running database migrations');
  try {
    await execa('pnpm', ['db:migrate'], { cwd: projectDir, stdio: 'ignore' });
    ok();
  } catch {
    warn('migration failed — run `pnpm db:migrate` manually');
  }

  step('Seeding database');
  try {
    await execa('pnpm', ['db:seed'], {
      cwd: projectDir,
      stdio: 'ignore',
      env: {
        ...process.env,
        ADMIN_EMAIL: adminEmail,
        ADMIN_PASSWORD: adminPassword,
        SITE_TITLE: siteTitle,
      },
    });
    ok();
  } catch {
    warn('seed failed — run `pnpm db:seed` manually');
  }
}

// 5. Done
console.log('\n');
console.log(bold().green('  ✔ NextPress is ready!'));
console.log('');

if (!autoSetup) {
  console.log(bold('  Next steps:'));
  console.log('');
  console.log(`  ${cyan('1.')} cd ${projectName}`);
  console.log(`  ${cyan('2.')} pnpm install`);
  if (database === 'postgres-docker') {
    console.log(`  ${cyan('3.')} docker compose -f docker-compose.dev.yml up -d`);
    console.log(`  ${cyan('4.')} pnpm db:migrate && pnpm db:seed`);
    console.log(`  ${cyan('5.')} pnpm dev:web`);
  } else {
    console.log(`  ${cyan('3.')} pnpm db:migrate && pnpm db:seed`);
    console.log(`  ${cyan('4.')} pnpm dev:web`);
  }
  console.log('');
} else {
  console.log(`  ${cyan('1.')} cd ${projectName}`);
  console.log(`  ${cyan('2.')} pnpm dev:web`);
  console.log('');
}

console.log(`  ${bold('Admin:')}    ${cyan('http://localhost:3000/admin')}`);
console.log(`  ${bold('Site:')}     ${cyan('http://localhost:3000')}`);
console.log(`  ${bold('Login:')}    ${cyan(adminEmail)}`);
console.log('');
