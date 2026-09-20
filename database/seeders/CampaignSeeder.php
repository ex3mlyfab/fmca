<?php

namespace Database\Seeders;

use App\Models\Campaign;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    /**
     * Placeholder, clearly-non-authoritative sample campaigns replacing the
     * hard-coded carousel slides. No invented statistics, clinician names, fees,
     * or live availability (see PROJECT_PLAN.md). Media fields stay empty until
     * the media library (a later release) exists; slides render on the
     * institutional background.
     *
     * @return array<int, array<string, string|int|bool|null>>
     */
    private const CAMPAIGNS = [
        [
            'title' => 'Care information you can trust',
            'eyebrow' => 'Tertiary Health Institution',
            'copy' => 'Clear, compassionate guidance for patients, families and referring clinical teams across the Federal Capital Territory.',
            'primary_cta_label' => 'Find patient services',
            'primary_cta_href' => '#services',
            'secondary_cta_label' => 'About FMCA',
            'secondary_cta_href' => '#about',
            'sort_order' => 0,
        ],
        [
            'title' => 'A centre for healing and medical learning',
            'eyebrow' => 'Clinical Excellence and Training',
            'copy' => 'Consultant-led clinical specialties, medical residency and verified diagnostic facilities dedicated to patient outcomes. Every detail on this site is confirmed by the relevant content owner before publication.',
            'primary_cta_label' => 'Explore clinical care',
            'primary_cta_href' => '#services',
            'secondary_cta_label' => 'Visiting hours',
            'secondary_cta_href' => '#visiting',
            'sort_order' => 1,
        ],
    ];

    public function run(): void
    {
        foreach (self::CAMPAIGNS as $data) {
            Campaign::updateOrCreate(
                ['title' => $data['title']],
                [
                    'eyebrow' => $data['eyebrow'],
                    'copy' => $data['copy'],
                    'primary_cta_label' => $data['primary_cta_label'],
                    'primary_cta_href' => $data['primary_cta_href'],
                    'secondary_cta_label' => $data['secondary_cta_label'],
                    'secondary_cta_href' => $data['secondary_cta_href'],
                    'owner' => 'FMCA Communications',
                    'advisory' => false,
                    'start_date' => null,
                    'end_date' => null,
                    'sort_order' => $data['sort_order'],
                    'reviewed_at' => now(),
                    'status' => 'published',
                ],
            );
        }
    }
}
