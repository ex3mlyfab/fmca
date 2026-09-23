<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSiteMenuItemRequest;
use App\Http\Requests\UpdateSiteMenuItemRequest;
use App\Models\SiteMenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SiteMenuItemController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/site-menu/index', [
            'items' => SiteMenuItem::query()
                ->orderBy('sort_order')
                ->orderBy('label')
                ->get(['id', 'label', 'href', 'sort_order', 'status', 'owner', 'reviewed_at']),
            'canCreate' => Gate::allows('create', SiteMenuItem::class),
            'canPublish' => $this->user()?->hasPermission('publish_site_menu') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', SiteMenuItem::class);

        return Inertia::render('cms/site-menu/edit', [
            'item' => null,
            'canPublish' => $this->user()?->hasPermission('publish_site_menu') ?? false,
        ]);
    }

    public function store(StoreSiteMenuItemRequest $request): RedirectResponse
    {
        $item = SiteMenuItem::query()->create([
            'label' => $request->string('label')->toString(),
            'href' => $request->string('href')->toString(),
            'sort_order' => $request->integer('sort_order') ?: 0,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.site-menu.edit', ['item' => $item->id]);
    }

    public function edit(SiteMenuItem $item): Response
    {
        return Inertia::render('cms/site-menu/edit', [
            'item' => $this->itemAttributes($item),
            'canPublish' => $this->user()?->hasPermission('publish_site_menu') ?? false,
        ]);
    }

    public function update(UpdateSiteMenuItemRequest $request, SiteMenuItem $item): RedirectResponse
    {
        $item->update([
            'label' => $request->string('label')->toString(),
            'href' => $request->string('href')->toString(),
            'sort_order' => $request->integer('sort_order') ?: 0,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $item->status),
        ]);

        return to_route('cms.site-menu.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function itemAttributes(SiteMenuItem $item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'href' => $item->href,
            'sort_order' => $item->sort_order,
            'owner' => $item->owner,
            'reviewed_at' => $item->reviewed_at?->format('Y-m-d'),
            'status' => $item->status,
        ];
    }

    private function user()
    {
        return request()->user();
    }
}
