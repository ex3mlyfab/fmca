/**
 * Client-side mirror of `App\Support\SafeHrefs::PATTERN` (the single source of
 * truth used by both the page-request validation and the block-content
 * sanitizer): a link target is only safe when it is an internal path, a hash
 * anchor, a `.`/`..` relative path, or an explicit http(s) URL.
 * Protocol-relative targets, `javascript:`, `data:` and friends are refused.
 */
const SAFE_HREF = /^\/(?!\/)|^#|^\.{1,2}\/|^https?:\/\//i;

export function isSafeHref(href: string): boolean {
    return SAFE_HREF.test(href);
}

export function isExternalHref(href: string): boolean {
    return /^https?:\/\//i.test(href);
}
