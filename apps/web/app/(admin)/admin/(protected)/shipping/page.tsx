import { prisma } from '@nextpress/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createShippingMethod, toggleShippingMethod, deleteShippingMethod, saveTaxRate } from '@/app/actions/shipping';

export default async function ShippingPage() {
  const [methods, taxRateOpt] = await Promise.all([
    prisma.shippingMethod.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    prisma.option.findUnique({ where: { key: 'tax_rate' } }),
  ]);

  const taxRate = taxRateOpt ? Number(taxRateOpt.value) : 17;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">משלוח ומסים</h1>

      {/* Tax rate */}
      <Card>
        <CardHeader><CardTitle className="text-base">שיעור מע&quot;מ</CardTitle></CardHeader>
        <CardContent>
          <form action={saveTaxRate} className="flex items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">מע&quot;מ (%)</Label>
              <Input
                name="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={taxRate}
                className="w-28"
              />
            </div>
            <Button type="submit" size="sm">שמור</Button>
          </form>
        </CardContent>
      </Card>

      {/* Create shipping method */}
      <Card>
        <CardHeader><CardTitle className="text-base">שיטת משלוח חדשה</CardTitle></CardHeader>
        <CardContent>
          <form action={createShippingMethod} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">שם *</Label>
              <Input name="name" required placeholder='משלוח רגיל' className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">תיאור</Label>
              <Input name="description" placeholder="3-5 ימי עסקים" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">עלות (₪) *</Label>
              <Input name="cost" type="number" min="0" step="0.01" required placeholder="35" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">חינם מעל (₪)</Label>
              <Input name="freeAbove" type="number" min="0" step="0.01" placeholder="300" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">סדר תצוגה</Label>
              <Input name="order" type="number" defaultValue="0" className="h-8 text-sm w-24" />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm">+ הוסף</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      {methods.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground text-sm">
            אין שיטות משלוח. הוסף לפחות אחת.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">עלות</TableHead>
                <TableHead className="text-right">חינם מעל</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{m.description ?? '—'}</TableCell>
                  <TableCell>₪{Number(m.cost).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.freeAbove ? `₪${Number(m.freeAbove).toFixed(0)}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.active ? 'default' : 'outline'}>
                      {m.active ? 'פעיל' : 'כבוי'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <form action={toggleShippingMethod.bind(null, m.id, !m.active)}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {m.active ? 'כבה' : 'הפעל'}
                        </button>
                      </form>
                      <form action={deleteShippingMethod.bind(null, m.id)}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                          מחק
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
