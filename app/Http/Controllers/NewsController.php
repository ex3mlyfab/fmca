<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Post;
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
        ]);
    }
}
