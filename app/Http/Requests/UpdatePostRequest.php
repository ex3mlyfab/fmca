<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use App\Models\Post;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
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
        /** @var Post $post */
        $post = $this->route('post');

        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:160', 'alpha_dash', Rule::unique(Post::class, 'slug')->ignore($post)],
            'summary' => ['required', 'string', 'max:240'],
            'body' => ['required', 'string'],
            'feature_image' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'feature_image_alt' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'author' => ['required', 'string', 'max:120'],
            'publish_date' => ['required', 'date'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($post->status),
        ];
    }

    /**
     * Only staff with the publish_news permission may set a post to published.
     * A user without that permission may keep an already-published post
     * published while editing, or unpublish it, but cannot re-publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_news')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
