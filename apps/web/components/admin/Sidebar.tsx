'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, File, ShoppingBag, FolderOpen, Tag,
  Package, Ticket, Truck, Image, Users, KeyRound, Puzzle,
  Settings, Menu, RefreshCw, type LucideIcon,
} from 'lucide-react';

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'לוח בקרה',   href: '/admin',                       icon: LayoutDashboard },
  { label: 'פוסטים',     href: '/admin/post-types/post',       icon: FileText },
  { label: 'עמודים',     href: '/admin/post-types/page',       icon: File },
  { label: 'מוצרים',     href: '/admin/post-types/product',    icon: ShoppingBag },
  { label: 'קטגוריות',   href: '/admin/product-categories',    icon: FolderOpen },
  { label: 'תגיות',      href: '/admin/product-tags',          icon: Tag },
  { label: 'הזמנות',     href: '/admin/orders',                icon: Package },
  { label: 'קופונים',    href: '/admin/coupons',               icon: Ticket },
  { label: 'משלוח',      href: '/admin/shipping',              icon: Truck },
  { label: 'מדיה',       href: '/admin/media',                 icon: Image },
  { label: 'משתמשים',    href: '/admin/users',                 icon: Users },
  { label: 'מפתחות API', href: '/admin/api-keys',              icon: KeyRound },
  { label: 'תוספים',     href: '/admin/plugins',               icon: Puzzle },
  { label: 'הגדרות',     href: '/admin/settings',              icon: Settings },
  { label: 'תפריטים',    href: '/admin/menus',                 icon: Menu },
  { label: 'עדכונים',    href: '/admin/updates',               icon: RefreshCw },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="w-60 bg-card border-l border-border flex flex-col h-full flex-shrink-0">
      <div className="p-4 h-14 flex items-center border-b border-border">
        <span className="font-semibold text-sm tracking-tight">NextPress</span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
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
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={handleSignOut}
          className="w-full text-right text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
        >
          יציאה מהמערכת
        </button>
      </div>
    </aside>
  );
}
