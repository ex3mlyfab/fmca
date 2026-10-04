<?php

namespace App\Http\Requests;

use App\Concerns\ValidatesSafeHrefs;
use App\Models\InstituteProfile;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateInstituteProfileRequest extends FormRequest
{
    use ValidatesSafeHrefs;

    public const MAX_MILESTONES = 12;

    public const MAX_ADDRESS_LINES = 4;

    public const MAX_VISITING_SLOTS = 4;

    /**
     * The only embed hosts accepted verbatim. An unvetted origin in an iframe
     * would run code in the visitor's browser on the FMCA domain, so every
     * override has to be a map provider's own embed document.
     *
     * @var string
     */
    private const EMBED_HOST_PATTERN = '~^https?://(?:www\.)?(?:openstreetmap\.org|google\.com/maps|maps\.google\.com)~';

    public function authorize(): bool
    {
        return $this->user()?->canManageInstituteProfile() ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'institution_name' => ['nullable', 'string', 'max:160'],
            'about_intro' => ['nullable', 'string', 'max:1000'],
            'history_body' => ['nullable', 'string', 'max:20000'],
            'history_milestones' => ['nullable', 'array', 'max:'.self::MAX_MILESTONES],
            'history_milestones.*.year' => ['nullable', 'string', 'max:10'],
            'history_milestones.*.title' => ['nullable', 'string', 'max:120'],
            'history_milestones.*.body' => ['nullable', 'string', 'max:500'],
            'vision_statement' => ['nullable', 'string', 'max:1000'],
            'mission_statement' => ['nullable', 'string', 'max:1000'],
            'general_email' => ['nullable', 'email', 'max:190'],
            'general_phone' => ['nullable', 'string', 'max:32'],
            'general_phone_label' => ['nullable', 'string', 'max:120'],
            'emergency_phone' => ['nullable', 'string', 'max:32'],
            'emergency_label' => ['nullable', 'string', 'max:120'],
            'campus_name' => ['nullable', 'string', 'max:160'],
            'address_lines' => ['nullable', 'array', 'max:'.self::MAX_ADDRESS_LINES],
            'address_lines.*' => ['nullable', 'string', 'max:200'],
            'access_note' => ['nullable', 'string', 'max:240'],
            'location_label' => ['nullable', 'string', 'max:160'],
            'location_address' => ['nullable', 'string', 'max:240'],
            'latitude' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'longitude' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'map_zoom' => ['nullable', 'integer', 'min:3', 'max:19'],
            'directions_url' => ['nullable', 'string', 'max:512', $this->safeHrefRule()],
            'map_embed_url' => ['nullable', 'string', 'max:512', 'url', 'regex:'.self::EMBED_HOST_PATTERN],
            'map_alt_text' => ['nullable', 'string', 'max:240'],
            'visiting_hours' => ['nullable', 'array', 'max:'.self::MAX_VISITING_SLOTS],
            'visiting_hours.*.day_range' => ['nullable', 'string', 'max:80'],
            'visiting_hours.*.morning_slot' => ['nullable', 'string', 'max:60'],
            'visiting_hours.*.evening_slot' => ['nullable', 'string', 'max:60'],
            'visiting_hours.*.status' => ['nullable', 'string', 'max:80'],
            'visiting_policy_note' => ['nullable', 'string', 'max:1000'],
            'owner' => ['nullable', 'string', 'max:120'],
            'reviewed_at' => ['nullable', 'date'],
            'status' => $this->statusRule(),
        ];
    }

    /**
     * @return array<int, callable|ValidationRule|string>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $latitude = $this->input('latitude');
                $longitude = $this->input('longitude');

                $hasLatitude = $latitude !== null && $latitude !== '';
                $hasLongitude = $longitude !== null && $longitude !== '';

                if ($hasLongitude && ! $hasLatitude) {
                    $validator->errors()->add('latitude', 'Enter both coordinates, or leave both empty.');
                }

                if ($hasLatitude && ! $hasLongitude) {
                    $validator->errors()->add('longitude', 'Enter both coordinates, or leave both empty.');
                }
            },
        ];
    }

    /**
     * Only staff holding publish_institute_profile may publish. Anyone with
     * edit rights may keep a published profile published while editing, or
     * pull it back to draft, but cannot publish a draft. The profile also
     * carries the emergency line shown on every public page.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(): array
    {
        if ($this->user()?->hasPermission('publish_institute_profile')) {
            return ['required', 'string', Rule::in([InstituteProfile::STATUS_DRAFT, InstituteProfile::STATUS_PUBLISHED])];
        }

        $current = InstituteProfile::query()->value('status') ?? InstituteProfile::STATUS_DRAFT;

        return ['required', 'string', 'in:'.($current === InstituteProfile::STATUS_PUBLISHED ? 'draft,published' : 'draft')];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'map_embed_url.regex' => 'The embed URL must point at OpenStreetMap or Google Maps.',
            'directions_url.regex' => 'The directions link must be an internal path or an http(s) URL.',
        ];
    }
}
