#!/usr/bin/env node
import prompts from 'prompts';
import kleur from 'kleur';
import { execa } from 'execa';
import tiged from 'tiged';
import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const { bold, green, cyan, yellow, red, dim } = kleur;

const NEXTPRESS_REPO = 'YossiDavid/nextpress-cms';

// Accept directory as first CLI argument (e.g. npx create-nextpress-cms . or npx create-nextpress-cms my-site)
const argDir = process.argv[2];
const argIsInPlace = argDir === '.';

console.log('');
console.log(bold().cyan('  NextPress'));
console.log(dim('  A modern CMS + eCommerce built with Next.js'));
console.log('');

const response = await prompts(
  [
    {
      type: argIsInPlace ? null : 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: argDir ?? 'my-nextpress-site',
      validate: (v) =>
        v === '.' || /^[a-z0-9-_]+$/.test(v) || 'Use lowercase letters, numbers, hyphens or underscores',
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
        { title: 'Supabase — managed Postgres (recommended)', value: 'supabase' },
        { title: 'Neon — serverless Postgres',                value: 'neon' },
        { title: 'Docker Compose — local Postgres',           value: 'postgres-docker' },
        { title: 'PostgreSQL — I have my own',                value: 'postgres-existing' },
      ],
      initial: 0,
    },
    // Supabase project URL
    {
      type: (_, v) => v.database === 'supabase' ? 'text' : null,
      name: 'supabaseUrl',
      message: 'Supabase project URL:',
      hint: 'Dashboard → Settings → API → Project URL',
      initial: 'https://your-project-ref.supabase.co',
      validate: (v) => v.startsWith('https://') || 'Must start with https://',
    },
    // Supabase anon key
    {
      type: (_, v) => v.database === 'supabase' ? 'text' : null,
      name: 'supabaseAnonKey',
      message: 'Supabase anon key:',
      hint: 'Dashboard → Settings → API → anon public',
    },
    // Supabase service role key
    {
      type: (_, v) => v.database === 'supabase' ? 'password' : null,
      name: 'supabaseServiceKey',
      message: 'Supabase service role key:',
      hint: 'Dashboard → Settings → API → service_role (keep this secret)',
    },
    // Supabase — pooled URL (runtime)
    {
      type: (_, v) => v.database === 'supabase' ? 'text' : null,
      name: 'databaseUrl',
      message: 'Supabase connection string (Transaction mode, port 6543):',
      hint: 'Dashboard → Settings → Database → Connection string → Transaction mode',
      initial: 'postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres',
      validate: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://') || 'Must be a PostgreSQL connection string',
    },
    // Supabase — direct URL (migrations)
    {
      type: (_, v) => v.database === 'supabase' ? 'text' : null,
      name: 'directUrl',
      message: 'Supabase direct connection string (port 5432, for migrations):',
      hint: 'Dashboard → Settings → Database → Connection string → Session mode',
      initial: 'postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres',
      validate: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://') || 'Must be a PostgreSQL connection string',
    },
    // Neon
    {
      type: (_, v) => v.database === 'neon' ? 'text' : null,
      name: 'databaseUrl',
      message: 'Neon connection string:',
      hint: 'Dashboard → your project → Connection Details → copy the connection string',
      initial: 'postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require',
      validate: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://') || 'Must be a PostgreSQL connection string',
    },
    // Existing / custom Postgres
    {
      type: (_, v) => v.database === 'postgres-existing' ? 'text' : null,
      name: 'databaseUrl',
      message: 'Database URL:',
      initial: 'postgresql://user:password@localhost:5432/nextpress',
      validate: (v) => v.startsWith('postgresql://') || v.startsWith('postgres://') || 'Must be a PostgreSQL connection string',
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
  ],
  {
    onCancel: () => {
      console.log(red('\n  Cancelled.\n'));
      process.exit(1);
    },
  },
);

const projectName = response.projectName ?? argDir ?? 'my-nextpress-site';
const { siteTitle, database, adminEmail, adminPassword, databaseUrl, directUrl, supabaseUrl, supabaseAnonKey, supabaseServiceKey } = response;
const isInPlace = projectName === '.';
const projectDir = isInPlace ? process.cwd() : resolve(process.cwd(), projectName);

function step(msg) {
  process.stdout.write(`\n  ${cyan('→')} ${msg}... `);
}
function ok() {
  process.stdout.write(green('✓'));
}
function warn(msg) {
  process.stdout.write(yellow(`⚠ ${msg}`));
}

// Print setup hints for managed DB providers before we start downloading
if (database === 'supabase') {
  console.log('');
  console.log(`  ${bold('Supabase setup:')} https://supabase.com/dashboard/new`);
  console.log(dim('  1. Create a new project'));
  console.log(dim('  2. Settings → Database → Connection string → Transaction mode'));
  console.log(dim('  3. Copy the connection string (port 6543)'));
  console.log('');
} else if (database === 'neon') {
  console.log('');
  console.log(`  ${bold('Neon setup:')} https://console.neon.tech`);
  console.log(dim('  1. Create a new project'));
  console.log(dim('  2. Connection Details → copy the connection string'));
  console.log('');
}

console.log('');

