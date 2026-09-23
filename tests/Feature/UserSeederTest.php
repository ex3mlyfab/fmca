<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Support\Facades\Hash;

test('user seeder creates the test user with the super_admin role', function () {
    (new UserSeeder)->run();

    $user = User::where('email', 'test@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Test User')
        ->and($user->role_id)->toBe(Role::where('name', 'super_admin')->value('id'));
});

test('the seeded test user can log in with the default password', function () {
    (new UserSeeder)->run();

    $user = User::where('email', 'test@example.com')->first();

    expect(Hash::check('password', $user->password))->toBeTrue();
});

test('the seeded test user holds admin permissions', function () {
    (new UserSeeder)->run();

    $user = User::where('email', 'test@example.com')->first();

    expect($user->role->name)->toBe('super_admin')
        ->and($user->hasPermission('manage_roles'))->toBeTrue()
        ->and($user->hasPermission('view_audit_logs'))->toBeTrue();
});

test('user seeder is idempotent', function () {
    (new UserSeeder)->run();
    $usersBefore = User::count();

    (new UserSeeder)->run();

    $user = User::where('email', 'test@example.com')->first();

    expect(User::count())->toBe($usersBefore)
        ->and($user->role_id)->toBe(Role::where('name', 'super_admin')->value('id'));
});
