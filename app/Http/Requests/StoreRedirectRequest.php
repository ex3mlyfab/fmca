<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRedirectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageRedirects() ?? false;
    }

    /**
     * Normalise the source path before validation.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('from_path'))) {
            $this->merge([
                'from_path' => $this->normalizePath((string) $this->input('from_path')),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'from_path' => [
                'required',
                'string',
                'max:255',
                'regex:#^/\\S+$#',
                Rule::unique('redirects', 'from_path'),
            ],
            'to_path' => ['required', 'string', 'max:2048'],
            'status_code' => ['sometimes', 'integer', Rule::in([301, 302])],
        ];
    }

    /**
     * Trim to a single leading slash and lowercase for consistent matching.
     */
    protected function normalizePath(string $path): string
    {
        $path = mb_strtolower(trim($path, '/'));

        return $path === '' ? '/' : '/'.$path;
    }
}
