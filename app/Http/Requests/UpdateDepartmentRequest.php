<?php

namespace App\Http\Requests;

use App\Models\Department;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageDepartments() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Department $department */
        $department = $this->route('department');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:160', 'alpha_dash', Rule::unique(Department::class, 'slug')->ignore($department)],
            'summary' => ['required', 'string', 'max:240'],
            'description' => ['required', 'string'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:160'],
            'owner' => ['nullable', 'string', 'max:120'],
            'status' => $this->statusRule($department->status),
        ];
    }

    /**
     * Only staff with the publish_departments permission may set a department
     * to published. A user without that permission may keep an already
     * published department published while editing, or unpublish it, but
     * cannot re-publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_departments')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
