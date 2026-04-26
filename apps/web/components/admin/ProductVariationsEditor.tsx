'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Badge } from '@/components/admin/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';

interface Variation {
  id: string;
  name: string;
  sku: string | null;
  price: string | number;
  stock: number | null;
  options: Record<string, string>;
}

interface Props {
  productId: string;
  initial: Variation[];
}

const EMPTY = { name: '', sku: '', price: '', stock: '', size: '', color: '' };

export function ProductVariationsEditor({ productId, initial }: Props) {
  const [variations, setVariations] = useState<Variation[]>(initial);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!form.name || !form.price) {
      setError('שם ומחיר הם שדות חובה');
      return;
    }
    setError('');
    const options: Record<string, string> = {};
    if (form.size) options['size'] = form.size;
    if (form.color) options['color'] = form.color;

    startTransition(async () => {
      const res = await fetch(`/api/v1/products/${productId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || undefined,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : undefined,
          options,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVariations((prev) => [...prev, json.data]);
        setForm(EMPTY);
      } else {
        setError(json.error?.message ?? 'שגיאה');
      }
    });
  };

  const handleDelete = (varId: string) => {
    startTransition(async () => {
      await fetch(`/api/v1/products/${productId}/variations/${varId}`, { method: 'DELETE' });
      setVariations((prev) => prev.filter((v) => v.id !== varId));
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">וריאציות מוצר</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing variations */}
        {variations.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">SKU</TableHead>
                <TableHead className="text-right">מחיר</TableHead>
                <TableHead className="text-right">מלאי</TableHead>
                <TableHead className="text-right">אפשרויות</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{v.sku ?? '—'}</TableCell>
                  <TableCell>₪{Number(v.price).toFixed(2)}</TableCell>
                  <TableCell>{v.stock ?? '∞'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(v.options).map(([k, val]) => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}: {val}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleDelete(v.id)}
                    >
                      מחק
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Add form */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground">הוסף וריאציה</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">שם *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='L / אדום'
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">מחיר *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="99.90"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="SHIRT-L-RED"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">מלאי</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="10"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">מידה (size)</Label>
              <Input
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                placeholder="S / M / L / XL"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">צבע (color)</Label>
              <Input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="אדום / כחול"
                className="h-8 text-sm"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="button" size="sm" onClick={handleAdd} disabled={isPending}>
            {isPending ? 'שומר...' : '+ הוסף וריאציה'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
