<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Requests\UpdateCampaignRequest;
use App\Models\Campaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/campaigns/index', [
            'campaigns' => Campaign::query()
                ->orderBy('sort_order')
                ->orderByDesc('created_at')
                ->get(['id', 'title', 'eyebrow', 'owner', 'status', 'advisory', 'start_date', 'end_date', 'sort_order']),
            'canCreate' => Gate::allows('create', Campaign::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Campaign::class);

        return Inertia::render('cms/campaigns/edit', [
            'campaign' => null,
        ]);
    }

    public function store(StoreCampaignRequest $request): RedirectResponse
    {
        $campaign = Campaign::query()->create($request->validated());

        return to_route('cms.campaigns.edit', ['campaign' => $campaign->id]);
    }

    public function edit(Campaign $campaign): Response
    {
        return Inertia::render('cms/campaigns/edit', [
            'campaign' => $campaign,
        ]);
    }

    public function update(UpdateCampaignRequest $request, Campaign $campaign): RedirectResponse
    {
        $campaign->update($request->validated());

        return to_route('cms.campaigns.index');
    }
}
