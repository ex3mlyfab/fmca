<?php

namespace App\Http\Requests;

use App\Models\CommitteeMember;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCommitteeMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageCommittees() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var CommitteeMember $member */
        $member = $this->route('committeeMember');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:160',
                'alpha_dash',
                Rule::unique(CommitteeMember::class, 'slug')->ignore($member->id),
            ],
            'role' => ['required', 'string', 'max:120'],
            'portfolio' => ['nullable', 'string', 'max:120'],
            'mandate' => ['nullable', 'string'],
            'term' => ['nullable', 'string', 'max:60'],
            'sort_order' => ['integer', 'min:0'],
            'portrait' => ['nullable', 'string', 'max:255'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule($member->status),
        ];
    }

    /**
     * Only staff with the publish_committees permission may set a committee
     * member profile to published. A user without that permission may keep
     * an already-published profile published while editing, or unpublish it,
     * but cannot re-publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_committees')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
