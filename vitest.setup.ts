import { vi } from 'vitest';

// Importing the vitest entry auto-extends expect with jest-dom matchers
// (toBeInTheDocument, toHaveAttribute, ...) — no manual registration needed.
import '@testing-library/jest-dom/vitest';

// jsdom does not implement MediaQueryList; the campaign carousel reads
// prefers-reduced-motion on mount. Default to "no preference" — tests that
// exercise reduced motion override the implementation per-test.
vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
);

// ProseMirror (the TipTap rich text editor) asks the DOM for layout geometry
// and scroll helpers that jsdom does not fully implement. Provide zero-value
// fallbacks only where jsdom leaves a gap, so an editor can mount and
// dispatch transactions in tests without polluting the real jsdom APIs.
const zeroRect: DOMRect = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
};
const emptyClientRects = {
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
};

if (!Range.prototype.getBoundingClientRect) {
    Range.prototype.getBoundingClientRect = () => zeroRect;
}
if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => emptyClientRects as DOMRectList;
}
if (!Element.prototype.getClientRects) {
    Element.prototype.getClientRects = () => emptyClientRects as DOMRectList;
}
if (!Element.prototype.getBoundingClientRect) {
    Element.prototype.getBoundingClientRect = () => zeroRect;
}
if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
}
