'use client';

interface DayRevenue {
  date: string; // 'MM/DD'
  revenue: number;
}

interface Props {
  data: DayRevenue[];
}

export function RevenueChart({ data }: Props) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">אין נתונים</p>;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 600;
  const height = 120;
  const barW = Math.floor((width - data.length) / data.length);
  const gap = 1;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height + 24}`}
        className="w-full"
        style={{ minWidth: 300 }}
        aria-label="תרשים הכנסות 30 ימים"
      >
        {data.map((d, i) => {
          const barH = Math.max(2, Math.round((d.revenue / max) * height));
          const x = i * (barW + gap);
          const y = height - barH;
          const isToday = i === data.length - 1;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill={isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'}
              />
              {/* Show label every 5 days or last day */}
              {(i % 5 === 0 || i === data.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={height + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="hsl(var(--muted-foreground))"
                >
                  {d.date}
                </text>
              )}
              {/* Tooltip via title */}
              <title>{d.date}: ₪{d.revenue.toFixed(2)}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
