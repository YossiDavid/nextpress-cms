'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'לוח בקרה', href: '/admin', icon: '📊' },
  { label: 'פוסטים', href: '/admin/post-types/post', icon: '📝' },
  { label: 'עמודים', href: '/admin/post-types/page', icon: '📄' },
  { label: 'מוצרים', href: '/admin/post-types/product', icon: '🛍️' },
  { label: 'קטגוריות', href: '/admin/product-categories', icon: '📂' },
  { label: 'תגיות', href: '/admin/product-tags', icon: '🔖' },
  { label: 'הזמנות', href: '/admin/orders', icon: '📦' },
  { label: 'קופונים', href: '/admin/coupons', icon: '🏷️' },
  { label: 'משלוח', href: '/admin/shipping', icon: '🚚' },
  { label: 'מדיה', href: '/admin/media', icon: '🖼️' },
  { label: 'משתמשים', href: '/admin/users', icon: '👤' },
  { label: 'מפתחות API', href: '/admin/api-keys', icon: '🔑' },
  { label: 'תוספים', href: '/admin/plugins', icon: '🔌' },
  { label: 'הגדרות', href: '/admin/settings', icon: '⚙️' },
  { label: 'תפריטים', href: '/admin/menus', icon: '🗂️' },
  { label: 'עדכונים', href: '/admin/updates', icon: '🔄' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-card border-l border-border flex flex-col h-full flex-shrink-0">
      <div className="p-4 h-14 flex items-center border-b border-border">
        <span className="font-semibold text-sm tracking-tight">NextPress</span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full text-right text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
        >
          יציאה מהמערכת
        </button>
      </div>
    </aside>
  );
}
