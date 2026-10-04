<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use App\Models\Partner;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePartnerRequest extends FormRequest
{
    use ValidatesSafeHrefs;

    public function authorize(): bool
    {
        return $this->user()?->canManagePartners() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Partner $partner */
        $partner = $this->route('partner');

        return [
            'name' => ['required', 'string', 'max:120'],
            'logo' => ['required', 'string', 'max:255', $this->safeHrefRule()],
            'website_url' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'sort_order' => ['integer', 'min:0'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($partner->status),
        ];
    }

    /**
     * Only staff with the publish_partners permission may set a partner to
     * published. A user without that permission may keep an already-published
     * partner published while editing, or unpublish it, but cannot
     * re-publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_partners')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
