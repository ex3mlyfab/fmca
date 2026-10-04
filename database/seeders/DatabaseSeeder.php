<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(PageTemplateSeeder::class);
        $this->call(DepartmentServiceSeeder::class);
        $this->call(ClinicsConsultantsSeeder::class);
        $this->call(CommitteeMemberSeeder::class);
        $this->call(SiteMenuSeeder::class);
        $this->call(InstituteProfileSeeder::class);
        $this->call(NewsSeeder::class);
        $this->call(CampaignSeeder::class);
        $this->call(PageSeeder::class);
        $this->call(PatientGuideSeeder::class);
        $this->call(LegalPagesSeeder::class);
        $this->call(UserSeeder::class);
    }
}
