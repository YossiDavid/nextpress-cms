'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FrontendError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-6xl">⚠️</p>
        <h1 className="text-2xl font-bold">משהו השתבש</h1>
        <p className="text-muted-foreground text-sm">
          אירעה שגיאה בלתי צפויה. נסה לרענן את הדף.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">שגיאה: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          נסה שוב
        </button>
      </div>
    </main>
  );
}
