<?php

namespace Database\Seeders;

use App\Models\PageTemplate;
use Illuminate\Database\Seeder;

/**
 * The controlled page-template registry (PROJECT_PLAN.md "Required templates").
 * Templates are application definitions added through reviewed code — editors
 * choose from this catalog, they never invent layouts. Permitted-block lists
 * cover the Q3 block set; blocks that need media/entity data stay reserved.
 */
class PageTemplateSeeder extends Seeder
{
    /**
     * @var array<int, array<string, mixed>>
     */
    public const TEMPLATES = [
        [
            'key' => 'campaign',
            'name' => 'Campaign',
            'purpose' => 'Time-bound awareness or institutional campaign',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => true,
            'requires_summary' => false,
            'required_fields' => ['Campaign dates', 'Owner', 'Primary CTA'],
            'permitted_blocks' => ['rich_text', 'faq', 'cta'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'institutional',
            'name' => 'Institutional',
            'purpose' => 'About, leadership and governance pages',
            'url_prefix' => 'about',
            'routable' => true,
            'requires_owner' => true,
            'requires_summary' => true,
            'required_fields' => ['Title', 'Summary', 'Review owner / date'],
            'permitted_blocks' => ['rich_text', 'document_list', 'cta'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'patient_guide',
            'name' => 'Patient guide',
            'purpose' => 'Practical patient task or policy guidance',
            'url_prefix' => 'patients',
            'routable' => true,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Title', 'Audience', 'Last reviewed date'],
            'permitted_blocks' => ['steps', 'alert', 'faq', 'document_list', 'cta', 'contact_panel'],
            'default_owner' => 'FMCA Patient Services',
        ],
        [
            'key' => 'department',
            'name' => 'Department',
            'purpose' => 'Department overview pages',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Department relation', 'Contact', 'Review date'],
            'permitted_blocks' => ['faq', 'contact_panel'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'service',
            'name' => 'Service',
            'purpose' => 'Patient-facing service detail pages',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Service relation', 'Department', 'Referral guidance'],
            'permitted_blocks' => ['steps', 'faq', 'contact_panel'],
            'default_owner' => 'FMCA Clinical desks',
        ],
        [
            'key' => 'consultant',
            'name' => 'Consultant',
            'purpose' => 'Approved consultant profile pages',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Person', 'Specialty', 'Department'],
            'permitted_blocks' => ['rich_text', 'faq', 'contact_panel'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'article',
            'name' => 'Article',
            'purpose' => 'News and press content pages',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Author', 'Publish date', 'Category'],
            'permitted_blocks' => ['rich_text', 'faq'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'publication',
            'name' => 'Publication',
            'purpose' => 'Downloadable formal content',
            'url_prefix' => 'publications',
            'routable' => true,
            'requires_owner' => true,
            'requires_summary' => false,
            'required_fields' => ['Document', 'Issuing unit', 'Issue date'],
            'permitted_blocks' => ['rich_text', 'document_list'],
            'default_owner' => 'FMCA Media desk',
        ],
        [
            'key' => 'career',
            'name' => 'Career',
            'purpose' => 'Vacancy information pages',
            'url_prefix' => 'careers',
            'routable' => true,
            'requires_owner' => true,
            'requires_summary' => false,
            'required_fields' => ['Closing date', 'HR owner', 'Application route'],
            'permitted_blocks' => ['rich_text', 'faq', 'cta'],
            'default_owner' => 'FMCA HR desk',
        ],
        [
            'key' => 'event',
            'name' => 'Event',
            'purpose' => 'Public event detail pages',
            'url_prefix' => 'events',
            'routable' => true,
            'requires_owner' => true,
            'requires_summary' => false,
            'required_fields' => ['Date / time', 'Venue', 'Organiser'],
            'permitted_blocks' => ['rich_text', 'faq', 'cta'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'contact',
            'name' => 'Contact',
            'purpose' => 'Contact and location content',
            'url_prefix' => null,
            'routable' => false,
            'requires_owner' => false,
            'requires_summary' => false,
            'required_fields' => ['Approved contacts', 'Hours', 'Location'],
            'permitted_blocks' => ['rich_text', 'faq', 'document_list', 'cta', 'contact_panel'],
            'default_owner' => 'FMCA Communications',
        ],
        [
            'key' => 'legal',
            'name' => 'Legal',
            'purpose' => 'Compliance statement pages',
            'url_prefix' => 'legal',
            'routable' => true,
            'requires_owner' => true,
            'requires_summary' => false,
            'required_fields' => ['Effective date', 'Legal owner'],
            'permitted_blocks' => ['rich_text', 'document_list', 'contact_panel'],
            'default_owner' => 'FMCA Legal & Compliance',
        ],
    ];

    public function run(): void
    {
        foreach (self::TEMPLATES as $data) {
            PageTemplate::updateOrCreate(['key' => $data['key']], $data);
        }
    }
}
