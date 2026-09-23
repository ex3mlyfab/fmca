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
