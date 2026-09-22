<?php

use App\Models\CommitteeMember;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function committeePayload(): array
{
    return [
        'name' => 'New Committee Member',
        'slug' => 'new-committee-member',
        'role' => 'Head of Corporate Services',
        'portfolio' => 'Administrative & Corporate Services',
        'term' => '2025 to 2028',
        'sort_order' => 9,
        'mandate' => 'Completed and approved by FMCA Corporate Communications before publication.',
        'owner' => 'FMCA Corporate Communications',
    ];
}

/**
 * A user who may manage committee content but not publish it: the publish
 * gate has no seeded role for it, so the test builds one on the fly.
 */
function committeeEditorWithoutPublish(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'committee_editor_test', 'guard_name' => 'web'],
        ['description' => 'Test-only committee editor without publish rights']
    );
    $role->syncPermissions(['view_committees', 'edit_committees']);

    return User::factory()->create(['role_id' => $role->id]);
}

test('communications and super-admin roles can open the committee workspace, others cannot', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $admin = User::factory()->withRole('super_admin')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($communications)->get(route('cms.committees.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.committees.create'))->assertOk();
    $this->actingAs($admin)->get(route('cms.committees.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.committees.index'))->assertForbidden();
    $this->actingAs($media)->get(route('cms.committees.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.committees.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.committees.index'))->assertForbidden();
});

test('a communications editor creates a draft committee member', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($communications)->post(route('cms.committees.store'), committeePayload());

    $created = CommitteeMember::query()->latest()->first();
    $response->assertRedirect(route('cms.committees.edit', ['committeeMember' => $created->id]));
    $this->assertDatabaseHas('committee_members', [
        'name' => 'New Committee Member',
        'slug' => 'new-committee-member',
        'status' => 'draft',
    ]);
});

test('committee member slugs must be unique', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    CommitteeMember::factory()->create(['slug' => 'taken-slug']);

    $this->actingAs($communications)->post(route('cms.committees.store'), [...committeePayload(), 'slug' => 'taken-slug'])
        ->assertSessionHasErrors('slug');
});

test('a communications editor can publish a new committee member', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)->post(route('cms.committees.store'), [...committeePayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('committee_members', ['slug' => 'new-committee-member', 'status' => 'published']);
});

test('an editor without publish rights cannot publish a new committee member', function () {
    $editor = committeeEditorWithoutPublish();

    $this->actingAs($editor)->post(route('cms.committees.store'), [...committeePayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.committees.store'), committeePayload())->assertRedirect();
    $this->assertDatabaseHas('committee_members', ['slug' => 'new-committee-member', 'status' => 'draft']);
});

test('an editor without publish rights keeps a published member published or unpublishes it, but cannot publish a draft', function () {
    $editor = committeeEditorWithoutPublish();
    $published = CommitteeMember::factory()->published()->create(['slug' => 'live-member']);
    $draft = CommitteeMember::factory()->create(['slug' => 'draft-member']);

    $this->actingAs($editor)->put(route('cms.committees.update', ['committeeMember' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'role' => $published->role,
        'status' => 'published',
    ])->assertRedirect(route('cms.committees.index'));
    $this->assertDatabaseHas('committee_members', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.committees.update', ['committeeMember' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'role' => $published->role,
        'status' => 'draft',
    ])->assertRedirect(route('cms.committees.index'));
    $this->assertDatabaseHas('committee_members', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.committees.update', ['committeeMember' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'role' => $draft->role,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('committee_members', ['id' => $draft->id, 'status' => 'draft']);
});

test('a super admin can publish a draft committee member', function () {
    $admin = User::factory()->withRole('super_admin')->create();
    $draft = CommitteeMember::factory()->create(['slug' => 'draft-member']);

    $this->actingAs($admin)->put(route('cms.committees.update', ['committeeMember' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'role' => $draft->role,
        'status' => 'published',
    ])->assertRedirect(route('cms.committees.index'));
    $this->assertDatabaseHas('committee_members', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with committee edit rights can add committee members', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.committees.store'), committeePayload())->assertForbidden();
});
