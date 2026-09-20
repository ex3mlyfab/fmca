<?php

namespace App\Http\Requests;

use App\Models\Clinic;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClinicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageClinics() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Clinic $clinic */
        $clinic = $this->route('clinic');

        return [
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:240'],
            'hours' => ['nullable', 'string'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($clinic->status),
        ];
    }

    /**
     * Only staff with the publish_clinics permission may set a clinic to
     * published. A user without that permission may keep an already-published
     * clinic published while editing, or unpublish it, but cannot re-publish a
     * draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_clinics')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
