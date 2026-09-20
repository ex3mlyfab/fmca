<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

test('role_permission_seeder creates expected roles and permissions', function () {
    (new RolePermissionSeeder)->run();

    expect(Role::count())->toBe(6);
    expect(Permission::count())->toBeGreaterThan(0);
    expect(Role::where('name', 'super_admin')->exists())->toBeTrue();
    expect(Role::where('name', 'auditor')->exists())->toBeTrue();
});

test('seeder is idempotent', function () {
    (new RolePermissionSeeder)->run();
    $permCountBefore = Permission::count();
    $roleCountBefore = Role::count();

    (new RolePermissionSeeder)->run();

    expect(Permission::count())->toBe($permCountBefore);
    expect(Role::count())->toBe($roleCountBefore);
});

test('super_admin role has all permissions', function () {
    (new RolePermissionSeeder)->run();

    $superAdmin = Role::where('name', 'super_admin')->first();
    expect($superAdmin->permissions->pluck('name')->sort()->values()->all())
        ->toMatchArray(collect(Permission::all()->pluck('name'))->sort()->values()->all());
});

test('auditor has only expected permissions', function () {
    (new RolePermissionSeeder)->run();

    $auditor = Role::where('name', 'auditor')->first();
    expect($auditor->permissions->pluck('name')->sort()->values()->all())
        ->toMatchArray(['view_audit_logs', 'view_homepage', 'view_users']);
});

test('communications_editor cannot manage_roles', function () {
    (new RolePermissionSeeder)->run();

    $editor = Role::where('name', 'communications_editor')->first();
    expect($editor->permissions->where('name', 'manage_roles')->count())->toBe(0);
});

test('user hasPermission returns true when role grants permission', function () {
    (new RolePermissionSeeder)->run();

    $user = User::factory()->withRole('communications_editor')->create();
    expect($user->hasPermission('publish_news'))->toBeTrue();
    expect($user->hasPermission('manage_roles'))->toBeFalse();
    expect($user->hasPermission('delete_pages'))->toBeFalse();
});

test('user hasPermission returns false with no role', function () {
    (new RolePermissionSeeder)->run();

    $user = User::factory()->create();
    expect($user->hasPermission('view_homepage'))->toBeFalse();
});

test('canManageHomepage delegates to view_homepage permission', function () {
    (new RolePermissionSeeder)->run();

    $auditor = User::factory()->withRole('auditor')->create();
    $editor = User::factory()->withRole('communications_editor')->create();

    expect($auditor->canManageHomepage())->toBeTrue();
    expect($editor->canManageHomepage())->toBeTrue();

    $noRole = User::factory()->create();
    expect($noRole->canManageHomepage())->toBeFalse();
});

test('department_editor cannot publish_news', function () {
    (new RolePermissionSeeder)->run();

    $user = User::factory()->withRole('department_editor')->create();
    expect($user->hasPermission('publish_news'))->toBeFalse();
    expect($user->hasPermission('edit_news'))->toBeTrue();
});

test('policy respects permission-based checks', function () {
    (new RolePermissionSeeder)->run();

    $admin = User::factory()->withRole('super_admin')->create();
    $auditor = User::factory()->withRole('auditor')->create();

    expect($admin->hasPermission('manage_roles'))->toBeTrue();
    expect($auditor->hasPermission('manage_roles'))->toBeFalse();
});

test('role hasPermission method works directly', function () {
    (new RolePermissionSeeder)->run();

    $role = Role::where('name', 'department_editor')->first();
    expect($role->hasPermission('edit_departments'))->toBeTrue();
    expect($role->hasPermission('publish_news'))->toBeFalse();
});

test('role syncPermissions updates permissions', function () {
    (new RolePermissionSeeder)->run();

    $role = Role::where('name', 'auditor')->first();
    $before = $role->permissions->count();

    $role->syncPermissions(['view_audit_logs', 'manage_roles']);
    $role->load('permissions');
    expect($role->permissions->where('name', 'manage_roles')->count())->toBe(1);
    expect($role->permissions->count())->toBe(2);

    $role->syncPermissions(['view_audit_logs']);
    $role->load('permissions');
    expect($role->permissions->count())->toBe(1);
});

test('permission users relation resolves users through their roles', function () {
    (new RolePermissionSeeder)->run();

    $editor = User::factory()->withRole('communications_editor')->create();
    $publishNews = Permission::where('name', 'publish_news')->first();

    expect($publishNews->users()->pluck('id')->all())->toContain($editor->id);

    $noRole = User::factory()->create();
    expect($publishNews->users()->pluck('id')->all())->not->toContain($noRole->id);
});
