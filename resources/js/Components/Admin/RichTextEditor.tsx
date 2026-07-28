import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ReactNode, useEffect } from 'react';

function ToolbarButton({
    onClick,
    active,
    children,
    title,
}: {
    onClick: () => void;
    active?: boolean;
    children: ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded px-2.5 py-1.5 text-xs font-medium transition ${
                active
                    ? 'bg-brand-900 text-white'
                    : 'text-brand-700 hover:bg-brand-100'
            }`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (html: string) => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-900 underline',
                },
            }),
        ],
        content: value || '<p></p>',
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm min-h-[280px] max-w-none px-4 py-3 focus:outline-none text-brand-800 ' +
                    'prose-headings:font-semibold prose-headings:text-brand-900 prose-a:text-brand-900',
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-8 text-sm text-brand-500">
                A carregar editor...
            </div>
        );
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL do link', previousUrl || 'https://');

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="overflow-hidden rounded-lg border border-brand-200 bg-white">
            <div className="flex flex-wrap gap-1 border-b border-brand-200 bg-brand-50/80 p-2">
                <ToolbarButton
                    title="Negrito"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    title="Itálico"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    title="Título"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    title="Subtítulo"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    H3
                </ToolbarButton>
                <ToolbarButton
                    title="Lista com marcas"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    • Lista
                </ToolbarButton>
                <ToolbarButton
                    title="Lista numerada"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    1. Lista
                </ToolbarButton>
                <ToolbarButton
                    title="Link"
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    Link
                </ToolbarButton>
                <ToolbarButton
                    title="Desfazer"
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    ↶
                </ToolbarButton>
                <ToolbarButton
                    title="Refazer"
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    ↷
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
