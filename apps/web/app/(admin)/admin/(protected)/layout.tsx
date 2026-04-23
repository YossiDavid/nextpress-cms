import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initPlugins } from '@/lib/init-plugins';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NextPress Admin',
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  await initPlugins();

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
