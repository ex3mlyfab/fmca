<?php

use App\Models\AuditLog;
use App\Models\InstituteProfile;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

/**
 * A complete about-page form payload. Every column of the model is present so
 * a single assertion can prove the whole record was written.
 *
 * @return array<string, mixed>
 */
function profilePayload(array $overrides = []): array
{
    return array_merge([
        'institution_name' => 'Federal Medical Centre, Abuja',
        'about_intro' => 'An approved opening line.',
        'history_body' => '<p>Approved history.</p>',
        'history_milestones' => [['year' => '2000', 'title' => 'Established', 'body' => 'Founded.']],
        'vision_statement' => null,
        'mission_statement' => null,
        'general_email' => 'info@example.test',
        'general_phone' => '+2348000000000',
        'general_phone_label' => 'Patient desk',
        'emergency_phone' => '+2348000000001',
        'emergency_label' => 'Emergency dispatch',
        'campus_name' => 'FMCA Main Campus',
        'address_lines' => ['Plot 1202, Cadastral Zone', 'FCT Abuja, Nigeria'],
        'access_note' => 'Main gate: 24/7 emergency vehicle corridor',
        'location_label' => 'FMCA Main Campus',
        'location_address' => 'Plot 1202, Cadastral Zone, FCT Abuja, Nigeria',
        'latitude' => '13.0827',
        'longitude' => '8.6753',
        'map_zoom' => 15,
        'directions_url' => 'https://maps.google.com',
        'map_embed_url' => null,
        'map_alt_text' => 'Campus location map',
        'visiting_hours' => [['day_range' => 'Monday - Friday', 'morning_slot' => '06:30 - 07:30', 'evening_slot' => '16:30 - 18:30', 'status' => 'General wards']],
        'visiting_policy_note' => 'Maximum two visitors per bed.',
        'owner' => 'FMCA Communications & Clinical desks',
        'reviewed_at' => '2026-09-25',
        'status' => 'draft',
    ], $overrides);
}

function profileEditorWithoutPublish(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'institute_editor_test', 'guard_name' => 'web'],
        ['description' => 'Test-only institute editor without publish rights'],
    );
    $role->syncPermissions(['view_institute_profile', 'edit_institute_profile']);

    return User::factory()->create(['role_id' => $role->id]);
}

function profilePublisher(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'institute_publisher_test', 'guard_name' => 'web'],
        ['description' => 'Test-only institute publisher'],
    );
    $role->syncPermissions(['view_institute_profile', 'edit_institute_profile', 'publish_institute_profile']);

    return User::factory()->create(['role_id' => $role->id]);
}

test('the about workspace is limited to staff with institute profile rights', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $admin = User::factory()->withRole('super_admin')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($communications)->get(route('cms.institute-profile.index'))->assertOk();
    $this->actingAs($admin)->get(route('cms.institute-profile.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.institute-profile.index'))->assertForbidden();
    $this->actingAs($media)->get(route('cms.institute-profile.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.institute-profile.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.institute-profile.index'))->assertForbidden();
});

test('saving creates the single about record and a second save updates it in place', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload())
        ->assertRedirect(route('cms.institute-profile.index'));

    expect(InstituteProfile::query()->count())->toBe(1);

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['institution_name' => 'Federal Medical Centre Abuja']))
        ->assertRedirect(route('cms.institute-profile.index'));

    expect(InstituteProfile::query()->count())->toBe(1);

    $profile = InstituteProfile::query()->first();
    expect($profile->institution_name)->toBe('Federal Medical Centre Abuja')
        ->and($profile->status)->toBe('draft')
        ->and($profile->address_lines)->toBe(['Plot 1202, Cadastral Zone', 'FCT Abuja, Nigeria'])
        ->and($profile->visiting_hours)->toBe([[
            'day_range' => 'Monday - Friday',
            'morning_slot' => '06:30 - 07:30',
            'evening_slot' => '16:30 - 18:30',
            'status' => 'General wards',
        ]]);
});

