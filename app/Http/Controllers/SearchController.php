<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    private const LIMIT = 10;

    /**
     * Search published content across services, departments, news and pages.
     */
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $needle = $query === '' ? '' : '%'.str_replace(['%', '_'], ['\\%', '\\_'], $query).'%';

        $results = [
            'services' => $this->search(
                Service::published()->orderBy('name')->limit(self::LIMIT),
                ['name', 'summary'],
                $needle,
                fn (Service $service): array => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'summary' => $service->summary,
                ],
            ),
            'departments' => $this->search(
                Department::published()->orderBy('name')->limit(self::LIMIT),
                ['name', 'summary'],
                $needle,
                fn (Department $department): array => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'slug' => $department->slug,
                    'summary' => $department->summary,
                ],
            ),
            'news' => $this->search(
                Post::published()->orderBy('title')->limit(self::LIMIT),
                ['title', 'summary'],
                $needle,
                fn (Post $post): array => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'summary' => $post->summary,
                ],
            ),
            'pages' => $this->search(
                Page::published()
                    ->whereHas('template', fn ($query) => $query->where('routable', true)->whereNotNull('url_prefix'))
                    ->with('template:id,key,name,url_prefix')
                    ->orderBy('title')
                    ->limit(self::LIMIT),
                ['title', 'summary'],
                $needle,
                fn (Page $page): array => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'summary' => $page->summary,
                    'template' => [
                        'name' => $page->template->name,
                        'url_prefix' => $page->template->url_prefix,
                    ],
                ],
            ),
        ];

        return Inertia::render('search', [
            'query' => $query,
            'results' => $results,
            'total' => array_sum(array_map('count', $results)),
        ]);
    }

    /**
     * Run one LIKE search over the given columns; an empty needle yields no rows.
     *
     * @param  array<int, string>  $columns
     * @param  Closure(object): array<string, mixed>  $map
     * @return array<int, array<string, mixed>>
     */
    private function search(Builder $query, array $columns, string $needle, Closure $map): array
    {
        if ($needle === '') {
            return [];
        }

        $query->where(function (Builder $inner) use ($columns, $needle): void {
            foreach ($columns as $column) {
                $inner->orWhere($column, 'like', $needle);
            }
        });

        return $query->get()->map($map)->values()->all();
    }
}
