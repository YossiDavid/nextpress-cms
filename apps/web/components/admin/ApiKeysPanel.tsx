'use client';

import { useState, useTransition } from 'react';
import { createApiKey, deleteApiKey } from '@/app/actions/api-keys';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ApiKey {
  id: string;
  name: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

interface Props {
  initialKeys: ApiKey[];
}

export function ApiKeysPanel({ initialKeys }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createApiKey(name.trim());
      setNewKey(result.key);
      setName('');
      // Refresh list from server via revalidation (hard reload for simplicity)
      setKeys((prev) => [
        { id: crypto.randomUUID(), name: name.trim(), createdAt: new Date(), lastUsedAt: null },
        ...prev,
      ]);
    });
  }

  function handleDelete(id: string) {
    if (!confirm('למחוק מפתח זה?')) return;
    startTransition(async () => {
      await deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (newKey) setNewKey(null);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">צור מפתח חדש</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="key-name">שם המפתח</Label>
            <div className="flex gap-2">
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: Integration XYZ"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
                צור
              </Button>
            </div>
          </div>

          {newKey && (
            <div className="rounded-md bg-muted p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                שמור את המפתח — הוא יוצג רק פעם אחת:
              </p>
              <code className="block text-xs font-mono break-all select-all">{newKey}</code>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>נוצר</TableHead>
              <TableHead>שימוש אחרון</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">
                  אין מפתחות API
                </TableCell>
              </TableRow>
            ) : (
              keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(k.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(k.id)}
                      disabled={isPending}
                    >
                      בטל
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
