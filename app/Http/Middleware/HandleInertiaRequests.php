<?php

namespace App\Http\Middleware;

use App\Models\BrandAsset;
use App\Models\InstituteProfile;
use App\Models\SiteMenuItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // The public header navigation. Only approved, published items are
            // surfaced; editors reorder, add and remove entries from the CMS.
            'siteMenu' => SiteMenuItem::query()
                ->published()
                ->orderBy('sort_order')
                ->orderBy('label')
                ->get(['label', 'href', 'sort_order']),
            // Published brand marks for the public site. A slot with no
            // published asset stays null so the built-in emblem and the static
            // public/ icon files take over.
            'brandIdentity' => BrandAsset::publishedIdentity(),
            // Published institute profile: the about page, contact details and
            // campus location. Null until something is published, so the site
            // keeps its built-in contact constants in the meantime.
            'instituteProfile' => InstituteProfile::publishedSiteInfo(),
        ];
    }
}
