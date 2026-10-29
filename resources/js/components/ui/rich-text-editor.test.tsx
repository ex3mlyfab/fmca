import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

import { RichTextEditor } from './rich-text-editor';

/** Mount the editor inside a TooltipProvider (the app shell provides one) and
 * wait until the toolbar has rendered (editor ready). */
async function mountEditor(ui: ReactElement) {
    const result = render(<TooltipProvider>{ui}</TooltipProvider>);

    await waitFor(() => expect(result.container.querySelector('[role="toolbar"] button')).not.toBeNull(), {
        timeout: 5000,
    });

    return result;
}

/** Select every character of the document through TipTap's Mod+A keymap. */
function selectAll() {
    const surface = document.querySelector('.ProseMirror');

    expect(surface).not.toBeNull();
    fireEvent.keyDown(surface!, { key: 'a', ctrlKey: true });
}

afterEach(() => {
    cleanup();
});

describe('rich text editor', () => {
    it('renders the document and the full formatting toolbar', async () => {
        await mountEditor(<RichTextEditor value="<p>Welcome to FMCA</p>" />);

        expect(screen.getByText('Welcome to FMCA')).toBeInTheDocument();

        for (const label of [
            'Undo',
            'Redo',
            'Paragraph',
            'Heading 2',
            'Heading 3',
            'Bold',
            'Italic',
            'Underline',
            'Strikethrough',
            'Bullet list',
            'Numbered list',
            'Quote',
            'Inline code',
            'Code block',
            'Divider',
            'Insert link',
            'Insert image',
            'Remove link',
            'Clear formatting',
        ]) {
            expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
        }
    });

    it('shows a placeholder hint while the document is empty', async () => {
        const { container } = await mountEditor(<RichTextEditor placeholder="Draft the notice…" />);

        const paragraph = container.querySelector('.ProseMirror p');

        expect(paragraph?.classList.contains('is-empty')).toBe(true);
        expect(paragraph?.getAttribute('data-placeholder')).toBe('Draft the notice…');
    });

    it('marks the editing surface invalid for form validation errors', async () => {
        const { container } = await mountEditor(<RichTextEditor invalid label="Full text" />);

        expect(container.querySelector('[role="textbox"]')).toHaveAttribute('aria-invalid', 'true');
        expect(container.firstElementChild).toHaveClass('border-fmca-crimson');
    });

    it('syncs the document when the parent hands down a new value', async () => {
        function Harness() {
            const [html, setHtml] = useState('');

            return (
                <div>
                    <RichTextEditor value={html} onContentChange={setHtml} />
                    <button type="button" onClick={() => setHtml('<h2>Heads up</h2><p>Extra detail.</p>')}>
                        Update
                    </button>
                </div>
            );
        }

        await mountEditor(<Harness />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        expect(await screen.findByRole('heading', { name: 'Heads up' })).toBeInTheDocument();
        expect(screen.getByText('Extra detail.')).toBeInTheDocument();
    });

    it('reports the document HTML to the parent when formatting is applied', async () => {
        const onContentChange = vi.fn();

        await mountEditor(<RichTextEditor value="<p>Select me</p>" onContentChange={onContentChange} />);
        selectAll();
        fireEvent.click(screen.getByRole('button', { name: 'Bold' }));

        expect(onContentChange).toHaveBeenCalledWith('<p><strong>Select me</strong></p>');
    });

    it('applies a safe link to the selected text', async () => {
        await mountEditor(<RichTextEditor value="<p>Visit the centre</p>" />);
        selectAll();
        fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));

        fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
            target: { value: 'https://fmca.gov.ng/visit' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        const link = await screen.findByRole('link', { name: 'Visit the centre' });
        expect(link).toHaveAttribute('href', 'https://fmca.gov.ng/visit');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('refuses unsafe link destinations', async () => {
        await mountEditor(<RichTextEditor value="<p>Visit the centre</p>" />);
        selectAll();
        fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));

        fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
            target: { value: 'javascript:alert(1)' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        expect(screen.getByRole('alert')).toHaveTextContent('Links must be an internal path');
    });

    it('inserts an image with required alt text from a safe URL', async () => {
        const onContentChange = vi.fn();

        await mountEditor(<RichTextEditor onContentChange={onContentChange} />);
        fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));
        fireEvent.change(screen.getByLabelText('Image URL'), {
            target: { value: '/storage/media/renal-team.jpg' },
        });
        fireEvent.change(screen.getByLabelText('Alternative text'), {
            target: { value: 'Renal care team' },
        });
        fireEvent.click(screen.getAllByRole('button', { name: 'Insert image' }).at(-1)!);

        const image = document.querySelector('.ProseMirror img');
        expect(image).toHaveAttribute('src', '/storage/media/renal-team.jpg');
        expect(image).toHaveAttribute('alt', 'Renal care team');
        expect(onContentChange).toHaveBeenLastCalledWith(
            expect.stringContaining('alt="Renal care team"'),
        );
    });

    it('rejects unsafe image destinations', async () => {
        await mountEditor(<RichTextEditor />);
        fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));
        fireEvent.change(screen.getByLabelText('Image URL'), {
            target: { value: 'javascript:alert(1)' },
        });
        fireEvent.change(screen.getByLabelText('Alternative text'), {
            target: { value: 'Unsafe image' },
        });
        fireEvent.click(screen.getAllByRole('button', { name: 'Insert image' }).at(-1)!);

        expect(screen.getByRole('alert')).toHaveTextContent('Use an internal media URL');
        expect(document.querySelector('.ProseMirror img')).toBeNull();
    });

    it('requires alternative text before inserting an image', async () => {
        await mountEditor(<RichTextEditor />);
        fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));
        fireEvent.change(screen.getByLabelText('Image URL'), {
            target: { value: '/storage/media/renal-team.jpg' },
        });
        fireEvent.click(screen.getAllByRole('button', { name: 'Insert image' }).at(-1)!);

        expect(screen.getByRole('alert')).toHaveTextContent('Add alternative text');
        expect(document.querySelector('.ProseMirror img')).toBeNull();
    });
});
