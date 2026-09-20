<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Placeholder, clearly-non-authoritative sample news content. No invented
     * statistics, clinician names, fees, or live availability (see PROJECT_PLAN.md).
     *
     * @return array<int, array<string, string|null>>
     */
    private const CATEGORIES = [
        [
            'name' => 'Public Notice',
            'slug' => 'public-notices',
            'description' => 'Operating, access and service notices for patients, visitors and referrers.',
        ],
        [
            'name' => 'Press Release',
            'slug' => 'press-releases',
            'description' => 'Institutional announcements issued by FMCA Communications.',
        ],
        [
            'name' => 'Health Advisory',
            'slug' => 'health-advisories',
            'description' => 'Public health advisories issued for patient and community awareness.',
        ],
    ];

    /**
     * @return array<int, array<string, string|null>>
     */
    private const POSTS = [
        [
            'title' => 'Visiting hours and campus access guidance',
            'slug' => 'visiting-hours-campus-access-guidance',
            'summary' => 'Guidance on visiting hours, entry points and directions to the FMCA campus.',
            'body' => 'Patients and visitors should plan visits using the published visiting hours shown on the Campus access section of this site. Entry points, parking and accessibility arrangements are confirmed by the FMCA campus office before each visit; details are reviewed and updated by the communications team before publication.',
            'category_slug' => 'public-notices',
            'publish_date' => '2026-09-14',
        ],
        [
            'title' => 'Outpatient appointment requests: what to expect',
            'slug' => 'outpatient-appointment-requests-what-to-expect',
            'summary' => 'How to submit an appointment request and the follow-up process by the clinical desk.',
            'body' => "Outpatient appointment requests are submitted through the online request form and are followed up by the relevant clinical desk. Submission of a request does not confirm an appointment; the clinical desk reviews each request and advises on the next steps. Requests are treated as sensitive personal data and are handled under the centre's privacy commitments.",
            'category_slug' => 'public-notices',
            'publish_date' => '2026-09-10',
        ],
        [
            'title' => 'FMCA Communications office update',
            'slug' => 'fmca-communications-office-update',
            'summary' => 'A placeholder institutional announcement maintained by the communications team.',
            'body' => 'This is a placeholder institutional announcement. Press releases published here are issued by FMCA Communications after review; details of any announcement are confirmed by the relevant content owner before publication.',
            'category_slug' => 'press-releases',
            'publish_date' => '2026-09-06',
        ],
        [
            'title' => 'General health advisory: seek early care',
            'slug' => 'general-health-advisory-seek-early-care',
            'summary' => 'A general advisory encouraging patients to present early with urgent symptoms.',
            'body' => "Patients with urgent symptoms should present to the Emergency Medicine department, where triage follows the hospital's operational priority protocol. This advisory carries no clinical advice; any decision about care is made by the treating clinician. The full advisory text is reviewed and approved by the clinical content approver before publication.",
            'category_slug' => 'health-advisories',
            'publish_date' => '2026-09-02',
        ],
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $data) {
            Category::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                ],
            );
        }

        foreach (self::POSTS as $data) {
            $category = $data['category_slug'] !== null
                ? Category::where('slug', $data['category_slug'])->first()
                : null;

            Post::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'summary' => $data['summary'],
                    'body' => $data['body'],
                    'category_id' => $category?->id,
                    'author' => 'FMCA Communications',
                    'publish_date' => $data['publish_date'],
                    'owner' => 'FMCA Communications',
                    'reviewed_at' => now(),
                    'status' => 'published',
                ],
            );
        }
    }
}