test('editor markup is sanitised before it reaches the database', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['history_body' => '<p>Approved history.</p><script>alert("blocked")</script><img src=x onerror="alert(1)">']))
        ->assertRedirect(route('cms.institute-profile.index'));

    $history = (string) InstituteProfile::query()->value('history_body');

    expect($history)->toContain('<p>Approved history.</p>')
        ->and($history)->not->toContain('<script')
        ->and($history)->not->toContain('onerror');
});

test('an editor without publish rights cannot publish the about page', function () {
    $editor = profileEditorWithoutPublish();

    $response = $this->actingAs($editor)
        ->put(route('cms.institute-profile.update'), profilePayload(['status' => 'published']));

    $response->assertSessionHasErrors('status');
    expect(InstituteProfile::query()->exists())->toBeFalse();
});

test('a publisher can publish the about page and the public payload follows', function () {
    $publisher = profilePublisher();

    $this->actingAs($publisher)
        ->put(route('cms.institute-profile.update'), profilePayload(['status' => 'published']))
        ->assertRedirect(route('cms.institute-profile.index'));

    $public = InstituteProfile::publishedSiteInfo();
    expect($public)->not->toBeNull()
        ->and($public['status'])->toBe('published')
        ->and($public['emergencyTel'])->toBe('tel:+2348000000001')
        ->and($public['mapEmbedUrl'])->not->toBeNull()
        ->and($public['visitingHours'][0]['dayRange'])->toBe('Monday - Friday');
});

test('the published payload is built from the OpenStreetMap coordinates when no embed override exists', function () {
    $this->actingAs(profilePublisher())
        ->put(route('cms.institute-profile.update'), profilePayload(['status' => 'published']))
        ->assertRedirect();

    $public = InstituteProfile::publishedSiteInfo();

    expect($public['mapEmbedUrl'])->toContain('openstreetmap.org/export/embed.html')
        ->and($public['mapEmbedUrl'])->toContain('marker=13.082700%2C8.675300')
        ->and($public['directionsUrl'])->toContain('maps.google.com');
});

test('coordinates must be submitted as a pair', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['longitude' => null]))
        ->assertSessionHasErrors('longitude');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['latitude' => null]))
        ->assertSessionHasErrors('latitude');
});

test('contact and map fields are validated', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['general_email' => 'not-an-email']))
        ->assertSessionHasErrors('general_email');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['latitude' => '95']))
        ->assertSessionHasErrors('latitude');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['longitude' => '-200']))
        ->assertSessionHasErrors('longitude');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['map_zoom' => 25]))
        ->assertSessionHasErrors('map_zoom');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['map_embed_url' => 'https://example.test/embed.html']))
        ->assertSessionHasErrors('map_embed_url');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['directions_url' => 'javascript:alert(1)']))
        ->assertSessionHasErrors('directions_url');

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload(['history_milestones' => array_map(
            fn (int $index): array => ['year' => (string) $index, 'title' => "Milestone {$index}", 'body' => null],
            range(1, 13),
        )]))
        ->assertSessionHasErrors('history_milestones');
});

test('governance fields are stored and the change is audited', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.institute-profile.update'), profilePayload())
        ->assertRedirect(route('cms.institute-profile.index'));

    $profile = InstituteProfile::query()->first();

    expect($profile->owner)->toBe('FMCA Communications & Clinical desks')
        ->and($profile->reviewed_at?->format('Y-m-d'))->toBe('2026-09-25')
        ->and($profile->created_by)->toBe($communications->id);

    expect(AuditLog::query()->where([
        'content_type' => 'institute_profile',
        'content_id' => $profile->id,
        'actor_id' => $communications->id,
        'action' => AuditLog::ACTION_CREATED,
    ])->exists())->toBeTrue();
});

test('a published record that is edited back to draft stops feeding the public site', function () {
    $publisher = profilePublisher();

    $this->actingAs($publisher)
        ->put(route('cms.institute-profile.update'), profilePayload(['status' => 'published']))
        ->assertRedirect();

    expect(InstituteProfile::publishedSiteInfo())->not->toBeNull();

    $this->actingAs($publisher)
        ->put(route('cms.institute-profile.update'), profilePayload(['status' => 'draft']))
        ->assertRedirect();

    expect(InstituteProfile::publishedSiteInfo())->toBeNull();
});
