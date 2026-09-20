<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        $pages = Page::query()
            ->with('template:id,key,name,url_prefix,routable')
            ->orderByDesc('created_at')
            ->get(['id', 'title', 'slug', 'status', 'owner', 'reviewed_at', 'template_id']);

        return Inertia::render('cms/pages/index', [
            'pages' => $pages->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'owner' => $page->owner,
                'reviewed_at' => $page->reviewed_at?->format('j M Y'),
                'template' => [
                    'key' => $page->template?->key,
                    'name' => $page->template?->name,
                    'url_prefix' => $page->template?->url_prefix,
                    'routable' => $page->template?->routable,
                ],
                'public_url' => $this->publicUrl($page),
            ])->all(),
            'canCreate' => Gate::allows('create', Page::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Page::class);

        return Inertia::render('cms/pages/create', [
            'templates' => $this->templateOptions(),
            'blockCatalog' => PageBlock::entries(PageBlock::keys()),
        ]);
    }

    public function store(StorePageRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $blocks = $data['blocks'] ?? [];

        unset($data['blocks']);

        $page = Page::query()->create($data);

        $this->storeBlocks($page, $blocks);

        return to_route('cms.pages.edit', ['page' => $page->id]);
    }

    public function edit(Page $page): Response
    {
        $page->loadMissing(['template', 'blocks']);

        return Inertia::render('cms/pages/edit', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'summary' => $page->summary,
                'owner' => $page->owner,
                'status' => $page->status,
                'reviewed_at' => $page->reviewed_at?->toDateTimeString(),
                'template_id' => $page->template_id,
                'template_key' => $page->template?->key,
                'blocks' => $page->blocks->map(fn (PageBlock $block): array => [
                    'block_key' => $block->block_key,
                    'content' => $block->content,
                    'sort_order' => $block->sort_order,
                ])->all(),
            ],
            'templates' => $this->templateOptions(),
            'blockCatalog' => PageBlock::entries(PageBlock::keys()),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();
        $blocks = $data['blocks'] ?? [];

        unset($data['blocks']);

        $page->update($data);

        $page->blocks()->delete();
        $this->storeBlocks($page, $blocks);

        return to_route('cms.pages.index');
    }

    /**
     * The new-page editor, reached from the template picker screen with a
     * preselected template key via the `?template={key}` query string.
     */
    public function start(Request $request): Response
    {
        Gate::authorize('create', Page::class);

        return Inertia::render('cms/pages/edit', [
            'page' => null,
            'templates' => $this->templateOptions(),
            'blockCatalog' => PageBlock::entries(PageBlock::keys()),
            'templateKey' => $request->query('template'),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function templateOptions(): array
    {
        return PageTemplate::query()
            ->orderBy('name')
            ->get(['id', 'key', 'name', 'purpose', 'url_prefix', 'routable', 'requires_owner', 'requires_summary', 'required_fields', 'permitted_blocks', 'default_owner'])
            ->map(fn (PageTemplate $template): array => $template->only([
                'id', 'key', 'name', 'purpose', 'url_prefix', 'routable',
                'requires_owner', 'requires_summary', 'required_fields',
                'permitted_blocks', 'default_owner',
            ]))
            ->all();
    }

    private function publicUrl(Page $page): ?string
    {
        $template = $page->template;

        if (! $template?->routable || $template->url_prefix === null || $page->status !== 'published') {
            return null;
        }

        return '/'.$template->url_prefix.'/'.$page->slug;
    }

    /**
     * @param  array<int, array<string, mixed>>  $blocks
     */
    private function storeBlocks(Page $page, array $blocks): void
    {
        foreach ($blocks as $index => $block) {
            $page->blocks()->create([
                'block_key' => $block['block_key'],
                'content' => json_decode($block['content'], true),
                'sort_order' => $index,
            ]);
        }
    }
}
