'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TOOLBAR_BTN = 'px-2 py-1 text-xs rounded hover:bg-accent transition-colors disabled:opacity-40';

export function RichTextEditor({ value, onChange, className }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[180px] px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none dark:prose-invert',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. on load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn('rounded-md border border-input bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5 bg-muted/30">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn(TOOLBAR_BTN, editor.isActive('bold') && 'bg-accent font-bold')}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn(TOOLBAR_BTN, editor.isActive('italic') && 'bg-accent italic')}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={cn(TOOLBAR_BTN, editor.isActive('strike') && 'bg-accent line-through')}>S</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(TOOLBAR_BTN, editor.isActive('heading', { level: 2 }) && 'bg-accent')}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cn(TOOLBAR_BTN, editor.isActive('heading', { level: 3 }) && 'bg-accent')}>H3</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(TOOLBAR_BTN, editor.isActive('bulletList') && 'bg-accent')}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(TOOLBAR_BTN, editor.isActive('orderedList') && 'bg-accent')}>1. List</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn(TOOLBAR_BTN, editor.isActive('blockquote') && 'bg-accent')}>&ldquo;&rdquo;</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={TOOLBAR_BTN}>—</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={TOOLBAR_BTN}>↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={TOOLBAR_BTN}>↪</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
