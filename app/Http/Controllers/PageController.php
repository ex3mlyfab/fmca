<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageTemplate;
use App\Models\SeoMetadata;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * List the published patient guides at /patients.
     */
    public function patientGuides(): Response
    {
        return Inertia::render('patient-guides', [
            'guides' => $this->statementsFor('patient_guide'),
            'seo' => SeoMetadata::forView('patient_guides', null, [
                'title' => 'Patient Guides | Federal Medical Centre, Abuja',
                'description' => 'Patient guides and informational statements from the Federal Medical Centre, Abuja.',
                'canonical' => url('patients'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ]),
        ]);
    }

    /**
     * List the published legal statements at /legal.
     */
    public function legalStatements(): Response
    {
        return Inertia::render('legal', [
            'statements' => $this->statementsFor('legal'),
            'seo' => SeoMetadata::forView('legal_statements', null, [
                'title' => 'Legal & Policies | Federal Medical Centre, Abuja',
                'description' => 'Legal statements and policies of the Federal Medical Centre, Abuja.',
                'canonical' => url('legal'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ]),
        ]);
    }

    /**
     * Published pages of a template, ordered by title, mapped to plain arrays.
     *
     * @return array<int, array<string, mixed>>
     */
    private function statementsFor(string $templateKey): array
    {
        $template = PageTemplate::query()->where('key', $templateKey)->firstOrFail();

        return Page::query()
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
            'seo' => SeoMetadata::forView('page', $page->id, [
                'title' => $page->title.' | Federal Medical Centre, Abuja',
                'description' => $page->summary,
                'canonical' => url($template->url_prefix.'/'.$page->slug),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => SeoMetadata::breadcrumbs([
                    ['name' => 'Home', 'url' => url('/')],
                    ['name' => $template->name, 'url' => url($template->url_prefix)],
                    ['name' => $page->title, 'url' => url($template->url_prefix.'/'.$page->slug)],
                ]),
            ]),
        ]);
    }
}
