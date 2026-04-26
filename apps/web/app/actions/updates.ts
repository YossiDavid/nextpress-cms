'use server';

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { getSession } from '@/lib/auth-session';
import { revalidatePath } from 'next/cache';

const execAsync = promisify(exec);

const REPO = 'nextpress/nextpress';

export interface VersionInfo {
  current: string;
  latest: string | null;
  hasUpdate: boolean;
  changelog: string | null;
  publishedAt: string | null;
  error?: string;
}

export async function getVersionInfo(): Promise<VersionInfo> {
  const current = process.env.npm_package_version ?? '0.1.0';

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { 'User-Agent': 'NextPress-Updater' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { current, latest: null, hasUpdate: false, changelog: null, publishedAt: null };
    }

    const data = await res.json();
    const latest: string = data.tag_name?.replace(/^v/, '') ?? current;
    const hasUpdate = compareVersions(latest, current) > 0;

    return {
      current,
      latest,
      hasUpdate,
      changelog: data.body ?? null,
      publishedAt: data.published_at ?? null,
    };
  } catch (err) {
    return {
      current,
      latest: null,
      hasUpdate: false,
      changelog: null,
      publishedAt: null,
      error: 'לא ניתן לבדוק עדכונים כעת',
    };
  }
}

export async function runUpdate(): Promise<{ success: boolean; output: string }> {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, output: 'אין הרשאה' };
  }

  // Project root is 3 levels up from apps/web
  const projectRoot = path.resolve(process.cwd(), '../../..');

  try {
    const { stdout: pullOut, stderr: pullErr } = await execAsync('git pull', {
      cwd: projectRoot,
      timeout: 60_000,
    });

    const { stdout: migrateOut, stderr: migrateErr } = await execAsync(
      'pnpm db:migrate',
      { cwd: projectRoot, timeout: 120_000 }
    );

    revalidatePath('/admin/updates');

    return {
      success: true,
      output: [pullOut, pullErr, migrateOut, migrateErr].filter(Boolean).join('\n').trim(),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, output: msg };
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
