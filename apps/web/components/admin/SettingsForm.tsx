'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Props { initialOptions: Record<string, string>; }

const SETTINGS_FIELDS = [
  { key: 'site_title', label: 'שם האתר', type: 'text' },
  { key: 'site_description', label: 'תיאור האתר', type: 'text' },
  { key: 'site_url', label: 'כתובת האתר (URL)', type: 'url' },
  { key: 'admin_email', label: 'אימייל מנהל', type: 'email' },
  { key: 'currency', label: 'מטבע', type: 'text' },
  { key: 'posts_per_page', label: 'פוסטים בעמוד', type: 'number' },
];

export function SettingsForm({ initialOptions }: Props) {
  const [options, setOptions] = useState(initialOptions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      for (const [key, value] of Object.entries(options)) {
        await fetch('/api/v1/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError('שגיאה בשמירה'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg">
      <Card>
        <CardHeader><CardTitle className="text-base">כללי</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {SETTINGS_FIELDS.map((field, i) => (
            <div key={field.key}>
              <div className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={options[field.key] ?? ''}
                  onChange={(e) => setOptions((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  dir="auto"
                />
              </div>
              {i < SETTINGS_FIELDS.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-green-500">ההגדרות נשמרו!</p>}
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'שומר...' : 'שמור הגדרות'}</Button>
        </CardContent>
      </Card>
    </form>
  );
}
