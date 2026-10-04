<?php

namespace App\Http\Requests;

use App\Models\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageServices() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Service $service */
        $service = $this->route('service');

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:160', 'alpha_dash', Rule::unique(Service::class, 'slug')->ignore($service)],
            'summary' => ['required', 'string', 'max:240'],
            'description' => ['required', 'string'],
            'referral_guidance' => ['nullable', 'string'],
            'eligibility' => ['nullable', 'string', 'max:240'],
            'department_id' => ['nullable', 'integer', Rule::exists('departments', 'id')],
            'owner' => ['nullable', 'string', 'max:120'],
            'status' => $this->statusRule($service->status),
        ];
    }

    /**
     * Only staff with the publish_services permission may set a service to
     * published. A user without that permission may keep an already-published
     * service published while editing, or unpublish it, but cannot re-publish
     * a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_services')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        return ['sometimes', 'string', 'in:'.($currentStatus === 'published' ? 'draft,published' : 'draft')];
    }
}
