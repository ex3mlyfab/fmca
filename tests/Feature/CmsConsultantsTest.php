<?php

use App\Models\Consultant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function consultantPayload(): array
{
    return [
        'name' => 'New Consultant',
        'slug' => 'new-consultant',
        'specialty' => 'Cardiology',
        'position' => 'Consultant',
        'biography' => 'Completed by the clinical content owner before publication.',
        'specialty_tags' => 'Cardiology, Hypertension',
        'owner' => 'FMCA Clinical Desk',
    ];
}

test('clinical roles can open the consultants workspace, others cannot', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $communications = User::factory()->withRole('communications_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($approver)->get(route('cms.consultants.index'))->assertOk();
    $this->actingAs($approver)->get(route('cms.consultants.create'))->assertOk();
    $this->actingAs($editor)->get(route('cms.consultants.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.consultants.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.consultants.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.consultants.index'))->assertForbidden();
});

test('a department editor creates a draft consultant with normalised specialty tags', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.consultants.store'), consultantPayload());

    $created = Consultant::query()->latest()->first();
    $response->assertRedirect(route('cms.consultants.edit', ['consultant' => $created->id]));
    $this->assertDatabaseHas('consultants', [
        'name' => 'New Consultant',
        'slug' => 'new-consultant',
        'status' => 'draft',
    ]);
    expect($created->specialty_tags)->toEqual(['Cardiology', 'Hypertension']);
});

test('consultant slugs must be unique', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    Consultant::factory()->create(['slug' => 'taken-slug']);

    $this->actingAs($editor)->post(route('cms.consultants.store'), [...consultantPayload(), 'slug' => 'taken-slug'])
        ->assertSessionHasErrors('slug');
});

test('a department editor cannot publish a new consultant', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.consultants.store'), [...consultantPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.consultants.store'), consultantPayload())
        ->assertRedirect();
    $this->assertDatabaseHas('consultants', ['slug' => 'new-consultant', 'status' => 'draft']);
});

test('a clinical content approver can publish a consultant', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.consultants.store'), [...consultantPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('consultants', ['slug' => 'new-consultant', 'status' => 'published']);
});

test('a department editor keeps a published profile published or unpublishes it, but cannot publish a draft', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $published = Consultant::factory()->published()->create(['slug' => 'live-profile']);
    $draft = Consultant::factory()->create(['slug' => 'draft-profile']);

    $this->actingAs($editor)->put(route('cms.consultants.update', ['consultant' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'specialty' => $published->specialty,
        'status' => 'published',
    ])->assertRedirect(route('cms.consultants.index'));
    $this->assertDatabaseHas('consultants', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.consultants.update', ['consultant' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'specialty' => $published->specialty,
        'status' => 'draft',
    ])->assertRedirect(route('cms.consultants.index'));
    $this->assertDatabaseHas('consultants', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.consultants.update', ['consultant' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'specialty' => $draft->specialty,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('consultants', ['id' => $draft->id, 'status' => 'draft']);
});

test('an approver can publish a draft consultant', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $draft = Consultant::factory()->create(['slug' => 'draft-profile']);

    $this->actingAs($approver)->put(route('cms.consultants.update', ['consultant' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'specialty' => $draft->specialty,
        'status' => 'published',
    ])->assertRedirect(route('cms.consultants.index'));
    $this->assertDatabaseHas('consultants', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with consultant edit rights can add consultants', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.consultants.store'), consultantPayload())->assertForbidden();
});
