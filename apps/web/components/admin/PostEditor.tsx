'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, PostType, FieldDefinition, FieldValue } from '@prisma/client';
import { FieldRenderer } from './FieldRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Button } from '@/components/admin/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select';

interface Props {
  postType: PostType;
  fields: FieldDefinition[];
  post?: Post;
  fieldValues?: FieldValue[];
}

export function PostEditor({ postType, fields, post, fieldValues = [] }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [status, setStatus] = useState(post?.status ?? 'DRAFT');
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ''
  );
  const [fieldData, setFieldData] = useState<Record<string, string>>(
    Object.fromEntries(fieldValues.map((fv) => [fv.fieldSlug, fv.value ?? '']))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!post) setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
  }

  async function handleSave(newStatus?: string) {
    if (!title.trim()) { setError('כותרת נדרשת'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(
        post ? `/api/v1/posts/${postType.slug}/${post.id}` : `/api/v1/posts/${postType.slug}`,
        {
          method: post ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, slug,
            status: newStatus ?? status,
            fields: fieldData,
            publishedAt: (newStatus ?? status) === 'SCHEDULED' ? publishedAt || null : undefined,
          }),
        }
      );
      const json = await res.json() as { success: boolean; error?: { message: string } };
      if (!json.success) { setError(json.error?.message ?? 'שגיאה בשמירה'); return; }
      startTransition(() => {
        router.push(`/admin/post-types/${postType.slug}`);
        router.refresh();
      });
    } catch { setError('שגיאת רשת'); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>כותרת</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="כותרת..." dir="auto" className="text-lg" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        {fields.map((field) => (
          <Card key={field.id}>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive mr-1">*</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <FieldRenderer
                field={field}
                value={fieldData[field.slug] ?? ''}
                onChange={(val) => setFieldData((prev) => ({ ...prev, [field.slug]: val }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium">פרסום</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">טיוטה</SelectItem>
                  <SelectItem value="PUBLISHED">פורסם</SelectItem>
                  <SelectItem value="SCHEDULED">מתוזמן</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status === 'SCHEDULED' && (
              <div className="space-y-2">
                <Label>תאריך פרסום</Label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={() => handleSave()} disabled={saving || isPending} className="w-full">
              {saving ? 'שומר...' : 'שמור'}
            </Button>
            {status !== 'PUBLISHED' && (
              <Button onClick={() => handleSave('PUBLISHED')} disabled={saving || isPending} variant="outline" className="w-full">
                פרסם
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
