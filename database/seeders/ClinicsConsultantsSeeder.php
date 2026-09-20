<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\Consultant;
use App\Models\Department;
use Illuminate\Database\Seeder;

class ClinicsConsultantsSeeder extends Seeder
{
    /**
     * Placeholder, clearly-non-authoritative sample content. No invented
     * clinician names, statistics, fees, or live availability
     * (see PROJECT_PLAN.md). Clinician profiles are role-based placeholders
     * to be completed by the clinical content owner before publication.
     */
    public function run(): void
    {
        $this->seedClinics();
        $this->seedConsultants();
    }

    private function seedClinics(): void
    {
        $clinics = [
            [
                'name' => 'Cardiology Outpatient Clinic',
                'summary' => 'Routine specialist follow-up for heart and circulation conditions.',
                'hours' => 'Consultation hours are confirmed by the clinical desk before publication.',
                'department_slug' => 'cardiology',
            ],
            [
                'name' => 'Emergency & Trauma Unit',
                'summary' => 'Round-the-clock urgent assessment and stabilisation.',
                'hours' => 'Open round-the-clock. Triage follows the hospital operational priority protocol.',
                'department_slug' => 'emergency-medicine',
            ],
            [
                'name' => 'Paediatric Outpatient Clinic',
                'summary' => 'Outpatient care and follow-up for children and adolescents.',
                'hours' => 'Consultation hours are confirmed by the clinical desk before publication.',
                'department_slug' => 'paediatrics',
            ],
        ];

        foreach ($clinics as $clinic) {
            $department = Department::query()->where('slug', $clinic['department_slug'])->first();

            Clinic::query()->firstOrCreate(
                ['name' => $clinic['name']],
                [
                    'summary' => $clinic['summary'],
                    'hours' => $clinic['hours'],
                    'department_id' => $department?->id,
                    'owner' => 'FMCA Clinical Desk',
                    'status' => 'draft',
                ],
            );
        }
    }

    private function seedConsultants(): void
    {
        $consultants = [
            [
                'name' => 'Cardiology Consultant',
                'slug' => 'cardiology-consultant',
                'specialty' => 'Cardiology',
                'position' => 'Consultant',
                'department_slug' => 'cardiology',
                'specialty_tags' => ['Cardiology', 'Outpatient follow-up'],
            ],
            [
                'name' => 'Paediatrics Consultant',
                'slug' => 'paediatrics-consultant',
                'specialty' => 'Paediatrics',
                'position' => 'Consultant',
                'department_slug' => 'paediatrics',
                'specialty_tags' => ['Paediatrics', 'Newborn care'],
            ],
        ];

        foreach ($consultants as $consultant) {
            $department = Department::query()->where('slug', $consultant['department_slug'])->first();

            Consultant::query()->firstOrCreate(
                ['slug' => $consultant['slug']],
                [
                    'name' => $consultant['name'],
                    'specialty' => $consultant['specialty'],
                    'position' => $consultant['position'],
                    'biography' => 'This profile is a placeholder. Clinician details are completed and approved by the clinical content owner before publication.',
                    'specialty_tags' => $consultant['specialty_tags'],
                    'department_id' => $department?->id,
                    'owner' => 'FMCA Clinical Desk',
                    'status' => 'draft',
                ],
            );
        }
    }
}
