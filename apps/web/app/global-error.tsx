'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-4xl font-light text-muted-foreground">500</p>
          <h1 className="text-2xl font-bold">שגיאה קריטית</h1>
          <p className="text-muted-foreground text-sm">
            אירעה שגיאה חמורה. אנא רענן את הדף או צור קשר עם התמיכה.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground">שגיאה: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            נסה שוב
          </button>
        </div>
      </body>
    </html>
  );
}
