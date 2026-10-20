// Adapted from https://www.shadcn.io/hooks/use-copy-to-clipboard
import { useCallback, useEffect, useRef, useState } from 'react';

export type UseCopyToClipboardReturn = [
    copy: (text: string) => Promise<void>,
    isCopied: boolean,
];

export function useCopyToClipboard(resetDelay = 2000): UseCopyToClipboardReturn {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const copy = useCallback(
        async (text: string) => {
            if (!navigator?.clipboard) {
                // Fallback for non-secure contexts
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-//9999px';
                    textArea.style.top = '0';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setIsCopied(true);
                    
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }

                    timeoutRef.current = setTimeout(() => {
                        setIsCopied(false);
                    }, resetDelay);
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                return;
            }

            try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    setIsCopied(false);
                }, resetDelay);
            } catch (err) {
                console.error('Clipboard copy failed', err);
            }
        },
        [resetDelay],
    );

    return [copy, isCopied];
}

export default useCopyToClipboard;
