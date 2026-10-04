import { cn } from '@/lib/utils';

type Props = {
    /** The rich HTML string or plain text to render */
    body: string;
    /** Optional class names to add to the container */
    className?: string;
};

/**
 * Render editor-authored body copy: server-sanitised HTML when the CMS stored
 * markup, escaped plain text paragraphs otherwise. This ensures the public facing 
 * end treats stored content the same way everywhere.
 */
export function RichBody({ body, className }: Props) {
    if (!body) {
        return null;
    }

    const text = body.trim();
    if (!text) {
        return null;
    }

    const isHtml = /^<[^>\s]/.test(text);

    if (isHtml) {
        // Stored HTML is sanitised server-side (App\Support\BlockContentSanitizer)
        // before it reaches the database; the editor's SafeLink extension keeps
        // link targets internal or http(s) on the way in as well.
        return <div className={cn('fmca-prose', className)} dangerouslySetInnerHTML={{ __html: text }} />;
    }

    return (
        <div className={cn('space-y-3', className)}>
            {text
                .split('\n')
                .filter((line) => line.trim() !== '')
                .map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-slate-700">
                        {paragraph}
                    </p>
                ))}
        </div>
    );
}
