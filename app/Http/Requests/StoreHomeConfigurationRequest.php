<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHomeConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageHomepage() ?? false;
    }

    public function rules(): array
    {
        return [
            'hero_title' => ['required', 'string', 'max:120'],
            'hero_summary' => ['required', 'string', 'max:240'],
            'emergency_message' => ['nullable', 'string', 'max:160'],
            'emergency_phone' => ['nullable', 'string', 'max:30'],
            'campus_status' => ['nullable', 'string', 'max:100'],
            'service_desk' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', Rule::in(['draft'])],
        ];
    }
}
