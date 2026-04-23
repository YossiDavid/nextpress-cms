import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'NextPress';
  const type = searchParams.get('type') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {type && (
          <div style={{ color: '#a855f7', fontSize: 22, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 4 }}>
            {type}
          </div>
        )}
        <div
          style={{
            color: '#ffffff',
            fontSize: title.length > 40 ? 52 : 68,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
            N
          </div>
          <div style={{ color: '#888', fontSize: 20 }}>NextPress</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
