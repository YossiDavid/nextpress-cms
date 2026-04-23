'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Media } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  initialMedia: Media[];
  onSelect?: (media: Media) => void;
}

export function MediaLibrary({ initialMedia, onSelect }: Props) {
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/v1/media/upload', { method: 'POST', body: formData });
        const json = await res.json() as { success: boolean; data?: Media; error?: { message: string } };
        if (json.success && json.data) setMedia((prev) => [json.data!, ...prev]);
        else setError(json.error?.message ?? 'שגיאה בהעלאה');
      }
    } catch { setError('שגיאת רשת'); }
    finally { setUploading(false); }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('למחוק קובץ זה?')) return;
    const res = await fetch(`/api/v1/media/${id}`, { method: 'DELETE' });
    if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card
        className="border-dashed cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <CardContent className="p-8 text-center">
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          {uploading ? (
            <p className="text-sm text-muted-foreground">מעלה...</p>
          ) : (
            <>
              <p className="text-sm font-medium">גרור קבצים לכאן או לחץ להעלאה</p>
              <p className="text-xs text-muted-foreground mt-1">תמונות, וידאו, PDF</p>
            </>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {media.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">אין קבצים עדיין</p>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-md overflow-hidden border border-border bg-muted cursor-pointer hover:ring-2 hover:ring-ring transition-all"
              onClick={() => onSelect?.(item)}
            >
              {item.mimeType.startsWith('image/') ? (
                <Image
                  src={item.url}
                  alt={item.alt ?? item.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full"><span className="text-2xl">📄</span></div>
              )}
              <button
                className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow"
                onClick={(e) => handleDelete(item.id, e)}
                title="מחק"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
