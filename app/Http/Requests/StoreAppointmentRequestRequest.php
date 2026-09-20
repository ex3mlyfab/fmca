<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:190'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'preferred_service' => ['nullable', 'string', 'max:120'],
            'preferred_date' => ['nullable', 'date'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'consent' => ['required', 'accepted'],
            'website' => ['nullable', 'max:0'],
        ];
    }
}
