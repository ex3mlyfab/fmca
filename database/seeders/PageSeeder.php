<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageTemplate;
use Illuminate\Database\Seeder;

/**
 * Sample pages that demonstrate the page system. All prose is clearly
 * placeholder and makes no invented clinical, fee, or availability claims
 * (see PROJECT_PLAN.md). The institutional page ships published; the patient
 * guide and legal statement ship as drafts so they are invisible publicly
 * until their content owners approve them.
 */
class PageSeeder extends Seeder
{
    public function run(): void
    {
        $institutional = PageTemplate::query()->where('key', 'institutional')->first();
        $patientGuide = PageTemplate::query()->where('key', 'patient_guide')->first();
        $legal = PageTemplate::query()->where('key', 'legal')->first();

        if (! $institutional || ! $patientGuide || ! $legal) {
            return;
        }

        Page::updateOrCreate(['slug' => 'fmca-about'], [
            'template_id' => $institutional->id,
            'title' => 'About FMCA',
            'summary' => 'Institutional information and how the FMCA website is maintained.',
            'owner' => 'FMCA Communications',
            'status' => 'published',
            'reviewed_at' => now(),
        ]);

        $this->seedBlocks('fmca-about', [
            [
                'block_key' => 'rich_text',
                'content' => [
                    'heading' => 'About this website',
                    'body' => 'Federal Medical Centre, Abuja (FMCA) maintains this public website as a practical source of guidance for patients, families, staff and referring clinicians. Institutional, governance and leadership details are published here once verified by their content owners.',
                ],
                'sort_order' => 0,
            ],
            [
                'block_key' => 'cta',
                'content' => [
                    'label' => 'Find patient services',
                    'href' => '/services',
                ],
                'sort_order' => 1,
            ],
        ]);

        Page::updateOrCreate(['slug' => 'visiting-hours'], [
            'template_id' => $patientGuide->id,
            'title' => 'Visiting hours and visitor guidelines',
            'summary' => 'What to know before visiting a patient on the FMCA campus.',
            'owner' => 'FMCA Patient Services',
            'status' => 'draft',
            'reviewed_at' => now(),
        ]);

        $this->seedBlocks('visiting-hours', [
            [
                'block_key' => 'alert',
                'content' => [
                    'tone' => 'info',
                    'title' => 'Visiting hours vary by ward',
                    'body' => 'Visiting hours shown on the home page are indicative. Intensive care and high dependency units restrict visiting to immediate family. Confirm with the inpatient unit desk before you visit.',
                ],
                'sort_order' => 0,
            ],
            [
                'block_key' => 'steps',
                'content' => [
                    'title' => 'Before you visit',
                    'steps' => [
                        ['title' => 'Check the visiting window', 'body' => 'General wards allow visiting in the morning and evening windows shown on the home page. Intensive care and high dependency units restrict visiting to immediate family only.'],
                        ['title' => 'Bring identification', 'body' => 'Visitors should carry a valid form of identification.'],
                        ['title' => 'Keep groups small', 'body' => 'A maximum of two visitors per patient bed at any one time. Children under 12 are restricted from inpatient wards for clinical safety.'],
                    ],
                ],
                'sort_order' => 1,
            ],
            [
                'block_key' => 'contact_panel',
                'content' => [
                    'title' => 'How to reach us',
                    'note' => 'For any patient-specific question, contact the inpatient unit desk first.',
                ],
                'sort_order' => 2,
            ],
        ]);

        Page::updateOrCreate(['slug' => 'privacy-statement'], [
            'template_id' => $legal->id,
            'title' => 'Privacy statement',
            'summary' => 'How the FMCA collects and protects personal information.',
            'owner' => 'FMCA Legal & Compliance',
            'status' => 'draft',
            'reviewed_at' => null,
        ]);

        $this->seedBlocks('privacy-statement', [
            [
                'block_key' => 'rich_text',
                'content' => [
                    'heading' => 'This statement is being prepared',
                    'body' => 'This privacy statement is being prepared by the FMCA legal and compliance desk. The final statement describing how personal information is collected, used and protected will be published here once it has been reviewed and approved.',
                ],
                'sort_order' => 0,
            ],
        ]);
    }

    /**
     * Replace the stored blocks for a page (looked up by slug) with the given set.
     *
     * @param  array<int, array<string, mixed>>  $blocks
     */
    private function seedBlocks(string $slug, array $blocks): void
    {
        $page = Page::query()->where('slug', $slug)->first();

        if (! $page) {
            return;
        }

        $page->blocks()->delete();

        foreach ($blocks as $index => $block) {
            $page->blocks()->create([
                'block_key' => $block['block_key'],
                'content' => $block['content'],
                'sort_order' => $index,
            ]);
        }
    }
}
