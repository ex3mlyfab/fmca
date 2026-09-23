<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSiteMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageSiteMenu() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:100'],
            // Destinations stay inside the site or on an explicit http(s) host:
            // a "javascript:" or data: scheme would execute in the visitor's
            // browser when the header link is clicked, so both are rejected.
            'href' => ['required', 'string', 'max:2048', 'regex:~^(/(?!/)|#|\\.{1,2}/|https?://)~'],
            'sort_order' => ['integer', 'min:0'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule('draft'),
        ];
    }

    /**
     * Only staff with the publish_site_menu permission may set a menu item to
     * published. A user without that permission may keep an already-published
     * item published while editing, or unpublish it, but cannot publish a
     * draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_site_menu')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.$currentStatus];
    }
}
