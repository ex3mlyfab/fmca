import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import type { Selection } from '@tiptap/pm/state';
import { Fragment, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
    Bold,
    Code,
    Code2,
    Eraser,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Text,
    Underline,
    Undo2,
    Unlink,
    type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { isExternalHref, isSafeHref } from '@/lib/safe-href';

/**
 * The FMCA link mark. It mirrors the server-side guard in
 * `App\Support\BlockContentSanitizer`: only internal or http(s) targets keep
 * their href, external links open in a new tab, and every safe link carries
 * `rel="noopener noreferrer"`.
 */
const SafeLink = Link.extend({
    renderHTML({ HTMLAttributes }) {
        const { href, ...rest } = HTMLAttributes;
        const url = typeof href === 'string' ? href.trim() : '';
        const safe = isSafeHref(url);
        const external = safe && isExternalHref(url);

        return [
            'a',
            {
                ...rest,
                ...(safe ? { href: url, rel: 'noopener noreferrer' } : {}),
                ...(external ? { target: '_blank' } : {}),
            },
            0,
        ] as [string, Record<string, unknown>, number];
    },
}).configure({ openOnClick: false });

type RichTextEditorProps = {
    /** The HTML document for the editor. Kept in sync from the parent. */
    value?: string;
    /** Called with the latest HTML whenever the document changes. */
    onContentChange?: (html: string) => void;
    /** Hint shown while the document is empty. */
    placeholder?: string;
    /** Accessible name for the editing surface. */
    label?: string;
    /** Marks the editing surface invalid when its value fails validation. */
    invalid?: boolean;
    className?: string;
};

type ToolbarItem = {
    key: string;
    group: number;
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    pressed?: boolean;
    dimmed?: boolean;
    onClick: () => void;
};

export function RichTextEditor({
    value,
    onContentChange,
    placeholder = 'Write the content…',
    label,
    invalid = false,
    className,
}: RichTextEditorProps) {
    const onChangeRef = useRef(onContentChange);
    onChangeRef.current = onContentChange;

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ link: false }),
            SafeLink,
            // v3 prepends `data-` to the given value, so `placeholder` becomes
            // the data-placeholder attribute the .fmca-prose CSS reads.
            Placeholder.configure({ placeholder, dataAttribute: 'placeholder' }),
        ],
        // An empty document holds no blocks, so v3's placeholder never
        // decorates it. Seed one empty paragraph so the hint is visible from
        // the start; typing into a stored empty body keeps it too.
        content: value && value.trim() !== '' ? value : '<p></p>',
        editorProps: {
            attributes: {
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-invalid': invalid ? 'true' : 'false',
                ...(label ? { 'aria-label': label } : {}),
            },
        },
        onUpdate: ({ editor: instance }) => {
            onChangeRef.current?.(instance.getHTML());
        },
    });

    // When the parent hands down a different document (form reset after a
    // validation failure, etc.) keep the view in sync without stealing focus.
    // An empty value leaves the editor's seeded placeholder paragraph alone.
    useEffect(() => {
        if (!editor) {
            return;
        }

        if (value === undefined || value.trim() === '') {
            return;
        }

        if (value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [editor, value]);

    const [linkFormOpen, setLinkFormOpen] = useState(false);
    const [linkHref, setLinkHref] = useState('');
    const [linkError, setLinkError] = useState<string | null>(null);
    const storedSelection = useRef<Selection | null>(null);
    const linkFieldId = useId();

    const openLinkForm = () => {
        if (!editor || editor.isDestroyed) {
            return;
        }

        storedSelection.current = editor.state.selection;
        const current = editor.getAttributes('link').href;
        setLinkHref(typeof current === 'string' ? current : '');
        setLinkError(null);
        setLinkFormOpen(true);
        requestAnimationFrame(() => document.getElementById(linkFieldId)?.focus());
    };

    const closeLinkForm = () => {
        setLinkFormOpen(false);
        setLinkHref('');
        setLinkError(null);
    };

    const applyLink = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editor) {
            return;
        }

        const url = linkHref.trim();

        if (storedSelection.current) {
            editor.view.dispatch(editor.state.tr.setSelection(storedSelection.current));
        }

        if (url === '') {
            // An empty URL clears the link on the selection.
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            closeLinkForm();
            return;
        }

        if (!isSafeHref(url)) {
            setLinkError('Links must be an internal path (like /services) or an http(s) URL.');
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        closeLinkForm();
    };

    const items: ToolbarItem[] =
        editor && !editor.isDestroyed
            ? [
                  {
                      key: 'undo',
                      group: 1,
                      icon: Undo2,
                      label: 'Undo',
                      shortcut: 'Ctrl+Z',
                      dimmed: !editor.can().undo(),
                      onClick: () => editor.chain().focus().undo().run(),
                  },
                  {
                      key: 'redo',
                      group: 1,
                      icon: Redo2,
                      label: 'Redo',
                      shortcut: 'Ctrl+Shift+Z',
                      dimmed: !editor.can().redo(),
                      onClick: () => editor.chain().focus().redo().run(),
                  },
                  {
                      key: 'paragraph',
                      group: 2,
                      icon: Text,
                      label: 'Paragraph',
                      shortcut: 'Ctrl+Shift+0',
                      pressed: editor.isActive('paragraph'),
                      onClick: () => editor.chain().focus().setParagraph().run(),
                  },
                  {
                      key: 'heading2',
                      group: 2,
                      icon: Heading2,
                      label: 'Heading 2',
                      shortcut: 'Ctrl+Alt+2',
                      pressed: editor.isActive('heading', { level: 2 }),
                      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                  },
                  {
                      key: 'heading3',
                      group: 2,
                      icon: Heading3,
                      label: 'Heading 3',
                      shortcut: 'Ctrl+Alt+3',
                      pressed: editor.isActive('heading', { level: 3 }),
                      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                  },
                  {
                      key: 'bold',
                      group: 3,
                      icon: Bold,
                      label: 'Bold',
                      shortcut: 'Ctrl+B',
                      pressed: editor.isActive('bold'),
                      onClick: () => editor.chain().focus().toggleBold().run(),
                  },
                  {
                      key: 'italic',
                      group: 3,
                      icon: Italic,
                      label: 'Italic',
                      shortcut: 'Ctrl+I',
                      pressed: editor.isActive('italic'),
                      onClick: () => editor.chain().focus().toggleItalic().run(),
                  },
                  {
                      key: 'underline',
                      group: 3,
                      icon: Underline,
                      label: 'Underline',
                      shortcut: 'Ctrl+U',
                      pressed: editor.isActive('underline'),
                      onClick: () => editor.chain().focus().toggleUnderline().run(),
                  },
                  {
                      key: 'strike',
                      group: 3,
                      icon: Strikethrough,
                      label: 'Strikethrough',
                      shortcut: 'Ctrl+Shift+X',
                      pressed: editor.isActive('strike'),
                      onClick: () => editor.chain().focus().toggleStrike().run(),
                  },
                  {
                      key: 'bulletList',
                      group: 4,
                      icon: List,
                      label: 'Bullet list',
                      shortcut: 'Ctrl+Shift+8',
                      pressed: editor.isActive('bulletList'),
                      onClick: () => editor.chain().focus().toggleBulletList().run(),
                  },
                  {
                      key: 'orderedList',
                      group: 4,
                      icon: ListOrdered,
                      label: 'Numbered list',
                      shortcut: 'Ctrl+Shift+7',
                      pressed: editor.isActive('orderedList'),
                      onClick: () => editor.chain().focus().toggleOrderedList().run(),
                  },
                  {
                      key: 'blockquote',
                      group: 4,
                      icon: Quote,
                      label: 'Quote',
                      shortcut: 'Ctrl+Shift+.',
                      pressed: editor.isActive('blockquote'),
                      onClick: () => editor.chain().focus().toggleBlockquote().run(),
                  },
                  {
                      key: 'code',
                      group: 4,
                      icon: Code,
                      label: 'Inline code',
                      shortcut: 'Ctrl+E',
                      pressed: editor.isActive('code'),
                      onClick: () => editor.chain().focus().toggleCode().run(),
                  },
                  {
                      key: 'codeBlock',
                      group: 4,
                      icon: Code2,
                      label: 'Code block',
                      shortcut: 'Ctrl+Alt+C',
                      pressed: editor.isActive('codeBlock'),
                      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
                  },
                  {
                      key: 'horizontalRule',
                      group: 4,
                      icon: Minus,
                      label: 'Divider',
                      onClick: () => editor.chain().focus().setHorizontalRule().run(),
                  },
                  {
                      key: 'link',
                      group: 5,
                      icon: LinkIcon,
                      label: 'Insert link',
                      dimmed: linkFormOpen,
                      onClick: openLinkForm,
                  },
                  {
                      key: 'unlink',
                      group: 5,
                      icon: Unlink,
                      label: 'Remove link',
                      dimmed: !editor.isActive('link'),
                      onClick: () => editor.chain().focus().extendMarkRange('link').unsetLink().run(),
                  },
                  {
                      key: 'clear',
                      group: 6,
                      icon: Eraser,
                      label: 'Clear formatting',
                      onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
                  },
              ]
            : [];

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border border-input bg-white shadow-xs',
                invalid && 'border-fmca-crimson',
                className,
            )}
        >
            <div
                role="toolbar"
                aria-label="Text formatting"
                className="flex flex-wrap items-center gap-0.5 border-b border-fmca-ink/10 bg-fmca-mist/70 p-1.5"
            >
                {items.map((item, index) => (
                    <Fragment key={item.key}>
                        {index > 0 && item.group !== items[index - 1].group && (
                            <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-fmca-ink/15" />
                        )}
                        <ToolbarButton item={item} />
                    </Fragment>
                ))}
            </div>

            {linkFormOpen && (
                <form className="flex flex-wrap items-center gap-2 border-b border-fmca-ink/10 bg-white p-3" onSubmit={applyLink}>
                    <Label htmlFor={linkFieldId} className="text-xs font-bold text-slate-600">
                        Link URL
                    </Label>
                    <Input
                        id={linkFieldId}
                        value={linkHref}
                        onChange={(event) => setLinkHref(event.target.value)}
                        placeholder="/internal-path or https://example.org"
                        aria-invalid={Boolean(linkError)}
                        className={cn('h-9 w-64 min-w-0 flex-1 font-mono text-xs', linkError && 'border-fmca-crimson')}
                    />
                    <Button type="submit" size="sm" className="h-9 bg-fmca-green text-white hover:bg-fmca-green-dark">
                        Apply
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-9" onClick={closeLinkForm}>
                        Cancel
                    </Button>
                    {linkError && (
                        <p role="alert" className="w-full text-xs font-medium text-fmca-crimson">
                            {linkError}
                        </p>
                    )}
                </form>
            )}

            <EditorContent editor={editor} className="fmca-prose min-h-52 px-4 py-3 text-sm" />
        </div>
    );
}

function ToolbarButton({ item }: { item: ToolbarItem }) {
    const Icon = item.icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label={item.label}
                    aria-pressed={item.pressed}
                    title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                    className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-white hover:text-fmca-green-dark active:translate-y-px focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40',
                        item.pressed && 'bg-fmca-green/10 text-fmca-green-dark',
                        item.dimmed && 'cursor-not-allowed opacity-40',
                    )}
                    onClick={() => {
                        if (!item.dimmed) {
                            item.onClick();
                        }
                    }}
                >
                    <Icon size={17} aria-hidden="true" />
                </button>
            </TooltipTrigger>
            <TooltipContent>
                {item.label}
                {item.shortcut ? <span> — {item.shortcut}</span> : null}
            </TooltipContent>
        </Tooltip>
    );
}
