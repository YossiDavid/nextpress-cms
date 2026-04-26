import { prisma } from '@nextpress/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table';
import { Badge } from '@/components/admin/ui/badge';
import { Button } from '@/components/admin/ui/button';
import { createCoupon, toggleCoupon, deleteCoupon } from '@/app/actions/coupons';

const TYPE_LABELS: Record<string, string> = { PERCENT: 'אחוז', FIXED: 'סכום קבוע', FREE_SHIPPING: 'משלוח חינם' };

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">קופונים</h1>
        <p className="text-muted-foreground text-sm mt-1">{coupons.length} קופונים</p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader><CardTitle className="text-base">קופון חדש</CardTitle></CardHeader>
        <CardContent>
          <form action={createCoupon} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">קוד *</label>
              <input name="code" required placeholder="SAVE10" className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">סוג *</label>
              <select name="type" required className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="PERCENT">אחוז (%)</option>
                <option value="FIXED">סכום קבוע (₪)</option>
                <option value="FREE_SHIPPING">משלוח חינם</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">ערך *</label>
              <input name="amount" type="number" min="0" step="0.01" required placeholder="10" className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">שימושים מקס.</label>
              <input name="usageLimit" type="number" min="1" placeholder="ללא הגבלה" className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">תפוגה</label>
              <input name="expiresAt" type="date" className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="w-full">+ צור קופון</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      {coupons.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground text-sm">אין קופונים עדיין</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">קוד</TableHead>
                <TableHead className="text-right">סוג</TableHead>
                <TableHead className="text-right">ערך</TableHead>
                <TableHead className="text-right">שימושים</TableHead>
                <TableHead className="text-right">תפוגה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                  <TableCell className="text-muted-foreground">{TYPE_LABELS[coupon.type]}</TableCell>
                  <TableCell>
                    {coupon.type === 'PERCENT' ? `${Number(coupon.amount)}%` :
                     coupon.type === 'FIXED' ? `₪${Number(coupon.amount).toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('he-IL') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.active ? 'default' : 'outline'}>{coupon.active ? 'פעיל' : 'כבוי'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <form action={toggleCoupon.bind(null, coupon.id, !coupon.active)}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {coupon.active ? 'כבה' : 'הפעל'}
                        </button>
                      </form>
                      <form action={deleteCoupon.bind(null, coupon.id)}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-destructive transition-colors">מחק</button>
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
