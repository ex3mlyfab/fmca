<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHomeConfigurationRequest;
use App\Models\HomeConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('cms/homepage', [
            'configuration' => HomeConfiguration::query()->latest()->first(),
            'sections' => [
                'Global Header', 'Emergency & Status', 'Homepage Campaigns',
                'Quick Services', 'Institutional Metrics', 'Insurance Guidance',
                'Centres of Excellence', 'Institutional Strength', 'Campus Access',
                'Global Footer',
            ],
        ]);
    }

    public function submitForReview(HomeConfiguration $homeConfiguration): RedirectResponse
    {
        Gate::authorize('update', $homeConfiguration);
        abort_unless(in_array($homeConfiguration->status, ['draft', 'changes_requested'], true), 422);
        $homeConfiguration->update(['status' => 'in_review']);

        return to_route('cms.homepage.edit');
    }

    public function store(StoreHomeConfigurationRequest $request): RedirectResponse
    {
        $configuration = HomeConfiguration::query()->latest()->first();

        if ($configuration !== null) {
            Gate::authorize('update', $configuration);
        } else {
            Gate::authorize('create', HomeConfiguration::class);
        }

        HomeConfiguration::query()->updateOrCreate(
            ['id' => $configuration?->id],
            [
                'status' => 'draft',
                'sections' => [
                    'hero' => [
                        'title' => $request->string('hero_title')->toString(),
                        'summary' => $request->string('hero_summary')->toString(),
                    ],
                ],
                'created_by' => $configuration?->created_by ?? $request->user()->id,
                'approved_by' => null,
                'reviewed_at' => null,
                'publish_at' => null,
                'published_at' => null,
            ],
        );

        return to_route('cms.homepage.edit');
    }
}
