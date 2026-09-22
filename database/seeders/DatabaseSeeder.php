<?php

namespace Database\Seeders;

use App\Models\User;
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
        $this->call(NewsSeeder::class);
        $this->call(CampaignSeeder::class);
        $this->call(PageSeeder::class);
        $this->call(PatientGuideSeeder::class);
        $this->call(LegalPagesSeeder::class);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
