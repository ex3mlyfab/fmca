<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBrandAssetsRequest;
use App\Models\BrandAsset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandIdentityController extends Controller
{
    public function index(): Response
    {
        $current = BrandAsset::query()->get()->keyBy('slot');

        return Inertia::render('cms/brand-identity/index', [
            'slots' => BrandAsset::slotCatalogue(),
            'assets' => $current->map(fn (BrandAsset $asset): array => $this->assetPayload($asset))->toArray(),
            'maxKilobytes' => UpdateBrandAssetsRequest::MAX_KILO_BYTES,
            'canPublish' => Gate::allows('publish', BrandAsset::class),
        ]);
    }

    public function update(UpdateBrandAssetsRequest $request): RedirectResponse
    {
        foreach (BrandAsset::SLOTS as $slot) {
            if (! $request->hasSlotInput($slot)) {
                continue;
            }

            $prefix = "slots.{$slot}";
            $asset = BrandAsset::query()->where('slot', $slot)->first();
            $file = $request->file("{$prefix}.file");

            if ($file instanceof UploadedFile) {
                $path = $file->store('brand/'.now()->format('Y/m'), 'public');
                $stored = $this->fileAttributes($file, $path);

                if ($asset === null) {
                    $asset = BrandAsset::query()->create($stored + [
                        'slot' => $slot,
                        'created_by' => $request->user()->id,
                    ]);
                } else {
                    $previous = $asset->file_path;
                    $asset->update($stored);

                    if ($previous !== null) {
                        Storage::disk('public')->delete($previous);
                    }
                }
            }

            // Governance metadata for a slot that holds no file has nothing to
            // attach to, so it is dropped rather than creating an empty row.
            if ($asset === null) {
                continue;
            }

            $asset->update($this->governanceAttributes($prefix, $request, $asset));
        }

        return to_route('cms.brand-identity.index');
    }

    public function destroy(BrandAsset $asset): RedirectResponse
    {
        Storage::disk('public')->delete($asset->file_path);
        $asset->delete();

        return to_route('cms.brand-identity.index');
    }

    /**
     * Stored attributes for a freshly uploaded file.
     *
     * @return array<string, string|int>
     */
    private function fileAttributes(UploadedFile $file, string $path): array
    {
        return [
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
        ];
    }

    /**
     * Ownership and approval state for one slot. Icons carry no alt text: they
     * are decorative and announced nowhere, so a stored value would be dead.
     *
     * @return array<string, string|Carbon|null>
     */
    private function governanceAttributes(string $prefix, UpdateBrandAssetsRequest $request, BrandAsset $asset): array
    {
        return [
            'alt_text' => BrandAsset::acceptsAltText($asset->slot)
                ? ($request->filled("{$prefix}.alt_text") ? $request->string("{$prefix}.alt_text")->toString() : null)
                : null,
            'owner' => $request->filled("{$prefix}.owner") ? $request->string("{$prefix}.owner")->toString() : null,
            'reviewed_at' => $request->filled("{$prefix}.reviewed_at") ? $request->date("{$prefix}.reviewed_at") : null,
            'status' => $request->input("{$prefix}.status", $asset->status),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function assetPayload(BrandAsset $asset): array
    {
        return [
            'id' => $asset->id,
            'url' => $asset->url(),
            'fileName' => $asset->file_name,
            'mimeType' => $asset->mime_type,
            'sizeBytes' => $asset->size_bytes,
            'altText' => $asset->alt_text,
            'owner' => $asset->owner,
            'reviewedAt' => $asset->reviewed_at?->format('Y-m-d'),
            'status' => $asset->status,
            'canDelete' => Gate::allows('delete', $asset),
        ];
    }
}
