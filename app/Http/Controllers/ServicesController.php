<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Inertia\Inertia;
use Inertia\Response;

class ServicesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('services', [
            'services' => Service::published()
                ->with('department:id,name,slug')
                ->orderBy('name')
                ->get()
                ->map(fn (Service $service): array => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'summary' => $service->summary,
                    'department' => $service->department?->name,
                ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $service = Service::published()
            ->where('slug', $slug)
            ->with('department:id,name,slug')
            ->firstOrFail();

        $related = $service->department
            ? $service->department->services()
                ->published()
                ->where('id', '!=', $service->id)
                ->orderBy('name')
                ->get()
                ->map(fn (Service $s): array => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'slug' => $s->slug,
                    'summary' => $s->summary,
                ])
            : collect();

        return Inertia::render('service', [
            'service' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'summary' => $service->summary,
                'description' => $service->description,
                'referralGuidance' => $service->referral_guidance,
                'eligibility' => $service->eligibility,
                'owner' => $service->owner,
                'reviewedAt' => $service->reviewed_at?->format('j M Y'),
                'department' => $service->department ? [
                    'name' => $service->department->name,
                    'slug' => $service->department->slug,
                ] : null,
            ],
            'related' => $related,
        ]);
    }
}
