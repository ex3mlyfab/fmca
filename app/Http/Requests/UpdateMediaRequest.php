<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageMedia() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:120'],
            'kind' => ['required', 'string', Rule::in(['image', 'video'])],
            'file' => $this->fileRule(),
            'alt_text' => ['required', 'string', 'max:500'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
        ];
    }

    /**
     * A replacement file is optional when editing; only validated when present.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function fileRule(): array
    {
        if ($this->input('kind') === 'video') {
            return ['nullable', 'file', 'mimes:mp4,webm,mov', 'mimetypes:'.StoreMediaRequest::VIDEO_MIME_TYPES, 'max:51200'];
        }

        return ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'mimetypes:'.StoreMediaRequest::IMAGE_MIME_TYPES, 'max:4096'];
    }
}
