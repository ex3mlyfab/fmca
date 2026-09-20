<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageTemplate;
use Illuminate\Database\Seeder;

/**
 * The public MVP legal statements (PROJECT_PLAN.md, delivery step 3). All
 * four ship as drafts: no legal copy is owner-approved yet, and compliance
 * statements must clear the legal and compliance desk before publication.
 * Prose is clearly placeholder and makes no invented claims.
 */
class LegalPagesSeeder extends Seeder
{
    public function run(): void
    {
        $template = PageTemplate::query()->where('key', 'legal')->first();

        if (! $template) {
            return;
        }

        foreach ($this->statements() as $slug => $statement) {
            $page = Page::updateOrCreate(['slug' => $slug], [
                'template_id' => $template->id,
                'title' => $statement['title'],
                'summary' => $statement['summary'],
                'owner' => $statement['owner'],
                'status' => 'draft',
            ]);

            $this->seedBlocks($page, [
                [
                    'block_key' => 'rich_text',
                    'content' => [
                        'heading' => 'This statement is being prepared',
                        'body' => $statement['body'],
                    ],
                    'sort_order' => 0,
                ],
                [
                    'block_key' => 'contact_panel',
                    'content' => [
                        'title' => 'How to reach us',
                        'note' => $statement['note'],
                    ],
                    'sort_order' => 1,
                ],
            ]);
        }
    }

    /**
     * @return array<string, array{title: string, summary: string, owner: string, body: string, note: string}>
     */
    private function statements(): array
    {
        return [
            'privacy-statement' => [
                'title' => 'Privacy statement',
                'summary' => 'How the FMCA collects and protects personal information.',
                'owner' => 'FMCA Legal & Compliance',
                'body' => 'The privacy statement is being prepared by the FMCA legal and compliance desk. The final statement describing how personal information is collected, used and protected will be published here once it has been reviewed and approved.',
                'note' => 'For data protection questions, contact the legal and compliance desk.',
            ],
            'cookie-notice' => [
                'title' => 'Cookie notice',
                'summary' => 'Which cookies this website uses and why.',
                'owner' => 'FMCA Legal & Compliance',
                'body' => 'The cookie notice is being prepared by the FMCA legal and compliance desk. This website does not set third-party analytics or advertising cookies; it sets only the cookies required for security and for remembering your session.',
                'note' => 'For questions about cookies on this site, contact the legal and compliance desk.',
            ],
            'accessibility-statement' => [
                'title' => 'Accessibility statement',
                'summary' => 'How this website is made accessible and how to report barriers.',
                'owner' => 'FMCA Legal & Compliance',
                'body' => 'The accessibility statement is being prepared by the FMCA legal and compliance desk. It will describe how this website meets accessibility requirements and how users can report barriers or request content in another format.',
                'note' => 'To report an accessibility barrier, contact the legal and compliance desk.',
            ],
            'terms-of-use' => [
                'title' => 'Terms of use',
                'summary' => 'How this website may be used and the limits of the information it provides.',
                'owner' => 'FMCA Legal & Compliance',
                'body' => 'The terms of use are being prepared by the FMCA legal and compliance desk. The final statement will describe how this website may be used and that the information it provides is general in nature and does not replace a clinical assessment.',
                'note' => 'For questions about the terms of use, contact the legal and compliance desk.',
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
