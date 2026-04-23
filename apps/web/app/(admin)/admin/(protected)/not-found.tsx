import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-7xl font-bold text-muted-foreground/20">404</p>
        <h2 className="text-xl font-semibold">הדף לא נמצא</h2>
        <p className="text-sm text-muted-foreground">
          הדף שחיפשת אינו קיים.
        </p>
        <Link
          href="/admin"
          className="inline-block px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          לוח בקרה
        </Link>
      </div>
    </div>
  );
}
