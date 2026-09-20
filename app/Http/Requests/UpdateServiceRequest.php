<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageServices() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:160', 'alpha_dash', Rule::unique(Service::class, 'slug')->ignore($this->route('service'))],
            'summary' => ['required', 'string', 'max:240'],
            'description' => ['required', 'string'],
            'referral_guidance' => ['nullable', 'string'],
            'eligibility' => ['nullable', 'string', 'max:240'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'owner' => ['nullable', 'string', 'max:120'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'published'])],
        ];
    }
}
