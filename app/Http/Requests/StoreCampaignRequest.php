<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCampaignRequest extends FormRequest
{
    use ValidatesSafeHrefs;

    public function authorize(): bool
    {
        return $this->user()?->canManageCampaigns() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $endDateRules = ['nullable', 'date'];

        if ($this->filled('start_date')) {
            $endDateRules[] = 'after_or_equal:start_date';
        }

        return [
            'title' => ['required', 'string', 'max:120'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'copy' => ['required', 'string'],
            'primary_cta_label' => ['nullable', 'string', 'max:80'],
            'primary_cta_href' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'secondary_cta_label' => ['nullable', 'string', 'max:80'],
            'secondary_cta_href' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'desktop_media' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'mobile_media' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'media_alt' => ['nullable', 'string', 'max:255'],
            'focal_point' => ['nullable', 'string', Rule::in(['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'])],
            'video_poster' => ['nullable', 'string', 'max:255', $this->safeHrefRule()],
            'overlay_intensity' => ['nullable', 'integer', 'min:0', 'max:100'],
            'owner' => ['required', 'string', 'max:120'],
            'advisory' => ['sometimes', 'boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => $endDateRules,
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule('draft'),
        ];
    }

    /**
     * Only staff with the publish_campaigns permission may set a campaign to
     * published; everyone else is limited to draft and review states.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $currentStatus): array
    {
        if ($this->user()?->hasPermission('publish_campaigns')) {
            return ['sometimes', 'string', Rule::in(['draft', 'review', 'published'])];
        }

        return ['sometimes', 'string', Rule::in(['draft', 'review'])];
    }
}
