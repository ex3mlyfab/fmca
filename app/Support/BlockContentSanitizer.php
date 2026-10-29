<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Cleans editor-authored HTML before content blocks are stored.
 *
 * The rich text editor lets staff compose headings, lists, links, quotes,
 * images and code. The public site may only render a fixed whitelist of that
 * markup, so unsupported elements, event handlers and styles are stripped.
 * Link and image targets are restricted to the same safe set the validation
 * layer uses (internal path, anchor, `.`/`..` relative, or http(s)).
 */
final class BlockContentSanitizer
{
    /** Elements allowed in a public document. */
    private const ALLOWED_TAGS = [
        'a', 'blockquote', 'br', 'code', 'em', 'h2', 'h3', 'hr', 'i', 'img', 'li',
        'ol', 'p', 'pre', 's', 'strong', 'u', 'ul',
    ];

    /**
     * Dangerous elements are dropped wholesale (content included) rather than
     * unwrapped, so script, style and object payloads cannot surface as text.
     */
    private const DROPPED_TAGS = [
        'script', 'style', 'svg', 'math', 'iframe', 'object', 'embed',
        'form', 'input', 'button', 'textarea', 'select',
        'video', 'audio', 'source', 'picture', 'link', 'meta', 'base',
    ];

    /** Per-element attribute allow-list; every other attribute is stripped. */
    private const ALLOWED_ATTRIBUTES = [
        'a' => ['href'],
        'img' => ['src', 'alt'],
    ];

    /**
     * Sanitise a block's decoded content array, returning the same array with
     * the block-type-specific HTML fields cleaned.
     *
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    public static function content(string $blockKey, array $content): array
    {
        return match ($blockKey) {
            'rich_text' => array_merge($content, [
                'body' => self::richTextBody((string) ($content['body'] ?? '')),
            ]),
            default => $content,
        };
    }

    /**
     * A rich_text body is either editor-produced HTML or legacy plain text
     * (seeded statements, old drafts). Only HTML is scrubbed; plain text
     * passes through untouched and the public renderer prints it as escaped
     * paragraphs, so both paths are safe.
     */
    public static function richTextBody(string $body): string
    {
        $trimmed = trim($body);

        if ($trimmed === '' || preg_match('/^<[^>\s]/', $trimmed) !== 1) {
            return $body;
        }

        return self::html($body);
    }

    /**
     * Reduce an HTML fragment to the public whitelist.
     */
    public static function html(string $html): string
    {
        $trimmed = trim($html);

        if ($trimmed === '') {
            return '';
        }

        $source = new DOMDocument('1.0', 'UTF-8');
        // The `<?xml` prefix keeps libxml parsing UTF-8 as UTF-8.
        $source->loadHTML('<?xml encoding="utf-8"?>'.$trimmed, LIBXML_NOERROR | LIBXML_NOWARNING);

        $target = new DOMDocument('1.0', 'UTF-8');
        $root = $target->createElement('div');
        $target->appendChild($root);

        // libxml wraps a fragment as `<html><head></head><body>…</body></html>`,
        // so the fragment content lives under `<body>`, not under the first child
        // of `<html>` (which is the empty `<head>`).
        $body = $source->getElementsByTagName('body')->item(0);
        self::copyInto($root, $body ? $body->childNodes : []);

        // Serialize the root's children rather than the root itself, so the
        // temporary container div never leaks into the stored content.
        $parts = [];

        foreach ($root->childNodes as $node) {
            $parts[] = $target->saveHTML($node);
        }

        return trim(implode('', $parts));
    }

    /**
     * @param  iterable<DOMNode>  $nodes
     */
    private static function copyInto(DOMNode $target, iterable $nodes): void
    {
        foreach ($nodes as $node) {
            if ($node instanceof DOMElement) {
                self::copyElement($target, $node);
            } elseif ($node->nodeType === XML_TEXT_NODE) {
                $target->appendChild($target->ownerDocument->createTextNode($node->nodeValue ?? ''));
            }
        }
    }

    private static function copyElement(DOMNode $target, DOMElement $element): void
    {
        $name = strtolower($element->nodeName);

        if (in_array($name, self::DROPPED_TAGS, true)) {
            return;
        }

        if (! in_array($name, self::ALLOWED_TAGS, true)) {
            // Unknown element: keep its children, drop the tag.
            self::copyInto($target, $element->childNodes);

            return;
        }

        if ($name === 'img' && ! self::isAllowedImageSource($element->getAttribute('src'))) {
            return;
        }

        $clean = $target->ownerDocument->createElement($name);

        foreach (self::ALLOWED_ATTRIBUTES[$name] ?? [] as $attribute) {
            $value = $element->getAttribute($attribute);

            if ($attribute === 'alt') {
                $clean->setAttribute($attribute, $value);
            } elseif ($value !== '' && ($name === 'img' ? self::isAllowedImageSource($value) : self::isAllowedHref($value))) {
                $clean->setAttribute($attribute, $value);
            }
        }

        $target->appendChild($clean);
        self::copyInto($clean, $element->childNodes);
    }

    private static function isAllowedHref(string $value): bool
    {
        return SafeHrefs::isSafe($value);
    }

    private static function isAllowedImageSource(string $value): bool
    {
        return $value !== '' && ! str_starts_with($value, '#') && SafeHrefs::isSafe($value);
    }
}
