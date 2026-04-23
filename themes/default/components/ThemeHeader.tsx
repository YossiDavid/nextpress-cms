import Link from 'next/link';
import { prisma } from '@nextpress/db';
import { getCart } from '../../../apps/web/lib/cart';
import { CartCount } from '../../../apps/web/components/frontend/CartCount';
import { SlotRenderer } from '../../../apps/web/components/frontend/SlotRenderer';
import { SearchInput } from './SearchInput';
import { AccountLink } from './AccountLink';

export async function ThemeHeader() {
  const [siteTitle, menu, cart] = await Promise.all([
    prisma.option.findUnique({ where: { key: 'site_title' } }),
    prisma.menu.findFirst({
      where: { slug: 'main' },
      include: {
        items: { where: { parentId: null }, orderBy: { order: 'asc' } },
      },
    }),
    getCart(),
  ]);

  const cartTotal = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo / Site Title */}
        <Link href="/" className="font-bold text-lg tracking-tight flex-shrink-0">
          {siteTitle?.value ?? 'NextPress'}
        </Link>

        {/* Nav */}
        {menu && menu.items.length > 0 && (
          <nav className="flex items-center gap-6 text-sm">
            {menu.items.map((item) => (
              <Link
                key={item.id}
                href={item.url ?? `/${item.postId ?? ''}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Search */}
        <SearchInput />

        {/* Account */}
        <AccountLink />

        {/* Cart */}
        <CartCount count={cartTotal} />
      </div>
      {/* header-end slot — plugins can inject banners, notices, etc. */}
      <SlotRenderer slot="header-end" />
    </header>
  );
}
