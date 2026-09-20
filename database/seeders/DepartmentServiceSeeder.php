<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Service;
use Illuminate\Database\Seeder;

class DepartmentServiceSeeder extends Seeder
{
    /**
     * Placeholder, clearly-non-authoritative sample content. No invented statistics,
     * clinician names, fees, or live availability (see PROJECT_PLAN.md).
     *
     * @return array<int, array<string, string|null>>
     */
    private const DEPARTMENTS = [
        [
            'name' => 'Cardiology',
            'slug' => 'cardiology',
            'summary' => 'Specialist care for the heart and circulation.',
            'description' => 'The Cardiology department provides diagnosis and ongoing management of heart and circulatory conditions. Details of sessions, referral requirements, and visiting arrangements are confirmed by the clinical desk before publication.',
        ],
        [
            'name' => 'Oncology',
            'slug' => 'oncology',
            'summary' => 'Diagnosis and management of cancer.',
            'description' => 'The Oncology department supports the diagnosis and ongoing management of cancer. Treatment pathways are individual and require referral by a treating clinician; eligibility and preparation are reviewed before each admission.',
        ],
        [
            'name' => 'Paediatrics',
            'slug' => 'paediatrics',
            'summary' => 'Care for children and adolescents.',
            'description' => 'The Paediatrics department provides care for children and adolescents. A parent, guardian, or approved caregiver accompanies children for admissions and clinical follow-up.',
        ],
        [
            'name' => 'Emergency Medicine',
            'slug' => 'emergency-medicine',
            'summary' => 'Urgent assessment and stabilisation.',
            'description' => "The Emergency Medicine department offers urgent assessment and stabilisation for patients presenting with acute illness or injury. Triage follows the hospital's operational priority protocol.",
        ],
    ];

    /**
     * @return array<int, array<string, string|null>>
     */
    private const SERVICES = [
        [
            'name' => 'Cardiology Outpatient Clinic',
            'slug' => 'cardiology-outpatient-clinic',
            'summary' => 'Routine specialist follow-up for the heart and circulation.',
            'description' => 'An outpatient clinic for the follow-up and monitoring of heart and circulation conditions. Appointments are arranged through the relevant clinical pathway.',
            'department_slug' => 'cardiology',
        ],
        [
            'name' => '24/7 Emergency & Trauma Services',
            'slug' => 'emergency-trauma-services',
            'summary' => 'Round-the-clock urgent assessment and stabilisation.',
            'description' => 'A continuous urgent assessment and stabilisation service. Patients are triaged on arrival and managed by the on-duty clinical team.',
            'department_slug' => 'emergency-medicine',
        ],
        [
            'name' => 'Chemotherapy & Infusion Services',
            'slug' => 'chemotherapy-infusion-services',
            'summary' => 'Cancer treatment administration in a monitored setting.',
            'description' => 'Administration of chemotherapy and other infusion-based treatments within a monitored setting. Scheduling and eligibility are confirmed by the treating clinician.',
            'department_slug' => 'oncology',
        ],
        [
            'name' => 'Neonatal Care',
            'slug' => 'neonatal-care',
            'summary' => 'Support for newborns and preterm infants.',
            'description' => "Care and monitoring for newborns and preterm infants. Parent and caregiver access follows the department's visiting guidance.",
            'department_slug' => 'paediatrics',
        ],
        [
            'name' => 'Diagnostic Imaging',
            'slug' => 'diagnostic-imaging',
            'summary' => 'Imaging studies that support diagnosis.',
            'description' => 'Imaging services that support diagnosis. Result availability and reporting timelines are provided by the radiology team and are not shown publicly.',
            'department_slug' => null,
        ],
        [
            'name' => 'Occupational Health',
            'slug' => 'occupational-health',
            'summary' => 'Pre-employment and workplace medical assessments.',
            'description' => 'Medical assessments for occupational and pre-employment screening. Bookings and outcomes are managed by the clinical desk; results are not disclosed publicly.',
            'department_slug' => null,
        ],
    ];

    public function run(): void
    {
        foreach (self::DEPARTMENTS as $data) {
            Department::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'summary' => $data['summary'],
                    'description' => $data['description'],
                    'owner' => 'Department Editor',
                    'reviewed_at' => now(),
                    'status' => 'published',
                ],
            );
        }

        foreach (self::SERVICES as $data) {
            $department = $data['department_slug'] !== null
                ? Department::where('slug', $data['department_slug'])->first()
                : null;

            Service::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'summary' => $data['summary'],
                    'description' => $data['description'],
                    'referral_guidance' => 'Refer via the standard clinical referral pathway. Eligibility and preparation are reviewed by the clinical desk before an appointment request is actioned.',
                    'eligibility' => 'Eligibility is confirmed by the treating clinician.',
                    'department_id' => $department?->id,
                    'owner' => 'Department Editor',
                    'reviewed_at' => now(),
                    'status' => 'published',
                ],
            );
        }
    }
}
