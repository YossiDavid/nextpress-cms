import type { Metadata } from 'next';
import { prisma } from '@nextpress/db';
import { ThemeHeader, ThemeFooter } from '@nextpress/theme-default';
import { initPlugins } from '@/lib/init-plugins';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const [titleOpt, descOpt, urlOpt] = await Promise.all([
    prisma.option.findUnique({ where: { key: 'site_title' } }),
    prisma.option.findUnique({ where: { key: 'site_description' } }),
    prisma.option.findUnique({ where: { key: 'site_url' } }),
  ]);
  const siteTitle = titleOpt?.value ?? 'NextPress';
  const siteUrl = urlOpt?.value ?? '';
  return {
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    description: descOpt?.value ?? 'NextPress Site',
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    openGraph: { siteName: siteTitle, locale: 'he_IL', type: 'website' },
    robots: { index: true, follow: true },
  };
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  await initPlugins();
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background text-foreground">
        <ThemeHeader />
        {children}
        <ThemeFooter />
      </body>
    </html>
  );
}
