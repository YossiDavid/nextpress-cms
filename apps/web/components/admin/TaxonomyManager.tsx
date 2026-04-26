'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Badge } from '@/components/admin/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { Card, CardContent } from '@/components/admin/ui/card';

interface TaxonomyItem { id: string; name: string; slug: string; count: number }

interface Props {
  type: 'category' | 'tag';
  initial: TaxonomyItem[];
  createEndpoint: string;
  deleteEndpoint: string;
}

export function TaxonomyManager({ type, initial, createEndpoint, deleteEndpoint }: Props) {
  const [items, setItems] = useState<TaxonomyItem[]>(initial);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const label = type === 'category' ? 'קטגוריה' : 'תגית';

  const handleCreate = () => {
    if (!name.trim()) { setError('שם הוא שדה חובה'); return; }
    setError('');
    startTransition(async () => {
      const res = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => [...prev, { ...json.data, count: 0 }]);
        setName('');
      } else {
        setError(json.error?.message ?? 'שגיאה ביצירה');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await fetch(`${deleteEndpoint}/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder={`שם ${label} חדשה`}
              className="max-w-sm"
              disabled={isPending}
            />
            <Button type="button" onClick={handleCreate} disabled={isPending}>
              {isPending ? 'שומר...' : `+ הוסף ${label}`}
            </Button>
          </div>
          {error && <p className="text-destructive text-xs mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">אין {label}ות עדיין</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">slug</TableHead>
              <TableHead className="text-right">מוצרים</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{item.slug}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.count}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() => handleDelete(item.id)}
                  >
                    מחק
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
