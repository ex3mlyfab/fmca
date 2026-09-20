<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use App\Models\SeoMetadata;
use Inertia\Inertia;
use Inertia\Response;

class ConsultantsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('consultants', [
            'consultants' => Consultant::published()
                ->orderBy('name')
                ->get()
                ->map(fn (Consultant $consultant): array => [
                    'id' => $consultant->id,
                    'name' => $consultant->name,
                    'slug' => $consultant->slug,
                    'specialty' => $consultant->specialty,
                    'position' => $consultant->position,
                    'department' => $consultant->department?->name,
                ]),
            'seo' => SeoMetadata::forView('consultants', null, [
                'title' => 'Consultants | Federal Medical Centre, Abuja',
                'description' => 'Approved consultant profiles at the Federal Medical Centre, Abuja.',
                'canonical' => url('consultants'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $consultant = Consultant::published()
            ->where('slug', $slug)
            ->with('department')
            ->firstOrFail();

        return Inertia::render('consultant', [
            'consultant' => [
                'id' => $consultant->id,
                'name' => $consultant->name,
                'slug' => $consultant->slug,
                'specialty' => $consultant->specialty,
                'position' => $consultant->position,
                'biography' => $consultant->biography,
                'portrait' => $consultant->portrait,
                'specialtyTags' => $consultant->specialty_tags ?? [],
                'department' => $consultant->department === null ? null : [
                    'name' => $consultant->department->name,
                    'slug' => $consultant->department->slug,
                ],
                'owner' => $consultant->owner,
                'reviewedAt' => $consultant->reviewed_at?->format('j M Y'),
            ],
            'seo' => SeoMetadata::forView('consultant', $consultant->id, [
                'title' => $consultant->name.' | Federal Medical Centre, Abuja',
                'description' => $consultant->specialty.' consulting at the Federal Medical Centre, Abuja.',
                'canonical' => url('consultants/'.$consultant->slug),
                'og_image' => $consultant->portrait,
                'robots' => 'index,follow',
                'json_ld' => SeoMetadata::breadcrumbs([
                    ['name' => 'Home', 'url' => url('/')],
                    ['name' => 'Consultants', 'url' => url('consultants')],
                    ['name' => $consultant->name, 'url' => url('consultants/'.$consultant->slug)],
                ]),
            ]),
        ]);
    }
}
