<?php

namespace App\Http\Requests;

use App\Models\Consultant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateConsultantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageConsultants() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Consultant $consultant */
        $consultant = $this->route('consultant');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:160',
                'alpha_dash',
                Rule::unique(Consultant::class, 'slug')->ignore($consultant->id),
            ],
            'specialty' => ['required', 'string', 'max:120'],
            'position' => ['nullable', 'string', 'max:120'],
            'biography' => ['nullable', 'string'],
            'portrait' => ['nullable', 'string', 'max:255'],
            'specialty_tags' => ['nullable', 'string', 'max:240'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($consultant->status),
        ];
    }

    /**
     * Only staff with the publish_consultants permission may set a consultant
     * profile to published. A user without that permission may keep an
     * already-published profile published while editing, or unpublish it,
     * but cannot re-publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_consultants')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
