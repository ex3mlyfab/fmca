<?php

namespace App\Concerns;

use App\Support\SafeHrefs;
use Closure;
use Illuminate\Validation\Validator;

/**
 * Editors supply link and media destinations as free strings that end up in
 * public <a href> and <img src> attributes. A "javascript:" (or data:)
 * scheme would execute in the visitor's browser when clicked, so every
 * destination is constrained to an internal path/anchor, a relative path, or
 * an explicit http(s) URL — protocol-relative host jumps are rejected.
 */
trait ValidatesSafeHrefs
{
    public const SAFE_HREF = SafeHrefs::PATTERN;

    /**
     * The validation-rule string for a single href or media-URL field.
     */
    protected function safeHrefRule(): string
    {
        return 'regex:'.self::SAFE_HREF;
    }

    /**
     * A post-validation hook that keeps block-content link targets safe.
     *
     * The FormRequest runs this closure through the container with the active
     * validator injected, so errors land on the same message bag that surfaces
     * to the CMS form.
     */
    protected function safeHrefAfter(): ?Closure
    {
        return function (Validator $validator): void {
            foreach ((array) $this->input('blocks', []) as $index => $block) {
                $content = json_decode((string) data_get($block, 'content', ''), true);

                if (! is_array($content)) {
                    continue; // the json rule already reports malformed content
                }

                $hrefs = match ($block['block_key'] ?? '') {
                    'cta' => [data_get($content, 'href')],
                    'document_list' => array_map(
                        static fn ($document): mixed => data_get(is_array($document) ? $document : [], 'href'),
                        (array) data_get($content, 'documents', [])
                    ),
                    default => [],
                };

                foreach ($hrefs as $href) {
                    if ($href === null || $href === '') {
                        continue;
                    }

                    if (is_string($href) && preg_match(self::SAFE_HREF, $href) === 1) {
                        continue;
                    }

                    $validator->errors()->add("blocks.{$index}.content", 'The link target must be an internal path or an http(s) URL.');
                }
            }
        };
    }
}
