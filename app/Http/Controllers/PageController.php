<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageTemplate;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * List the published patient guides at /patients.
     */
    public function index(): Response
    {
        $template = PageTemplate::query()->where('key', 'patient_guide')->firstOrFail();

        $guides = Page::query()
            ->published()
            ->where('template_id', $template->id)
            ->orderBy('title')
            ->get()
            ->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'summary' => $page->summary,
                'owner' => $page->owner,
                'reviewed_at' => $page->reviewed_at?->format('j M Y'),
            ])
            ->all();

        return Inertia::render('patient-guides', ['guides' => $guides]);
    }

    /**
     * Render a published page of the given template at its public slug.
     */
    public function show(string $slug, string $templateKey): Response
    {
        $template = PageTemplate::query()->where('key', $templateKey)->firstOrFail();

        $page = Page::query()
            ->published()
            ->where('slug', $slug)
            ->where('template_id', $template->id)
            ->with(['template', 'blocks'])
            ->firstOrFail();

        return Inertia::render('page', [
            'page' => [
                'slug' => $page->slug,
                'title' => $page->title,
                'summary' => $page->summary,
                'owner' => $page->owner,
                'reviewed_at' => $page->reviewed_at?->format('j M Y'),
                'template' => [
                    'key' => $template->key,
                    'name' => $template->name,
                    'url_prefix' => $template->url_prefix,
                ],
                'blocks' => $page->blocks->map(fn ($block): array => [
                    'block_key' => $block->block_key,
                    'content' => $block->content,
                    'sort_order' => $block->sort_order,
                ])->all(),
            ],
        ]);
    }
}
