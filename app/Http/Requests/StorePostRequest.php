<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use App\Models\Post;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    use ValidatesSafeHrefs;

    public function authorize(): bool
    {
        return $this->user()?->canManageNews() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:160', 'alpha_dash', Rule::unique(Post::class, 'slug')],
            'summary' => ['required', 'string', 'max:240'],
            'body' => ['required', 'string'],
            'feature_image' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'feature_image_alt' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'author' => ['required', 'string', 'max:120'],
            'publish_date' => ['required', 'date'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule('draft'),
        ];
    }

    /**
     * Only staff with the publish_news permission may set a post to published.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_news')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.$currentStatus];
    }
}
