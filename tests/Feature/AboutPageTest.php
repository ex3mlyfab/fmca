<?php

use App\Models\InstituteProfile;
use App\Models\SeoMetadata;

test('the about page is public and renders the published institute profile', function () {
    InstituteProfile::factory()->published()->create([
        'institution_name' => 'Federal Medical Centre, Abuja',
        'about_intro' => 'A tertiary healthcare provider in Abuja.',
        'history_body' => '<p>The institute was established to serve the Federal Capital Territory.</p>',
        'history_milestones' => [
            ['year' => '1991', 'title' => 'Establishment', 'body' => 'Opened its first ward.'],
        ],
        'vision_statement' => 'To be a leading tertiary hospital.',
        'mission_statement' => 'Deliver specialist care to every patient.',
        'general_email' => 'info@fmca.example',
        'general_phone' => '08000000002',
        'general_phone_label' => 'Switchboard',
        'emergency_phone' => '08000000001',
        'emergency_label' => 'Verified dispatch line',
        'campus_name' => 'FMCA Campus',
        'address_lines' => ['Plot 776', 'Jabi Road, Abuja'],
        'access_note' => 'Enter from Jabi Road opposite the roundabout.',
        'location_label' => 'Location',
        'location_address' => 'Jabi Road, Abuja, Nigeria',
        'latitude' => 13.0827,
        'longitude' => 8.6753,
        'map_zoom' => 16,
        'map_alt_text' => 'Map showing the FMCA campus',
        'visiting_hours' => [
            ['day_range' => 'Monday - Friday', 'morning_slot' => '9:00 - 11:00', 'evening_slot' => '3:00 - 5:00', 'status' => 'open'],
        ],
        'visiting_policy_note' => 'Ward visits follow infection control rules.',
        'owner' => 'FMCA Corporate Communications',
        'reviewed_at' => '2026-08-15',
    ]);

    $this->get(route('about'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('about')
        ->where('instituteProfile.status', 'published')
        ->where('instituteProfile.institutionName', 'Federal Medical Centre, Abuja')
        ->where('instituteProfile.aboutIntro', 'A tertiary healthcare provider in Abuja.')
        ->where('instituteProfile.emergencyTel', 'tel:08000000001')
        ->where('instituteProfile.generalEmailHref', 'mailto:info@fmca.example')
        ->where('instituteProfile.generalPhoneHref', 'tel:08000000002')
        ->where('instituteProfile.reviewedAt', '2026-08-15')
        ->where('instituteProfile.reviewedAtLabel', 'August 2026')
        ->where('instituteProfile.historyMilestones.0.year', '1991')
        ->where('instituteProfile.mapEmbedUrl', fn (?string $embed) => str_contains($embed, 'marker=13.082700%2C8.675300'))
        ->where('instituteProfile.directionsUrl', fn (?string $directions) => str_contains($directions, 'mlat=13.082700&mlon=8.675300'))
        ->where('instituteProfile.visitingHours.0.dayRange', 'Monday - Friday')
        ->where('instituteProfile.visitingHours.0.morningSlot', '9:00 - 11:00'));
});

test('the about page shares nothing when no profile is published', function () {
    InstituteProfile::factory()->create(['institution_name' => 'Unpublished Draft Institute']);

    $this->get(route('about'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('about')
        ->where('instituteProfile', null));
});

test('the published profile is shared with every other public page', function () {
    InstituteProfile::factory()->published()->create([
        'emergency_phone' => '08000000001',
        'emergency_label' => 'Verified dispatch line',
    ]);

    $this->get(route('contact'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('contact')
        ->where('instituteProfile.emergencyTel', 'tel:08000000001'));
});

test('the committee page still wins over the about page', function () {
    InstituteProfile::factory()->published()->create();

    $this->get(route('about.leadership'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('committee'));
});

test('the about page publishes default seo fields and breadcrumbs', function () {
    InstituteProfile::factory()->published()->create(['institution_name' => 'Federal Medical Centre, Abuja']);

    $this->get(route('about'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('about')
        ->where('seo.title', 'About Federal Medical Centre, Abuja')
        ->where('seo.canonical', url('about'))
        ->where('seo.robots', 'index,follow')
        ->where('seo.json_ld.@type', 'BreadcrumbList')
        ->where('seo.json_ld.itemListElement.0.name', 'Home')
        ->where('seo.json_ld.itemListElement.1.name', 'About'));
});

test('saved seo overrides win over the about page defaults', function () {
    SeoMetadata::factory()->minimal()->create([
        'content_type' => 'about',
        'content_id' => null,
        'title' => 'Overridden about title',
        'robots' => 'noindex,follow',
    ]);

    $this->get(route('about'))->assertInertia(fn ($page) => $page
        ->where('seo.title', 'Overridden about title')
        ->where('seo.robots', 'noindex,follow'));
});

test('the about page appears in the about sitemap only while it is published', function () {
    $empty = $this->get(route('sitemap.about'))->assertOk()->getContent();

    expect($empty)->not->toContain(url('about'));

    InstituteProfile::factory()->published()->create(['updated_at' => '2026-08-15']);

    $content = $this->get(route('sitemap.about'))->assertOk()->getContent();

    expect($content)->toContain(url('about'))
        ->and($content)->toContain('2026-08-15');
});
