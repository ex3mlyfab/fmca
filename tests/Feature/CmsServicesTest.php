<?php

use App\Models\Department;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function servicePayload(): array
{
    return [
        'name' => 'Dialysis Services',
        'slug' => 'dialysis-services',
        'summary' => 'Dialysis treatment and monitoring.',
        'description' => 'Haemodialysis and peritoneal dialysis follow-up managed by the renal team.',
        'referral_guidance' => 'Refer via the standard clinical referral pathway.',
        'owner' => 'FMCA Clinical Desk',
    ];
}

test('clinical roles can open the services workspace, others cannot', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $communications = User::factory()->withRole('communications_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($approver)->get(route('cms.services.index'))->assertOk();
    $this->actingAs($approver)->get(route('cms.services.create'))->assertOk();
    $this->actingAs($editor)->get(route('cms.services.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.services.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.services.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.services.index'))->assertForbidden();
});

test('a department editor creates a draft service', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.services.store'), servicePayload());

    $created = Service::query()->latest()->first();
    $response->assertRedirect(route('cms.services.edit', ['service' => $created->id]));
    $this->assertDatabaseHas('services', [
        'name' => 'Dialysis Services',
        'slug' => 'dialysis-services',
        'status' => 'draft',
        'owner' => 'FMCA Clinical Desk',
    ]);
});

test('service descriptions are sanitized before storage on create and update', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $description = '<h2>Service details</h2><p>Patients <strong>must</strong> register.</p>'
        .'<script>alert(1)</script><a href="javascript:alert(1)">unsafe link</a>'
        .'<a href="/referrals">Referral information</a>';

    $this->actingAs($editor)->post(route('cms.services.store'), [
        ...servicePayload(),
        'description' => $description,
    ])->assertRedirect();

    $service = Service::query()->where('slug', 'dialysis-services')->firstOrFail();

    expect($service->description)
        ->toContain('<h2>Service details</h2>')
        ->toContain('<strong>must</strong>')
        ->toContain('<a href="/referrals">Referral information</a>')
        ->not->toContain('<script')
        ->not->toContain('javascript:');

    $this->actingAs($editor)->put(route('cms.services.update', ['service' => $service->id]), [
        ...servicePayload(),
        'description' => '<p>Updated service details.</p><iframe src="https://evil.example"></iframe>',
    ])->assertRedirect(route('cms.services.index'));

    expect($service->fresh()->description)
        ->toContain('<p>Updated service details.</p>')
        ->not->toContain('<iframe')
        ->not->toContain('evil.example');
});

test('service slugs are unique', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    Service::factory()->create(['slug' => 'dialysis-services']);

    $this->actingAs($editor)->post(route('cms.services.store'), servicePayload())
        ->assertSessionHasErrors('slug');
});

test('a service must reference a valid department', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.services.store'), [...servicePayload(), 'department_id' => 999])
        ->assertSessionHasErrors('department_id');
});

test('a department editor cannot publish a new service', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.services.store'), [...servicePayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.services.store'), servicePayload())
        ->assertRedirect();
    $this->assertDatabaseHas('services', ['name' => 'Dialysis Services', 'status' => 'draft']);
});

test('a clinical content approver can publish a new service', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.services.store'), [...servicePayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('services', ['name' => 'Dialysis Services', 'status' => 'published']);
});

test('a department editor keeps a published service published or unpublishes it, but cannot publish a draft', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $published = Service::factory()->published()->create(['name' => 'Live service', 'slug' => 'live-service']);
    $draft = Service::factory()->create(['name' => 'Draft service', 'slug' => 'draft-service']);

    $this->actingAs($editor)->put(route('cms.services.update', ['service' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'summary' => $published->summary,
        'description' => $published->description,
        'status' => 'published',
    ])->assertRedirect(route('cms.services.index'));
    $this->assertDatabaseHas('services', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.services.update', ['service' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'summary' => $published->summary,
        'description' => $published->description,
        'status' => 'draft',
    ])->assertRedirect(route('cms.services.index'));
    $this->assertDatabaseHas('services', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.services.update', ['service' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'summary' => $draft->summary,
        'description' => $draft->description,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('services', ['id' => $draft->id, 'status' => 'draft']);
});

test('an approver can publish a draft service', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $draft = Service::factory()->create(['name' => 'Draft service', 'slug' => 'draft-service']);

    $this->actingAs($approver)->put(route('cms.services.update', ['service' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'summary' => $draft->summary,
        'description' => $draft->description,
        'status' => 'published',
    ])->assertRedirect(route('cms.services.index'));
    $this->assertDatabaseHas('services', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with service edit rights can add services', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.services.store'), servicePayload())->assertForbidden();
});

test('a service can be linked to a department', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $department = Department::factory()->create();

    $this->actingAs($editor)->post(route('cms.services.store'), [...servicePayload(), 'department_id' => $department->id])
        ->assertRedirect();
    $this->assertDatabaseHas('services', ['slug' => 'dialysis-services', 'department_id' => $department->id]);
});
