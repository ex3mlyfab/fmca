<?php

use App\Models\Partner;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function partnerPayload(): array
{
    return [
        'name' => 'Referral Health Network',
        'logo' => '/media/2026/09/referral-health.png',
        'website_url' => 'https://example.org',
        'sort_order' => 3,
        'owner' => 'FMCA Corporate Communications',
        'reviewed_at' => now()->toDateString(),
    ];
}

/**
 * A user who may manage partner content but not publish it: the publish gate
 * has no seeded role for it, so the test builds one on the fly.
 */
function partnerEditorWithoutPublish(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'partner_editor_test', 'guard_name' => 'web'],
        ['description' => 'Test-only partner editor without publish rights']
    );
    $role->syncPermissions(['view_partners', 'edit_partners']);

    return User::factory()->create(['role_id' => $role->id]);
}

test('communications and super-admin roles can open the partner workspace, others cannot', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $admin = User::factory()->withRole('super_admin')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($communications)->get(route('cms.partners.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.partners.create'))->assertOk();
    $this->actingAs($admin)->get(route('cms.partners.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.partners.index'))->assertForbidden();
    $this->actingAs($media)->get(route('cms.partners.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.partners.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.partners.index'))->assertForbidden();
});

test('a communications editor creates a draft partner', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($communications)->post(route('cms.partners.store'), partnerPayload());

    $created = Partner::query()->latest()->first();
    $response->assertRedirect(route('cms.partners.edit', ['partner' => $created->id]));
    $this->assertDatabaseHas('partners', [
        'name' => 'Referral Health Network',
        'logo' => '/media/2026/09/referral-health.png',
        'website_url' => 'https://example.org',
        'sort_order' => 3,
        'status' => 'draft',
    ]);
});

test('a partner requires a name and a logo', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->post(route('cms.partners.store'), ['name' => '', 'logo' => ''])
        ->assertSessionHasErrors(['name', 'logo']);
});

test('an unsanctioned link scheme is rejected for partner logos and partner websites', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->post(route('cms.partners.store'), [...partnerPayload(), 'logo' => 'javascript:alert(1)'])
        ->assertSessionHasErrors('logo');

    $this->actingAs($communications)
        ->post(route('cms.partners.store'), [...partnerPayload(), 'website_url' => 'javascript:alert(1)'])
        ->assertSessionHasErrors('website_url');
});

test('a communications editor can publish a new partner', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)->post(route('cms.partners.store'), [...partnerPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('partners', ['name' => 'Referral Health Network', 'status' => 'published']);
});

test('an editor without publish rights cannot publish a new partner', function () {
    $editor = partnerEditorWithoutPublish();

    $this->actingAs($editor)->post(route('cms.partners.store'), [...partnerPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.partners.store'), partnerPayload())->assertRedirect();
    $this->assertDatabaseHas('partners', ['name' => 'Referral Health Network', 'status' => 'draft']);
});

test('an editor without publish rights keeps a published partner published or unpublishes it, but cannot publish a draft', function () {
    $editor = partnerEditorWithoutPublish();
    $published = Partner::factory()->published()->create(['name' => 'Live Partner']);
    $draft = Partner::factory()->create(['name' => 'Draft Partner']);

    $this->actingAs($editor)->put(route('cms.partners.update', ['partner' => $published->id]), [
        'name' => $published->name,
        'logo' => $published->logo,
        'status' => 'published',
    ])->assertRedirect(route('cms.partners.index'));
    $this->assertDatabaseHas('partners', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.partners.update', ['partner' => $published->id]), [
        'name' => $published->name,
        'logo' => $published->logo,
        'status' => 'draft',
    ])->assertRedirect(route('cms.partners.index'));
    $this->assertDatabaseHas('partners', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.partners.update', ['partner' => $draft->id]), [
        'name' => $draft->name,
        'logo' => $draft->logo,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('partners', ['id' => $draft->id, 'status' => 'draft']);
});

test('a super admin can publish a draft partner', function () {
    $admin = User::factory()->withRole('super_admin')->create();
    $draft = Partner::factory()->create(['name' => 'Draft Partner']);

    $this->actingAs($admin)->put(route('cms.partners.update', ['partner' => $draft->id]), [
        'name' => $draft->name,
        'logo' => $draft->logo,
        'status' => 'published',
    ])->assertRedirect(route('cms.partners.index'));
    $this->assertDatabaseHas('partners', ['id' => $draft->id, 'status' => 'published']);
});

test('an editor can revise a partner logo and ordering', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $partner = Partner::factory()->create(['name' => 'Original Partner']);

    $this->actingAs($communications)->put(route('cms.partners.update', ['partner' => $partner->id]), [
        'name' => 'Renamed Partner',
        'logo' => '/media/2026/09/renamed-partner.png',
        'sort_order' => 7,
        'status' => 'published',
    ])->assertRedirect(route('cms.partners.index'));
    $this->assertDatabaseHas('partners', [
        'id' => $partner->id,
        'name' => 'Renamed Partner',
        'logo' => '/media/2026/09/renamed-partner.png',
        'sort_order' => 7,
        'status' => 'published',
    ]);
});

test('partners are listed by sort order, then name', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $zeta = Partner::factory()->create(['name' => 'Zeta Labs', 'sort_order' => 5]);
    $alpha = Partner::factory()->create(['name' => 'Alpha Health', 'sort_order' => 5]);
    $first = Partner::factory()->create(['name' => 'Early Partner', 'sort_order' => 1]);

    $this->actingAs($communications)->get(route('cms.partners.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/partners/index')
            ->where('partners', fn ($partners) => collect($partners)->pluck('id')->all() === [$first->id, $alpha->id, $zeta->id]));
});

test('only staff with partner edit rights can add partners', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.partners.store'), partnerPayload())->assertForbidden();
});

test('staff with partner edit rights can remove a partner', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $partner = Partner::factory()->create(['name' => 'Retired Partner']);

    $this->actingAs($communications)
        ->delete(route('cms.partners.destroy', ['partner' => $partner->id]))
        ->assertRedirect(route('cms.partners.index'));
    $this->assertDatabaseMissing('partners', ['id' => $partner->id]);
});

test('staff without partner edit rights cannot remove a partner', function () {
    $auditor = User::factory()->withRole('auditor')->create();
    $partner = Partner::factory()->create();

    $this->actingAs($auditor)
        ->delete(route('cms.partners.destroy', ['partner' => $partner->id]))
        ->assertForbidden();
    $this->assertDatabaseHas('partners', ['id' => $partner->id]);
});
