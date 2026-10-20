<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\HomeConfiguration;
use App\Models\Partner;
use App\Models\Post;
use App\Models\SeoMetadata;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $configuration = HomeConfiguration::query()->published()->latest('published_at')->first();

        return Inertia::render('home', [
            'configuration' => $configuration?->sections ?? [],            'campaigns' => Campaign::query()
                ->active()
                ->get()
                ->map(fn (Campaign $campaign): array => [
                    'id' => $campaign->id,
                    'title' => $campaign->title,
                    'eyebrow' => $campaign->eyebrow,
                    'copy' => $campaign->copy,
                    'image' => $campaign->desktop_media ?: $campaign->mobile_media,
                    'mobileImage' => $campaign->mobile_media ?: $campaign->desktop_media,
                    'imageAlt' => $campaign->media_alt,
                    'focalPoint' => $campaign->focal_point,
                    'videoPoster' => $campaign->video_poster,
                    'primaryCtaLabel' => $campaign->primary_cta_label,
                    'primaryCtaHref' => $campaign->primary_cta_href,
                    'secondaryCtaLabel' => $campaign->secondary_cta_label,
                    'secondaryCtaHref' => $campaign->secondary_cta_href,
                    'owner' => $campaign->owner,
                    'advisory' => $campaign->advisory,
                    'overlayIntensity' => $campaign->overlay_intensity,
                    'startDate' => $campaign->start_date?->toDateString(),
                    'endDate' => $campaign->end_date?->toDateString(),
                ]),
            'news' => Post::published()
                ->with('category:id,name,slug')
                ->orderByDesc('publish_date')
                ->orderByDesc('created_at')
                ->limit(3)
                ->get()
                ->map(fn (Post $post): array => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'summary' => $post->summary,
                    'featureImage' => $post->feature_image,
                    'featureImageAlt' => $post->feature_image_alt,
                    'publishDate' => $post->publish_date?->format('j M Y'),
                    'category' => $post->category ? [
                        'name' => $post->category->name,
                        'slug' => $post->category->slug,
                    ] : null,
                ])->values(),
            'partners' => Partner::query()
                ->published()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->limit(8)
                ->get()
                ->map(fn (Partner $partner): array => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'logo' => $partner->logo,
                    'websiteUrl' => $partner->website_url,
                ])->values(),
            'seo' => SeoMetadata::forView('home', null, [
                'title' => 'Federal Medical Centre, Abuja',
                'description' => 'Official website of the Federal Medical Centre, Abuja — clinical services, departments, news, and patient information.',
                'canonical' => url('/'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ]),
        ]);
    }
}
