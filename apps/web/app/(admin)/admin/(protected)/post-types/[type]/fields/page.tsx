import { prisma } from '@nextpress/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { addField, deleteField, reorderFields } from '@/app/actions/post-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props { params: Promise<{ type: string }>; }

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: 'טקסט',
  TEXTAREA: 'טקסט ארוך',
  RICHTEXT: 'עורך עשיר',
  NUMBER: 'מספר',
  BOOLEAN: 'כן/לא',
  DATE: 'תאריך',
  IMAGE: 'תמונה',
  GALLERY: 'גלריה',
  SELECT: 'בחירה',
  MULTISELECT: 'בחירה מרובה',
  RELATION: 'קשר',
  JSON: 'JSON',
};

const FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS);

export default async function FieldsPage({ params }: Props) {
  const { type } = await params;
  const postType = await prisma.postType.findUnique({
    where: { slug: type },
    include: { fields: { orderBy: { order: 'asc' } } },
  });
  if (!postType) notFound();

  const addFieldForType = addField.bind(null, postType.id);

  async function moveUp(fieldId: string) {
    'use server';
    const fields = await prisma.fieldDefinition.findMany({
      where: { postTypeId: postType!.id },
      orderBy: { order: 'asc' },
    });
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx <= 0) return;
    const ids = fields.map((f) => f.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    await reorderFields(postType!.id, ids);
  }

  async function moveDown(fieldId: string) {
    'use server';
    const fields = await prisma.fieldDefinition.findMany({
      where: { postTypeId: postType!.id },
      orderBy: { order: 'asc' },
    });
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (idx < 0 || idx >= fields.length - 1) return;
    const ids = fields.map((f) => f.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    await reorderFields(postType!.id, ids);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/post-types/${type}`}>→ חזרה</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">שדות — {postType.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">הגדר שדות מותאמים אישית לסוג תוכן זה</p>
        </div>
      </div>

      {postType.fields.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תווית</TableHead>
                <TableHead className="text-right">מזהה</TableHead>
                <TableHead className="text-right">סוג</TableHead>
                <TableHead className="text-right">חובה</TableHead>
                <TableHead className="text-right">סדר</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postType.fields.map((field, idx) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">{field.slug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{FIELD_TYPE_LABELS[field.type] ?? field.type}</Badge>
                  </TableCell>
                  <TableCell>{field.required ? '✓' : '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{field.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <form action={moveUp.bind(null, field.id)}>
                        <Button type="submit" variant="ghost" size="sm" disabled={idx === 0} className="h-7 w-7 p-0">↑</Button>
                      </form>
                      <form action={moveDown.bind(null, field.id)}>
                        <Button type="submit" variant="ghost" size="sm" disabled={idx === postType.fields.length - 1} className="h-7 w-7 p-0">↓</Button>
                      </form>
                      <form action={deleteField.bind(null, field.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive">מחק</Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">אין שדות עדיין — הוסף שדה למטה</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>הוסף שדה</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addFieldForType} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="label">תווית</Label>
                <Input id="label" name="label" required placeholder="שם השדה" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">מזהה (slug)</Label>
                <Input id="slug" name="slug" required placeholder="field_name" dir="ltr" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">סוג</Label>
              <select
                id="type"
                name="type"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input id="required" name="required" type="checkbox" className="h-4 w-4" />
              <Label htmlFor="required">שדה חובה</Label>
            </div>

            <Button type="submit">הוסף שדה</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
