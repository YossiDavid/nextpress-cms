import { hooks } from '@nextpress/core';
import type { ActionHook, FilterHook } from '@nextpress/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const ACTION_HOOKS: ActionHook[] = [
  'post.beforeSave',
  'post.afterSave',
  'post.beforeDelete',
  'post.afterDelete',
  'order.created',
  'order.statusChanged',
  'order.completed',
  'order.refunded',
  'cart.updated',
  'checkout.before',
  'checkout.after',
  'media.uploaded',
  'plugin.activated',
  'plugin.deactivated',
  'nextpress.ready',
];

const FILTER_HOOKS: FilterHook[] = [
  'post.fields',
  'post.beforeRender',
  'product.price',
  'order.total',
  'order.tax',
  'order.shipping',
  'api.response',
  'admin.menu',
  'admin.dashboard.widgets',
];

export default function HooksPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/plugins">→ חזרה</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">בדיקת Hooks</h1>
          <p className="text-muted-foreground text-sm mt-1">כל ה-hooks הידועים במערכת ומצב הרישום שלהם</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action Hooks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם ה-Hook</TableHead>
                <TableHead className="text-right">סוג</TableHead>
                <TableHead className="text-right">רשום</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACTION_HOOKS.map((hook) => {
                const registered = hooks.hasAction(hook);
                return (
                  <TableRow key={hook}>
                    <TableCell className="font-mono text-sm" dir="ltr">{hook}</TableCell>
                    <TableCell><Badge variant="outline">action</Badge></TableCell>
                    <TableCell>
                      <span className="text-base">{registered ? '✅' : '❌'}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filter Hooks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם ה-Hook</TableHead>
                <TableHead className="text-right">סוג</TableHead>
                <TableHead className="text-right">רשום</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FILTER_HOOKS.map((hook) => {
                const registered = hooks.hasFilter(hook);
                return (
                  <TableRow key={hook}>
                    <TableCell className="font-mono text-sm" dir="ltr">{hook}</TableCell>
                    <TableCell><Badge variant="secondary">filter</Badge></TableCell>
                    <TableCell>
                      <span className="text-base">{registered ? '✅' : '❌'}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
