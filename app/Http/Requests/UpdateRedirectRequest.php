<?php

namespace App\Http\Requests;

use App\Models\Redirect;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRedirectRequest extends FormRequest
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
        /** @var Redirect|null $redirect */
        $redirect = $this->route('redirect');

        return [
            'from_path' => [
                'required',
                'string',
                'max:255',
                'regex:#^/\\S+$#',
                Rule::unique('redirects', 'from_path')->ignore($redirect?->id),
            ],
            // Targets must stay inside the application: an absolute URL or a
            // protocol-relative path (//evil.com) would turn this into a
            // stored open redirect on the hospital domain.
            'to_path' => ['required', 'string', 'max:2048', 'starts_with:/', 'not_regex:#^//#'],
            'status_code' => ['sometimes', 'integer', Rule::in([301, 302])],
            'is_active' => ['sometimes', 'boolean'],
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
