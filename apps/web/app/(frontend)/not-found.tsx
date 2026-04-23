import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-8xl font-bold text-muted-foreground/30">404</p>
        <h1 className="text-2xl font-bold">הדף לא נמצא</h1>
        <p className="text-muted-foreground text-sm">
          הדף שחיפשת אינו קיים או הוסר.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </main>
  );
}
