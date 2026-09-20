<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageTemplate;
use Illuminate\Database\Seeder;

/**
 * The public MVP patient guides (PROJECT_PLAN.md, delivery step 3). The
 * visiting-hours guide ships published because its copy mirrors the
 * owner-approved visiting details shown on the home page; the remaining
 * guides ship as drafts with clearly placeholder prose so they stay
 * invisible publicly until the FMCA Patient Services desk approves them.
 */
class PatientGuideSeeder extends Seeder
{
    public function run(): void
    {
        $template = PageTemplate::query()->where('key', 'patient_guide')->first();

        if (! $template) {
            return;
        }

        $visiting = Page::query()->where('slug', 'visiting-hours')->first();

        if ($visiting && $visiting->template_id === $template->id) {
            $visiting->update(['status' => 'published']);
        }

        foreach ($this->guides() as $slug => $guide) {
            $page = Page::updateOrCreate(['slug' => $slug], [
                'template_id' => $template->id,
                'title' => $guide['title'],
                'summary' => $guide['summary'],
                'owner' => $guide['owner'],
                'status' => 'draft',
            ]);

            $this->seedBlocks($page, [
                [
                    'block_key' => 'alert',
                    'content' => $guide['alert'],
                    'sort_order' => 0,
                ],
                [
                    'block_key' => 'contact_panel',
                    'content' => [
                        'title' => 'How to reach us',
                        'note' => $guide['note'],
                    ],
                    'sort_order' => 1,
                ],
            ]);
        }
    }

    /**
     * @return array<string, array{title: string, summary: string, owner: string, alert: array<string, string>, note: string}>
     */
    private function guides(): array
    {
        return [
            'patient-rights' => [
                'title' => 'Patient rights and concerns',
                'summary' => 'How patients and families can raise questions or concerns at FMCA.',
                'owner' => 'FMCA Patient Services',
                'alert' => [
                    'tone' => 'info',
                    'title' => 'This guide is being finalised',
                    'body' => 'The FMCA Patient Services desk is preparing the patient rights and complaints guidance. In the meantime, questions or concerns can be raised with the inpatient unit desk or through the main switchboard.',
                ],
                'note' => 'For patient-specific questions, contact the inpatient unit desk first.',
            ],
            'admission-process' => [
                'title' => 'Admission process',
                'summary' => 'What to expect from referral through inpatient admission at FMCA.',
                'owner' => 'FMCA Patient Services',
                'alert' => [
                    'tone' => 'info',
                    'title' => 'This guide is being finalised',
                    'body' => 'The admission and transfer guidance is being prepared by the FMCA Patient Services desk. Patients and families should follow the instructions given by the admitting unit on the day of admission.',
                ],
                'note' => 'For admissions on the day, contact the admitting unit desk directly.',
            ],
            'referral-guidance' => [
                'title' => 'Referring a patient to FMCA',
                'summary' => 'Preparing a referral and the records to bring with the patient.',
                'owner' => 'FMCA Patient Services',
                'alert' => [
                    'tone' => 'info',
                    'title' => 'This guide is being finalised',
                    'body' => 'The referral and records guidance is being prepared by the FMCA Patient Services desk. Referring clinicians should confirm the required documents with the clinical desk before transferring a patient.',
                ],
                'note' => 'For referral questions, contact the clinical desk before transfer.',
            ],
            'billing-guidance' => [
                'title' => 'Billing and NHIA guidance',
                'summary' => 'How to plan for costs and confirm fees before admission.',
                'owner' => 'FMCA Patient Services',
                'alert' => [
                    'tone' => 'info',
                    'title' => 'This guide is being finalised',
                    'body' => 'The billing and NHIA guidance is being prepared by the FMCA Patient Services and billing desks. Confirm current fees with the billing desk before admission; no fees are published on this page.',
                ],
                'note' => 'For fees or NHIA questions, contact the billing desk before admission.',
            ],
        ];
    }

    /**
     * Replace the stored blocks for a page with the given set.
     *
     * @param  array<int, array<string, mixed>>  $blocks
     */
    private function seedBlocks(Page $page, array $blocks): void
    {
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
