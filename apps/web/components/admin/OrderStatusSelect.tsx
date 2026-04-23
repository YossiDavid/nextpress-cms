'use client';

import { useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';

const STATUSES = [
  { value: 'PENDING',    label: 'ממתין' },
  { value: 'PROCESSING', label: 'בעיבוד' },
  { value: 'COMPLETED',  label: 'הושלם' },
  { value: 'CANCELLED',  label: 'בוטל' },
  { value: 'REFUNDED',   label: 'הוחזר' },
  { value: 'FAILED',     label: 'נכשל' },
];

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="text-xs rounded border border-border bg-background px-2 py-1 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
