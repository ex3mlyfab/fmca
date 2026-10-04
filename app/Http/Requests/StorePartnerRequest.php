<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartnerRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:120'],
            'logo' => ['required', 'string', 'max:255', $this->safeHrefRule()],
            'website_url' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'sort_order' => ['integer', 'min:0'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule('draft'),
        ];
    }

    /**
     * Only staff with the publish_partners permission may set a partner to
     * published; everyone else may only keep the draft state.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_partners')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.$currentStatus];
    }
}
