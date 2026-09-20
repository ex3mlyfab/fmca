<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/news/index', [
            'posts' => Post::query()
                ->with('category:id,name')
                ->orderByDesc('publish_date')
                ->orderByDesc('created_at')
                ->get(['id', 'title', 'slug', 'summary', 'status', 'category_id']),
            'canCreate' => Gate::allows('create', Post::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Post::class);

        return Inertia::render('cms/news/edit', [
            'post' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $post = Post::query()->create($request->validated());

        return to_route('cms.news.edit', ['post' => $post->id]);
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('cms/news/edit', [
            'post' => $post,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $post->update($request->validated());

        return to_route('cms.news.index');
    }

    private function categoryOptions()
    {
        return Category::query()->orderBy('name')->get(['id', 'name', 'slug']);
    }
}
