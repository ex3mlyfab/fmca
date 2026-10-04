<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Requests\UpdatePartnerRequest;
use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/partners/index', [
            'partners' => Partner::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'logo', 'website_url', 'sort_order', 'status', 'owner', 'reviewed_at', 'created_by'])
                ->map(fn (Partner $partner): array => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'logo' => $partner->logo,
                    'websiteUrl' => $partner->website_url,
                    'sortOrder' => $partner->sort_order,
                    'status' => $partner->status,
                    'owner' => $partner->owner,
                    'reviewedAt' => $partner->reviewed_at?->format('j M Y'),
                    'canDelete' => Gate::allows('delete', $partner),
                ])->values(),
            'canCreate' => Gate::allows('create', Partner::class),
            'canPublish' => $this->user()?->hasPermission('publish_partners') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Partner::class);

        return Inertia::render('cms/partners/edit', [
            'partner' => null,
            'canPublish' => $this->user()?->hasPermission('publish_partners') ?? false,
        ]);
    }

    public function store(StorePartnerRequest $request): RedirectResponse
    {
        $partner = Partner::query()->create([
            'name' => $request->string('name')->toString(),
            'logo' => $request->string('logo')->toString(),
            'website_url' => $request->filled('website_url') ? $request->string('website_url')->toString() : null,
            'sort_order' => $request->integer('sort_order') ?: 0,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.partners.edit', ['partner' => $partner->id]);
    }

    public function edit(Partner $partner): Response
    {
        return Inertia::render('cms/partners/edit', [
            'partner' => $this->partnerAttributes($partner),
            'canPublish' => $this->user()?->hasPermission('publish_partners') ?? false,
        ]);
    }

    public function update(UpdatePartnerRequest $request, Partner $partner): RedirectResponse
    {
        $partner->update([
            'name' => $request->string('name')->toString(),
            'logo' => $request->string('logo')->toString(),
            'website_url' => $request->filled('website_url') ? $request->string('website_url')->toString() : null,
            'sort_order' => $request->integer('sort_order') ?: 0,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $partner->status),
        ]);

        return to_route('cms.partners.index');
    }

    public function destroy(Partner $partner): RedirectResponse
    {
        Gate::authorize('delete', $partner);

        $partner->delete();

        return to_route('cms.partners.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function partnerAttributes(Partner $partner): array
    {
        return [
            'id' => $partner->id,
            'name' => $partner->name,
            'logo' => $partner->logo,
            'website_url' => $partner->website_url,
            'sort_order' => $partner->sort_order,
            'owner' => $partner->owner,
            'reviewed_at' => $partner->reviewed_at?->format('Y-m-d'),
            'status' => $partner->status,
        ];
    }

    private function user()
    {
        return request()->user();
    }
}
