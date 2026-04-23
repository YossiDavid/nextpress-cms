'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-5xl">⚠️</p>
        <h2 className="text-xl font-semibold">שגיאה בטעינת הדף</h2>
        <p className="text-sm text-muted-foreground">
          אירעה שגיאה בלתי צפויה. ניתן לנסות שוב או לחזור לדף הקודם.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            נסה שוב
          </button>
          <a
            href="/admin"
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            לוח בקרה
          </a>
        </div>
      </div>
    </div>
  );
}
