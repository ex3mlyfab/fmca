<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends FormRequest
{
    /**
     * Content-based MIME allow-lists. The `mimes` rule only checks the
     * detected extension, so `mimetypes` verifies the actual file bytes.
     */
    public const IMAGE_MIME_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

    public const VIDEO_MIME_TYPES = 'video/mp4,video/webm,video/quicktime';

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
     * Accepted files depend on the selected kind: still images for
     * campaign heroes and blocks, short video for campaign motion.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function fileRule(): array
    {
        if ($this->input('kind') === 'video') {
            return ['required', 'file', 'mimes:mp4,webm,mov', 'mimetypes:'.self::VIDEO_MIME_TYPES, 'max:51200'];
        }

        return ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'mimetypes:'.self::IMAGE_MIME_TYPES, 'max:4096'];
    }
}
