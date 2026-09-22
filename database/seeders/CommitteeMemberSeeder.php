<?php

namespace Database\Seeders;

use App\Models\CommitteeMember;
use Illuminate\Database\Seeder;

class CommitteeMemberSeeder extends Seeder
{
    /**
     * Placeholder, clearly-non-authoritative sample content. No invented
     * names, terms of office, statistics, or biographies
     * (see PROJECT_PLAN.md). Committee profiles are role-based placeholders
     * to be completed and approved by FMCA Corporate Communications before
     * publication.
     */
    public function run(): void
    {
        $members = [
            [
                'name' => 'Executive Chairperson',
                'slug' => 'executive-chairperson',
                'role' => 'Executive Chairperson',
                'portfolio' => 'Institutional Oversight',
                'sort_order' => 1,
            ],
            [
                'name' => 'Director-General / Pro-Vice-Chancellor',
                'slug' => 'director-general-pro-vice-chancellor',
                'role' => 'Director-General / Pro-Vice-Chancellor',
                'portfolio' => 'Overall Centre Management',
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro-Vice-Chancellor (Academic Affairs)',
                'slug' => 'pro-vice-chancellor-academic-affairs',
                'role' => 'Pro-Vice-Chancellor',
                'portfolio' => 'Academic Affairs',
                'sort_order' => 3,
            ],
            [
                'name' => 'Pro-Vice-Chancellor (Clinical Affairs)',
                'slug' => 'pro-vice-chancellor-clinical-affairs',
                'role' => 'Pro-Vice-Chancellor',
                'portfolio' => 'Clinical Affairs',
                'sort_order' => 4,
            ],
            [
                'name' => 'Head of Corporate Services',
                'slug' => 'head-of-corporate-services',
                'role' => 'Head of Corporate Services',
                'portfolio' => 'Administrative & Corporate Services',
                'sort_order' => 5,
            ],
        ];

        foreach ($members as $member) {
            CommitteeMember::query()->firstOrCreate(
                ['slug' => $member['slug']],
                [
                    'name' => $member['name'],
                    'role' => $member['role'],
                    'portfolio' => $member['portfolio'],
                    'mandate' => 'This profile is a placeholder. The committee member details, term, and mandate are completed and approved by FMCA Corporate Communications before publication.',
                    'sort_order' => $member['sort_order'],
                    'owner' => 'FMCA Corporate Communications',
                    'status' => 'draft',
                ],
            );
        }
    }
}
