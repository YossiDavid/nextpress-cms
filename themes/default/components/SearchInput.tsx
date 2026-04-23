'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Result {
  slug: string;
  title: string;
  postType: { name: string };
}

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data: Result[] = await res.json();
    setResults(data);
    setOpen(data.length > 0);
    setActive(-1);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  function navigate(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) navigate(results[active].slug);
      else if (query.trim()) { setOpen(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`); }
    }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <svg className="absolute end-3 h-4 w-4 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="חיפוש..."
          className="w-44 focus:w-56 transition-all rounded-md border border-input bg-background pe-9 ps-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          dir="rtl"
        />
      </div>

      {open && (
        <ul className="absolute start-0 top-full mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {results.map((r, i) => (
            <li key={r.slug}>
              <button
                onMouseDown={() => navigate(r.slug)}
                className={`w-full text-right px-4 py-2.5 text-sm flex items-center justify-between gap-3 hover:bg-accent transition-colors ${i === active ? 'bg-accent' : ''}`}
              >
                <span className="font-medium truncate">{r.title}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">{r.postType.name}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              onMouseDown={() => { setOpen(false); router.push(`/search?q=${encodeURIComponent(query)}`); }}
              className="w-full text-right px-4 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors border-t border-border"
            >
              הצג את כל התוצאות עבור &quot;{query}&quot; ←
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
