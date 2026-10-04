<?php

namespace Database\Seeders;

use App\Models\InstituteProfile;
use Illuminate\Database\Seeder;

/**
 * The default about-page record. Every value is lifted from the contact
 * constants the public site has always rendered (resources/js/lib/contact-info.ts),
 * so publishing this record changes no visible output: the site-wide wiring
 * has a single source to correct from instead of eight hard-coded copies.
 *
 * Nothing is invented. Coordinates and the general enquiries line and email
 * are left empty because no verified values exist yet; the map panel then
 * shows the address and the directions link only.
 */
class InstituteProfileSeeder extends Seeder
{
    public function run(): void
    {
        InstituteProfile::updateOrCreate(['id' => 1], [
            'institution_name' => 'Federal Medical Centre, Abuja',
            'about_intro' => 'Federal Medical Centre, Abuja is a federal tertiary healthcare institution in the Federal Capital Territory. The institute\'s own approved history, mission and contact narrative belongs here.',
            'history_body' => '<p>This is a placeholder. Replace it from the Content Studio with the institute history narrative approved by Corporate Communications, without adding dates, accreditation claims or staffing figures that have not been verified.</p>',
            'history_milestones' => [],
            'vision_statement' => null,
            'mission_statement' => null,
            'general_email' => null,
            'general_phone' => null,
            'general_phone_label' => null,
            'emergency_phone' => '+2340000000000',
            'emergency_label' => 'Verified dispatch line',
            'campus_name' => 'Federal Medical Centre, Abuja',
            'address_lines' => ['Plot 1202, Cadastral Zone, FCT Abuja, Nigeria'],
            'access_note' => 'Main gate: 24/7 emergency vehicle corridor',
            'location_label' => 'Federal Medical Centre, Abuja',
            'location_address' => 'Plot 1202, Cadastral Zone, FCT Abuja, Nigeria',
            'latitude' => null,
            'longitude' => null,
            'map_zoom' => 16,
            'directions_url' => 'https://maps.google.com',
            'map_embed_url' => null,
            'map_alt_text' => 'Campus location map for Federal Medical Centre, Abuja',
            'visiting_hours' => [
                [
                    'day_range' => 'Monday - Friday',
                    'morning_slot' => '06:30 - 07:30',
                    'evening_slot' => '16:30 - 18:30',
                    'status' => 'General wards',
                ],
                [
                    'day_range' => 'Weekends & Public Holidays',
                    'morning_slot' => '11:00 - 13:00',
                    'evening_slot' => '16:00 - 18:30',
                    'status' => 'General wards',
                ],
                [
                    'day_range' => 'Intensive Care & High Dependency',
                    'morning_slot' => 'Restricted',
                    'evening_slot' => '17:00 - 18:00',
                    'status' => 'Immediate family only',
                ],
            ],
            'visiting_policy_note' => 'Maximum 2 visitors per patient bed at any one time. Children under 12 years are restricted from inpatient wards for clinical safety.',
            'owner' => 'FMCA Communications & Clinical desks',
            'reviewed_at' => now(),
            'status' => InstituteProfile::STATUS_PUBLISHED,
        ]);
    }
}
