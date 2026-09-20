<?php

use App\Models\Clinic;
use App\Models\Department;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function clinicPayload(): array
{
    return [
        'name' => 'Stroke Care Clinic',
        'summary' => 'Preventive and follow-up care for stroke survivors.',
        'hours' => 'Consultation hours are confirmed by the clinical desk.',
        'owner' => 'FMCA Clinical Desk',
        'reviewed_at' => '2026-09-20',
    ];
}

test('clinical roles can open the clinics workspace, others cannot', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $communications = User::factory()->withRole('communications_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($approver)->get(route('cms.clinics.index'))->assertOk();
    $this->actingAs($approver)->get(route('cms.clinics.create'))->assertOk();
    $this->actingAs($editor)->get(route('cms.clinics.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.clinics.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.clinics.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.clinics.index'))->assertForbidden();
});

test('a department editor creates a draft clinic', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.clinics.store'), clinicPayload());

    $created = Clinic::query()->latest()->first();
    $response->assertRedirect(route('cms.clinics.edit', ['clinic' => $created->id]));
    $this->assertDatabaseHas('clinics', [
        'name' => 'Stroke Care Clinic',
        'status' => 'draft',
        'owner' => 'FMCA Clinical Desk',
    ]);
});

test('a clinic must reference a valid department', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.clinics.store'), [...clinicPayload(), 'department_id' => 999])
        ->assertSessionHasErrors('department_id');
});

test('a department editor cannot publish a new clinic', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.clinics.store'), [...clinicPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.clinics.store'), clinicPayload())
        ->assertRedirect();
    $this->assertDatabaseHas('clinics', ['name' => 'Stroke Care Clinic', 'status' => 'draft']);
});

test('a clinical content approver can publish a clinic', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.clinics.store'), [...clinicPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('clinics', ['name' => 'Stroke Care Clinic', 'status' => 'published']);
});

test('a department editor keeps a published clinic published or unpublishes it, but cannot publish a draft', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $published = Clinic::factory()->published()->create(['name' => 'Live clinic']);
    $draft = Clinic::factory()->create(['name' => 'Draft clinic']);

    $this->actingAs($editor)->put(route('cms.clinics.update', ['clinic' => $published->id]), [
        'name' => $published->name,
        'status' => 'published',
    ])->assertRedirect(route('cms.clinics.index'));
    $this->assertDatabaseHas('clinics', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.clinics.update', ['clinic' => $published->id]), [
        'name' => $published->name,
        'status' => 'draft',
    ])->assertRedirect(route('cms.clinics.index'));
    $this->assertDatabaseHas('clinics', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.clinics.update', ['clinic' => $draft->id]), [
        'name' => $draft->name,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('clinics', ['id' => $draft->id, 'status' => 'draft']);
});

test('an approver can publish a draft clinic', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $draft = Clinic::factory()->create(['name' => 'Draft clinic']);

    $this->actingAs($approver)->put(route('cms.clinics.update', ['clinic' => $draft->id]), [
        'name' => $draft->name,
        'status' => 'published',
    ])->assertRedirect(route('cms.clinics.index'));
    $this->assertDatabaseHas('clinics', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with clinic edit rights can add clinics', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.clinics.store'), clinicPayload())->assertForbidden();
});

test('a clinic can be linked to a department', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $department = Department::factory()->create();

    $this->actingAs($editor)->post(route('cms.clinics.store'), [...clinicPayload(), 'department_id' => $department->id])
        ->assertRedirect();
    $this->assertDatabaseHas('clinics', ['name' => 'Stroke Care Clinic', 'department_id' => $department->id]);
});