// 1. Download NextPress
if (isInPlace) {
  const existing = readdirSync(projectDir).filter(f => f !== '.git');
  if (existing.length > 0) {
    console.error(red(`\n  Error: current directory is not empty. Please run in an empty folder.\n`));
    process.exit(1);
  }
  step('Downloading NextPress into current directory');
} else {
  if (existsSync(projectDir)) {
    console.error(red(`\n  Error: "${projectName}" already exists.\n`));
    process.exit(1);
  }
  mkdirSync(projectDir, { recursive: true });
  step('Downloading NextPress');
}

try {
  const emitter = tiged(NEXTPRESS_REPO, { disableCache: true, force: true });
  await emitter.clone(projectDir);
  ok();
} catch (e) {
  try {
    warn(`degit failed (${e.message}), trying git clone`);
    await execa('git', ['clone', '--depth=1', `https://github.com/${NEXTPRESS_REPO}.git`, projectDir], {
      stdio: 'inherit',
    });
    ok();
  } catch {
    console.error(red(`\n\n  Could not download NextPress. Check your internet connection or visit:\n  https://github.com/${NEXTPRESS_REPO}\n`));
    process.exit(1);
  }
}

// 2. Write .env.local
step('Writing .env.local');
const dbUrl =
  database === 'postgres-docker'
    ? `postgresql://nextpress:nextpress@localhost:5432/nextpress`
    : (databaseUrl ?? 'postgresql://user:password@localhost:5432/nextpress');

const authSecret = Buffer.from(
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
).toString('base64');

// DIRECT_URL is only needed for Supabase (pooled vs direct connection).
// For all other drivers, Prisma falls back to DATABASE_URL when DIRECT_URL is missing.
const directUrlLine = directUrl ? `DIRECT_URL="${directUrl}"` : `DIRECT_URL="${dbUrl}"`;

const revalidateSecret = Buffer.from(
  Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
).toString('base64');

const envLines = [
  `DATABASE_URL="${dbUrl}"`,
  directUrlLine,
  `AUTH_SECRET="${authSecret}"`,
  `NEXT_PUBLIC_URL="http://localhost:3000"`,
  `API_URL="http://localhost:3001"`,
  `REVALIDATE_SECRET="${revalidateSecret}"`,
  `ADMIN_EMAIL="${adminEmail}"`,
  `ADMIN_PASSWORD="${adminPassword}"`,
  `SITE_TITLE="${siteTitle}"`,
];

if (database === 'supabase') {
  envLines.push(
    `SUPABASE_URL="${supabaseUrl}"`,
    `SUPABASE_ANON_KEY="${supabaseAnonKey}"`,
    `SUPABASE_SERVICE_ROLE_KEY="${supabaseServiceKey}"`,
    `SUPABASE_STORAGE_BUCKET="media"`,
    `STORAGE_DRIVER="supabase"`,
  );
} else {
  envLines.push(
    `STORAGE_DRIVER="local"`,
    `UPLOAD_DIR="./uploads"`,
    `UPLOAD_URL="http://localhost:3000/uploads"`,
  );
}

const envContent = envLines.join('\n') + '\n';

// Write to root (for Prisma CLI / db:migrate / db:seed)
writeFileSync(join(projectDir, '.env.local'), envContent);
// Write to apps/web (Next.js reads env from its own directory)
mkdirSync(join(projectDir, 'apps', 'web'), { recursive: true });
writeFileSync(join(projectDir, 'apps', 'web', '.env.local'), envContent);
ok();

// 3. Install dependencies
step('Installing dependencies');
try {
  await execa('pnpm', ['install'], { cwd: projectDir, stdio: 'ignore' });
  ok();
} catch {
  warn('install failed — run `pnpm install` manually');
}

// 4. Generate Prisma client (postinstall should handle this, but be explicit)
step('Generating Prisma client');
try {
  await execa('pnpm', ['--filter', '@nextpress/db', 'db:generate'], { cwd: projectDir, stdio: 'ignore' });
  ok();
} catch {
  warn('prisma generate failed — run `pnpm --filter @nextpress/db db:generate` manually');
}

// 5. Start database if using Docker
if (database === 'postgres-docker') {
  step('Starting database (Docker)');
  try {
    await execa('docker', ['compose', '-f', 'docker-compose.dev.yml', 'up', '-d'], {
      cwd: projectDir,
      stdio: 'ignore',
    });
    ok();
    // Wait for Postgres to be ready
    process.stdout.write(dim(' waiting for Postgres'));
    await new Promise((r) => setTimeout(r, 4000));
  } catch {
    warn('docker compose failed — start Postgres manually, then run `pnpm db:deploy && pnpm db:seed`');
  }
}

// 6. Run migrations
step('Running database migrations');
try {
  await execa('pnpm', ['db:deploy'], { cwd: projectDir, stdio: 'ignore' });
  ok();
} catch {
  warn('migration failed — run \`pnpm db:deploy\` manually');
}

// 7. Seed database
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

// 8. Done
console.log('\n');
console.log(bold().green('  ✔ NextPress is ready!'));
console.log('');

if (!isInPlace) {
  console.log(`  ${cyan('1.')} cd ${projectName}`);
  console.log(`  ${cyan('2.')} pnpm dev:web`);
} else {
  console.log(`  ${cyan('1.')} pnpm dev:web`);
}

console.log('');
console.log(`  ${bold('Admin:')}    ${cyan('http://localhost:3000/admin')}`);
console.log(`  ${bold('Site:')}     ${cyan('http://localhost:3000')}`);
console.log(`  ${bold('Login:')}    ${cyan(adminEmail)}`);
console.log('');
