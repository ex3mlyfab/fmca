<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoMetadataRequest extends FormRequest
{
    /**
     * The SEO editor is reachable only by content owners; the controller
     * authorizes against the content's own policy before the request runs.
     */
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
            'title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'string', 'max:2048'],
            'og_image_url' => ['nullable', 'string', 'max:2048'],
            'robots' => ['nullable', 'string', 'max:40'],
            'structured_data' => array_filter([
                'nullable',
                ...($this->filled('structured_data') ? [
                    'json',
                    'max:20000',
                    function ($attribute, $value, \Closure $fail) {
                        if (! is_array(json_decode((string) $value, true))) {
                            $fail('The '.$attribute.' field must be a JSON object or array.');
                        }
                    },
                ] : []),
            ]),
        ];
    }
}
