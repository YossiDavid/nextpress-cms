'use client';

import { useState, useTransition } from 'react';
import { updateUserRole, deleteUser } from '@/app/actions/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';
import { Button } from '@/components/admin/ui/button';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'מנהל',
  EDITOR: 'עורך',
  VIEWER: 'צופה',
};

interface Props {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserRoleSelect({ userId, currentRole, isSelf }: Props) {
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(val: string) {
    setRole(val);
    startTransition(() => updateUserRole(userId, val as 'ADMIN' | 'EDITOR' | 'VIEWER'));
  }

  function handleDelete() {
    if (!confirm('האם למחוק משתמש זה?')) return;
    startTransition(() => deleteUser(userId));
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={isPending || isSelf}>
        <SelectTrigger className="h-8 w-28 text-xs">
          <SelectValue>{ROLE_LABELS[role]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!isSelf && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={isPending}
        >
          מחק
        </Button>
      )}
    </div>
  );
}
