'use client';

import Link from 'next/link';

interface Props {
  count: number;
}

export function CartCount({ count }: Props) {
  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1.5 text-sm hover:text-foreground transition-colors">
      <span className="sr-only">cart</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center px-0.5">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
