'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Quote,
  Undo,
  Redo,
  Type
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/20">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('bold') ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('italic') ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('underline') ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border self-center mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('heading', { level: 1 }) ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('heading', { level: 2 }) ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border self-center mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('bulletList') ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-2 rounded-md hover:bg-muted transition-colors",
          editor.isActive('orderedList') ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <div className="w-px h-4 bg-border self-center mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4 text-sm leading-relaxed',
      },
    },
    immediatelyRender: false,
  })

  // Sync content if it changes externally (e.g. AI feedback populated)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!isMounted) return <div className={cn("min-h-[150px] border rounded-xl bg-white", className)} />

  return (
    <div className={cn(
      "border rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all",
      className
    )}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
