<?php

namespace App\Support;

/**
 * The single source of truth for user-supplied link destinations.
 *
 * Editors supply hrefs and media URLs as free strings that end up in public
 * <a href> and <img src> attributes. A "javascript:" (or data:) scheme would
 * execute in the visitor's browser when clicked, so every destination is
 * constrained to an internal path/anchor, a relative path, or an explicit
 * http(s) URL — protocol-relative host jumps are rejected. Both the form
 * validation layer (App\Concerns\ValidatesSafeHrefs) and the block-content
 * sanitizer (App\Support\BlockContentSanitizer) resolve against this pattern
 * so the write path and the storage path can never disagree.
 */
final class SafeHrefs
{
    public const PATTERN = '~^(/(?!/)|#|\\.{1,2}/|https?://)~';

    public static function isSafe(?string $href): bool
    {
        return is_string($href) && $href !== '' && preg_match(self::PATTERN, $href) === 1;
    }
}
