<?php

namespace App\Http\Controllers;

use App\Models\CommitteeMember;
use App\Models\SeoMetadata;
use Inertia\Inertia;
use Inertia\Response;

class CommitteesController extends Controller
{
    public function index(): Response
    {
        $members = CommitteeMember::published()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (CommitteeMember $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'slug' => $member->slug,
                'role' => $member->role,
                'portfolio' => $member->portfolio,
                'mandate' => $member->mandate,
                'term' => $member->term,
                'portrait' => $member->portrait,
                'owner' => $member->owner,
                'reviewedAt' => $member->reviewed_at?->format('j M Y'),
            ]);

        $latestReviewedAt = CommitteeMember::published()
            ->whereNotNull('reviewed_at')
            ->orderByDesc('reviewed_at')
            ->value('reviewed_at')?->format('j M Y');

        return Inertia::render('committee', [
            'members' => $members,
            'latestReviewedAt' => $latestReviewedAt,
            'seo' => SeoMetadata::forView('committees', null, [
                'title' => 'Top Management Committee | Federal Medical Centre, Abuja',
                'description' => 'The members of the Top Management Committee of the Federal Medical Centre, Abuja.',
                'canonical' => url('about/leadership'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => SeoMetadata::breadcrumbs([
                    ['name' => 'Home', 'url' => url('/')],
                    ['name' => 'Top Management Committee', 'url' => url('about/leadership')],
                ]),
            ]),
        ]);
    }
}
