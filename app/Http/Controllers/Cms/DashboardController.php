<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\AppointmentRequest;
use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Clinic;
use App\Models\Consultant;
use App\Models\ContactSubmission;
use App\Models\Department;
use App\Models\Document;
use App\Models\HomeConfiguration;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Statuses that count as "waiting for clinical review" per content type.
     *
     * @var array<string, array<int, string>>
     */
    private const array REVIEW_STATUSES = [
        'homepage' => ['in_review', 'changes_requested'],
        'campaigns' => ['review'],
        'news' => ['review'],
        'clinics' => ['review'],
        'pages' => ['review'],
    ];

    /**
     * Every patient-facing content type managed in the studio.
     *
     * @var array<int, array{type: string, label: string, slug: string, model: class-string<Model>}>
     */
    private const array CONTENT_TYPES = [
        ['type' => 'departments', 'label' => 'Departments', 'slug' => '/departments', 'model' => Department::class],
        ['type' => 'services', 'label' => 'Services', 'slug' => '/services', 'model' => Service::class],
        ['type' => 'clinics', 'label' => 'Clinics', 'slug' => '/clinics', 'model' => Clinic::class],
        ['type' => 'consultants', 'label' => 'Consultants', 'slug' => '/consultants', 'model' => Consultant::class],
        ['type' => 'news', 'label' => 'News & notices', 'slug' => '/news', 'model' => Post::class],
        ['type' => 'campaigns', 'label' => 'Campaigns', 'slug' => '/campaigns', 'model' => Campaign::class],
        ['type' => 'pages', 'label' => 'Pages', 'slug' => '/patients', 'model' => Page::class],
        ['type' => 'documents', 'label' => 'Publications', 'slug' => '/publications', 'model' => Document::class],
        ['type' => 'homepage', 'label' => 'Homepage', 'slug' => '/', 'model' => HomeConfiguration::class],
    ];

    /**
     * Overview of the content studio: what is live, what waits for clinical
     * review, what patients have asked for, and the latest governance events.
     */
    public function index(): Response
    {
        $content = $this->contentRows();

        return Inertia::render('dashboard', [
            'userName' => request()->user()?->name,
            'content' => $content->values(),
            'publishedTotal' => $content->sum('published'),
            'reviewTotal' => $content->sum('review'),
            'mediaAssets' => Media::query()->count(),
            'activeCampaigns' => Campaign::query()->active()->count(),
            'pendingReview' => $this->pendingReviewQueue(),
            'appointmentRequests' => $this->openPatientRequests(AppointmentRequest::class),
            'contactSubmissions' => $this->openPatientRequests(ContactSubmission::class),
            'activity' => $this->activity(),
        ]);
    }

    /**
     * Per-content-type totals split into live, in-review, and not-yet-live rows.
     *
     * @return Collection<string, array{type: string, label: string, slug: string, total: int, published: int, review: int, pending: int}>
     */
    private function contentRows(): Collection
    {
        return collect(self::CONTENT_TYPES)->mapWithKeys(function (array $definition): array {
            $counts = $definition['model']::query()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status')
                ->all();

            $reviewStatuses = self::REVIEW_STATUSES[$definition['type']] ?? [];
            $published = (int) ($counts['published'] ?? 0);
            $review = (int) array_sum(array_intersect_key($counts, array_flip($reviewStatuses)));

            return [$definition['type'] => [
                'type' => $definition['type'],
                'label' => $definition['label'],
                'slug' => $definition['slug'],
                'total' => array_sum($counts),
                'published' => $published,
                'review' => $review,
                'pending' => array_sum($counts) - $published - $review,
            ]];
        });
    }

    /**
     * Everything currently waiting for clinical review, newest first.
     *
     * @return Collection<int, array{type: string, id: int, title: string, status: string, submittedAt: string|null}>
     */
    private function pendingReviewQueue(): Collection
    {
        $items = collect([
            HomeConfiguration::query()->whereIn('status', self::REVIEW_STATUSES['homepage'])->get(['id', 'status', 'created_at'])
                ->map(fn (HomeConfiguration $home) => [
                    'type' => 'homepage',
                    'id' => $home->id,
                    'title' => 'Homepage',
                    'status' => $home->status,
                    'submittedAt' => $home->created_at?->toIso8601String(),
                ]),
            Campaign::query()->where('status', 'review')->get(['id', 'title', 'status', 'created_at'])
                ->map(fn (Campaign $campaign) => [
                    'type' => 'campaigns',
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'status' => $campaign->status,
                    'submittedAt' => $campaign->created_at?->toIso8601String(),
                ]),
            Post::query()->where('status', 'review')->get(['id', 'title', 'status', 'created_at'])
                ->map(fn (Post $post) => [
                    'type' => 'news',
                    'id' => $post->id,
                    'title' => $post->title,
                    'status' => $post->status,
                    'submittedAt' => $post->created_at?->toIso8601String(),
                ]),
            Clinic::query()->where('status', 'review')->get(['id', 'name', 'status', 'created_at'])
                ->map(fn (Clinic $clinic) => [
                    'type' => 'clinics',
                    'id' => $clinic->id,
                    'title' => $clinic->name,
                    'status' => $clinic->status,
                    'submittedAt' => $clinic->created_at?->toIso8601String(),
                ]),
            Page::query()->where('status', 'review')->get(['id', 'title', 'status', 'created_at'])
                ->map(fn (Page $page) => [
                    'type' => 'pages',
                    'id' => $page->id,
                    'title' => $page->title,
                    'status' => $page->status,
                    'submittedAt' => $page->created_at?->toIso8601String(),
                ]),
        ])->flatten(1);

        return $items->sortByDesc('submittedAt')->values();
    }

    /**
     * Requests patients have submitted that staff have not yet answered.
     *
     * @param  class-string<Model>  $model
     * @return array{newCount: int, items: array<int, array{type: string, id: int, title: string, detail: string|null, createdAt: string|null}>}
     */
    private function openPatientRequests(string $model): array
    {
        $open = 'new';

        /** @var Collection<Model> $requests */
        $requests = $model::query()->where('status', $open)->latest()->take(6)->get();

        return [
            'newCount' => $model::query()->where('status', $open)->count(),
            'items' => $requests->map(function (Model $request): array {
                if ($request instanceof AppointmentRequest) {
                    return [
                        'type' => 'appointment',
                        'id' => $request->id,
                        'title' => $request->full_name,
                        'detail' => implode(' · ', array_filter([
                            $request->department?->name,
                            $request->preferred_date?->format('j M Y'),
                        ])),
                        'createdAt' => $request->created_at?->toIso8601String(),
                    ];
                }

                return [
                    'type' => 'message',
                    'id' => $request->id,
                    'title' => $request->subject,
                    'detail' => $request->full_name,
                    'createdAt' => $request->created_at?->toIso8601String(),
                ];
            })->values()->all(),
        ];
    }

    /**
     * The most recent governance events, for the overview feed.
     *
     * @return array<int, array{id: int, action: string, contentType: string|null, actorName: string, summary: string|null, createdAt: string|null}>
     */
    private function activity(): array
    {
        return AuditLog::recent(8)
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'contentType' => $log->content_type,
                'actorName' => $log->actor?->name ?? 'System',
                'summary' => $log->summary,
                'createdAt' => $log->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }
}
