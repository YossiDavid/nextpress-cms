'use client';

import type { FieldDefinition } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  onMediaPick?: (fieldSlug: string) => void;
}

export function FieldRenderer({ field, value, onChange, onMediaPick }: Props) {
  switch (field.type) {
    case 'TEXT':
      return <Input value={value} onChange={(e) => onChange(e.target.value)} dir="auto" />;

    case 'TEXTAREA':
      return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} dir="auto" className="resize-y" />;

    case 'RICHTEXT':
      return <RichTextEditor value={value} onChange={onChange} />;

    case 'NUMBER':
      return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" />;

    case 'BOOLEAN':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-muted-foreground">{field.label}</span>
        </label>
      );

    case 'DATE':
      return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" />;

    case 'IMAGE':
      return (
        <div className="space-y-2">
          {value && <img src={value} alt="" className="w-32 h-32 object-cover rounded-md border border-border" />}
          <Button type="button" variant="outline" size="sm" onClick={() => onMediaPick?.(field.slug)}>
            {value ? 'החלף תמונה' : 'בחר תמונה'}
          </Button>
        </div>
      );

    case 'SELECT': {
      const opts = (field.options as { label: string; value: string }[] | null) ?? [];
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="בחר..." />
          </SelectTrigger>
          <SelectContent>
            {opts.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case 'MULTISELECT': {
      const opts = (field.options as { label: string; value: string }[] | null) ?? [];
      const selected = value ? value.split(',') : [];
      return (
        <div className="space-y-2">
          {opts.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.value]
                    : selected.filter((v) => v !== opt.value);
                  onChange(next.join(','));
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }

    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}
