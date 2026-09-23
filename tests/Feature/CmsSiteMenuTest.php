<?php

use App\Models\Role;
use App\Models\SiteMenuItem;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function menuItemPayload(): array
{
    return [
        'label' => 'New Menu Item',
        'href' => '/new-menu-item',
        'sort_order' => 9,
        'owner' => 'FMCA Corporate Communications',
    ];
}

/**
 * A user who may manage the site menu but not publish it: the publish gate
 * has no seeded role for it, so the test builds one on the fly.
 */
function menuItemEditorWithoutPublish(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'site_menu_editor_test', 'guard_name' => 'web'],
        ['description' => 'Test-only site menu editor without publish rights']
    );
    $role->syncPermissions(['view_site_menu', 'edit_site_menu']);

    return User::factory()->create(['role_id' => $role->id]);
}

test('communications and super-admin roles can open the site menu workspace, others cannot', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $admin = User::factory()->withRole('super_admin')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($communications)->get(route('cms.site-menu.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.site-menu.create'))->assertOk();
    $this->actingAs($admin)->get(route('cms.site-menu.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.site-menu.index'))->assertForbidden();
    $this->actingAs($media)->get(route('cms.site-menu.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.site-menu.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.site-menu.index'))->assertForbidden();
});

test('a communications editor creates a draft menu item', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($communications)->post(route('cms.site-menu.store'), menuItemPayload());

    $created = SiteMenuItem::query()->where('href', '/new-menu-item')->first();
    $response->assertRedirect(route('cms.site-menu.edit', ['item' => $created->id]));
    $this->assertDatabaseHas('site_menu_items', [
        'label' => 'New Menu Item',
        'href' => '/new-menu-item',
        'sort_order' => 9,
        'status' => 'draft',
    ]);
});

test('menu destinations must be an internal path, anchor or http(s) url', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    foreach (['javascript:alert(1)', '//evil.example', 'data:text/html,<script>', 'http:/malformed', ''] as $unsafe) {
        $this->actingAs($communications)->post(route('cms.site-menu.store'), [...menuItemPayload(), 'href' => $unsafe])
            ->assertSessionHasErrors('href');
    }

    $this->actingAs($communications)->post(route('cms.site-menu.store'), [...menuItemPayload(), 'href' => '/patients'])
        ->assertRedirect();
    $this->assertDatabaseHas('site_menu_items', ['href' => '/patients']);
});

test('a communications editor can publish a new menu item', function () {
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)->post(route('cms.site-menu.store'), [...menuItemPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('site_menu_items', ['href' => '/new-menu-item', 'status' => 'published']);
});

test('an editor without publish rights cannot publish a new menu item', function () {
    $editor = menuItemEditorWithoutPublish();

    $this->actingAs($editor)->post(route('cms.site-menu.store'), [...menuItemPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.site-menu.store'), menuItemPayload())->assertRedirect();
    $this->assertDatabaseHas('site_menu_items', ['href' => '/new-menu-item', 'status' => 'draft']);
});

test('an editor without publish rights keeps a published item published or unpublishes it, but cannot publish a draft', function () {
    $editor = menuItemEditorWithoutPublish();
    $published = SiteMenuItem::factory()->published()->create(['label' => 'Live Item', 'href' => '/live-item']);
    $draft = SiteMenuItem::factory()->create(['label' => 'Draft Item', 'href' => '/draft-item']);

    $this->actingAs($editor)->put(route('cms.site-menu.update', ['item' => $published->id]), [
        'label' => $published->label,
        'href' => $published->href,
        'status' => 'published',
    ])->assertRedirect(route('cms.site-menu.index'));
    $this->assertDatabaseHas('site_menu_items', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.site-menu.update', ['item' => $published->id]), [
        'label' => $published->label,
        'href' => $published->href,
        'status' => 'draft',
    ])->assertRedirect(route('cms.site-menu.index'));
    $this->assertDatabaseHas('site_menu_items', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.site-menu.update', ['item' => $draft->id]), [
        'label' => $draft->label,
        'href' => $draft->href,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('site_menu_items', ['id' => $draft->id, 'status' => 'draft']);
});

test('a super admin can publish a draft menu item', function () {
    $admin = User::factory()->withRole('super_admin')->create();
    $draft = SiteMenuItem::factory()->create(['label' => 'Draft Item', 'href' => '/draft-item']);

    $this->actingAs($admin)->put(route('cms.site-menu.update', ['item' => $draft->id]), [
        'label' => $draft->label,
        'href' => $draft->href,
        'status' => 'published',
    ])->assertRedirect(route('cms.site-menu.index'));
    $this->assertDatabaseHas('site_menu_items', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with site menu edit rights can add menu items', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.site-menu.store'), menuItemPayload())->assertForbidden();
});
