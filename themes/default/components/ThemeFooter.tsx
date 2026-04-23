import { prisma } from '@nextpress/db';
import { SlotRenderer } from '../../../apps/web/components/frontend/SlotRenderer';

export async function ThemeFooter() {
  const [titleOpt, descOpt] = await Promise.all([
    prisma.option.findUnique({ where: { key: 'site_title' } }),
    prisma.option.findUnique({ where: { key: 'site_description' } }),
  ]);

  const siteTitle = titleOpt?.value ?? 'NextPress';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background mt-16">
      {/* footer-start slot — plugins can inject content above footer */}
      <SlotRenderer slot="footer-start" className="max-w-5xl mx-auto px-6 pt-8" />
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-2 text-center">
        <p className="font-semibold text-foreground">{siteTitle}</p>
        {descOpt?.value && (
          <p className="text-sm text-muted-foreground">{descOpt.value}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          &copy; {year} {siteTitle} &mdash; Powered by NextPress
        </p>
      </div>
    </footer>
  );
}
