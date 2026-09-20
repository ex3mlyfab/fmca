<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
use App\Models\SeoMetadata;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    public function index(Request $request): Response
    {
        $categorySlug = $request->query('category');

        $query = Post::published()
            ->with('category:id,name,slug')
            ->orderByDesc('publish_date')
            ->orderByDesc('created_at');

        if ($categorySlug !== null) {
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $categorySlug));
        }

        return Inertia::render('news', [
            'posts' => $query->get()->map(fn (Post $post): array => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'summary' => $post->summary,
                'author' => $post->author,
                'publishDate' => $post->publish_date?->format('j M Y'),
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
            ])->values(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name', 'slug'])->values(),
            'activeCategory' => $categorySlug,
            'seo' => SeoMetadata::forView('news', null, [
                'title' => 'News & Updates | Federal Medical Centre, Abuja',
                'description' => 'News, public notices, and health advisories from the Federal Medical Centre, Abuja.',
                'canonical' => url('news'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = Post::published()
            ->where('slug', $slug)
            ->with('category:id,name,slug')
            ->firstOrFail();

        $related = Post::published()
            ->where('id', '!=', $post->id)
            ->orderByDesc('publish_date')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn (Post $item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'summary' => $item->summary,
                'publishDate' => $item->publish_date?->format('j M Y'),
            ]);

        return Inertia::render('article', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'summary' => $post->summary,
                'body' => $post->body,
                'author' => $post->author,
                'publishDate' => $post->publish_date?->format('j M Y'),
                'owner' => $post->owner,
                'reviewedAt' => $post->reviewed_at?->format('j M Y'),
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'slug' => $post->category->slug,
                ] : null,
            ],
            'related' => $related,
            'seo' => SeoMetadata::forView('post', $post->id, [
                'title' => $post->title.' | Federal Medical Centre, Abuja',
                'description' => $post->summary,
                'canonical' => url('news/'.$post->slug),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => [
                    SeoMetadata::breadcrumbs([
                        ['name' => 'Home', 'url' => url('/')],
                        ['name' => 'News', 'url' => url('news')],
                        ['name' => $post->title, 'url' => url('news/'.$post->slug)],
                    ]),
                    [
                        '@context' => 'https://schema.org',
                        '@type' => 'Article',
                        'headline' => $post->title,
                        'description' => $post->summary,
                        'author' => ['@type' => 'Person', 'name' => $post->author],
                        'datePublished' => $post->publish_date?->toDateString(),
                        'dateModified' => $post->updated_at?->toDateString(),
                        'publisher' => ['@type' => 'Organization', 'name' => 'Federal Medical Centre, Abuja'],
                        'mainEntityOfPage' => url('news/'.$post->slug),
                    ],
                ],
            ]),
        ]);
    }
}
