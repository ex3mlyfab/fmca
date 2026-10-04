<?php

namespace App\Http\Requests;

use App\Models\BrandAsset;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrandAssetsRequest extends FormRequest
{
    /**
     * Upload ceilings in kilobytes. Brand marks and browser icons should stay
     * small; oversized files are almost always a wrong asset, not a bigger one.
     *
     * @var array<string, int>
     */
    public const MAX_KILO_BYTES = [
        BrandAsset::SLOT_HEADER_LOGO => 2048,
        BrandAsset::SLOT_FOOTER_LOGO => 2048,
        BrandAsset::SLOT_FAVICON => 512,
        BrandAsset::SLOT_APPLE_TOUCH_ICON => 1024,
    ];

    /**
     * Extension allow-lists. Paired with `mimetypes` below so both the
     * extension and the detected bytes have to agree.
     *
     * @var array<string, string>
     */
    private const EXTENSIONS = [
        BrandAsset::SLOT_HEADER_LOGO => 'png,jpg,jpeg,webp,svg',
        BrandAsset::SLOT_FOOTER_LOGO => 'png,jpg,jpeg,webp,svg',
        BrandAsset::SLOT_FAVICON => 'ico,png,jpg,jpeg,webp',
        BrandAsset::SLOT_APPLE_TOUCH_ICON => 'png',
    ];

    public function authorize(): bool
    {
        return $this->user()?->canManageBrandIdentity() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return collect(BrandAsset::SLOTS)
            ->mapWithKeys(function (string $slot): array {
                $prefix = "slots.{$slot}";

                return [
                    // Every slot accepts an upload, a status change, or both.
                    // A slot with neither is left untouched.
                    "{$prefix}.file" => ['nullable', 'file', 'mimes:'.self::EXTENSIONS[$slot], 'mimetypes:'.implode(',', BrandAsset::allowedMimeTypes($slot)), 'max:'.self::MAX_KILO_BYTES[$slot]],
                    // Icons are decorative, so only logos expose an alt field.
                    ...(BrandAsset::acceptsAltText($slot) ? ["{$prefix}.alt_text" => ['nullable', 'string', 'max:255']] : []),
                    "{$prefix}.owner" => ['nullable', 'string', 'max:120'],
                    "{$prefix}.reviewed_at" => ['nullable', 'date'],
                    "{$prefix}.status" => $this->statusRule($slot),
                ];
            })
            ->all();
    }

    /**
     * Only staff holding publish_brand_identity may promote a slot to
     * published. Anyone with edit rights may keep a published slot published
     * while editing, or pull it back to draft, but cannot publish a draft.
     *
     * @return array<int, ValidationRule|string>
     */
    protected function statusRule(string $slot): array
    {
        if ($this->user()?->hasPermission('publish_brand_identity')) {
            return ['sometimes', 'string', Rule::in(['draft', 'published'])];
        }

        $current = BrandAsset::query()->where('slot', $slot)->value('status') ?? 'draft';

        return ['sometimes', 'string', 'in:'.($current === 'published' ? 'draft,published' : 'draft')];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return collect(BrandAsset::SLOTS)
            ->mapWithKeys(function (string $slot): array {
                $label = BrandAsset::slotCatalogue()[$slot]['label'];

                return [
                    "slots.{$slot}.file" => "The {$label} must be ".BrandAsset::slotCatalogue()[$slot]['formats'].' under '.(self::MAX_KILO_BYTES[$slot] / 1024).' MB.',
                ];
            })
            ->all();
    }

    /**
     * Whether the editor actually sent anything for this slot: a new file, or
     * explicit governance metadata to revise. `has()` is used rather than
     * `filled()` because the slot key resolves to an array, not a scalar.
     */
    public function hasSlotInput(string $slot): bool
    {
        $prefix = "slots.{$slot}";

        return $this->hasFile("{$prefix}.file")
            || $this->has("{$prefix}.alt_text")
            || $this->has("{$prefix}.owner")
            || $this->has("{$prefix}.reviewed_at")
            || $this->has("{$prefix}.status");
    }
}
