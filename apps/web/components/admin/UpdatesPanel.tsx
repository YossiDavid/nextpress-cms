'use client';

import { useState } from 'react';
import { runUpdate } from '@/app/actions/updates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  current: string;
  latest: string | null;
  hasUpdate: boolean;
  changelog: string | null;
  publishedAt: string | null;
  error?: string;
}

export function UpdatesPanel({ current, latest, hasUpdate, changelog, publishedAt, error }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; output: string } | null>(null);

  async function handleUpdate() {
    setRunning(true);
    setResult(null);
    const res = await runUpdate();
    setResult(res);
    setRunning(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">גרסה נוכחית</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-semibold">v{current}</span>
            {error ? (
              <Badge variant="outline" className="text-muted-foreground">{error}</Badge>
            ) : hasUpdate ? (
              <Badge variant="destructive">עדכון זמין: v{latest}</Badge>
            ) : latest ? (
              <Badge variant="secondary">עדכני</Badge>
            ) : null}
          </div>

          {hasUpdate && (
            <Button onClick={handleUpdate} disabled={running}>
              {running ? 'מעדכן...' : `עדכן ל-v${latest}`}
            </Button>
          )}
        </CardContent>
      </Card>

      {hasUpdate && changelog && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>מה חדש ב-v{latest}</span>
              {publishedAt && (
                <span className="text-sm text-muted-foreground font-normal">
                  {new Date(publishedAt).toLocaleDateString('he-IL')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {changelog}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={result.success ? 'border-green-500/30' : 'border-destructive/30'}>
          <CardHeader>
            <CardTitle className="text-base">
              {result.success ? 'העדכון הושלם בהצלחה' : 'העדכון נכשל'}
            </CardTitle>
          </CardHeader>
          {result.output && (
            <CardContent>
              <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-64 font-mono">
                {result.output}
              </pre>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
