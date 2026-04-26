import { prisma } from '@nextpress/db';
import { getSession } from '@/lib/auth-session';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { Badge } from '@/components/admin/ui/badge';
import { UserRoleSelect } from '@/components/admin/UserRoleSelect';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'מנהל', EDITOR: 'עורך', VIEWER: 'צופה' };
const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  ADMIN: 'default', EDITOR: 'secondary', VIEWER: 'outline',
};

export default async function UsersPage() {
  const session = await getSession();
  const currentId = session?.user?.id ?? '';

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">משתמשים</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} משתמשים רשומים</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>תפקיד</TableHead>
              <TableHead>נרשם</TableHead>
              <TableHead className="w-40">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role] ?? 'outline'} className="text-xs">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAt.toLocaleDateString('he-IL')}
                </TableCell>
                <TableCell>
                  <UserRoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    isSelf={user.id === currentId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
