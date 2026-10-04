<?php

namespace App\Http\Controllers;

use App\Models\InstituteProfile;
use App\Models\SeoMetadata;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * The public about page: institute history, contact details and campus
     * directions, all edited from the CMS about workspace.
     */
    public function index(): Response
    {
        $profile = InstituteProfile::query()->published()->first();
        $name = $profile->institution_name ?? 'Federal Medical Centre, Abuja';

        // The profile itself travels as the shared `instituteProfile` layout prop,
        // so the page resolves it with useSiteInfo() like every other public page.
        return Inertia::render('about', [
            'seo' => SeoMetadata::forView('about', null, [
                'title' => "About {$name}",
                'description' => 'Institute history, contact details and campus directions for the Federal Medical Centre, Abuja.',
                'canonical' => url('about'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => SeoMetadata::breadcrumbs([
                    ['name' => 'Home', 'url' => url('/')],
                    ['name' => 'About', 'url' => url('about')],
                ]),
            ]),
        ]);
    }
}
