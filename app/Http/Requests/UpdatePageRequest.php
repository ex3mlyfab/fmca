<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use App\Models\Page;
use App\Models\PageTemplate;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageRequest extends FormRequest
{
    use ValidatesSafeHrefs;

    public function authorize(): bool
    {
        return $this->user()?->canManagePages() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $template = $this->template();
        $page = $this->route('page');
        $summaryRules = ['string', 'max:240'];
        $ownerRules = ['string', 'max:120'];

        if ($template?->requires_summary) {
            array_unshift($summaryRules, 'required');
        } else {
            array_unshift($summaryRules, 'nullable');
        }

        if ($template?->requires_owner) {
            array_unshift($ownerRules, 'required');
        } else {
            array_unshift($ownerRules, 'nullable');
        }

        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'alpha_dash',
                Rule::unique('pages', 'slug')->ignore($page?->id),
            ],
            'summary' => $summaryRules,
            'template_id' => ['required', 'integer', Rule::exists('page_templates', 'id')],
            'owner' => $ownerRules,
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($page?->status ?? 'draft'),
            'blocks' => ['required', 'array', 'max:20'],
            'blocks.*.block_key' => ['required', 'string', Rule::in($template?->permitted_blocks ?? [])],
            'blocks.*.content' => ['required', 'json'],
        ];
    }

    /**
     * Block content link targets must be safe (internal or http(s) only).
     */
    public function after(): ?Closure
    {
        return $this->safeHrefAfter();
    }

    /**
     * Only staff with the publish_pages permission may set a page to published.
     * A user without that permission may keep an already-published page
     * published while editing, or demote it, but cannot publish a draft or
     * review page.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_pages')) {
            return ['sometimes', 'string', Rule::in(['draft', 'review', 'published'])];
        }

        if ($currentStatus === 'published') {
            return ['sometimes', 'string', Rule::in(['draft', 'review', 'published'])];
        }

        return ['sometimes', 'string', Rule::in(['draft', 'review'])];
    }

    protected function template(): ?PageTemplate
    {
        return PageTemplate::query()->find($this->input('template_id'));
    }
}
