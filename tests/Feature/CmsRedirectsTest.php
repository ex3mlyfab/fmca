<?php

use App\Models\Redirect;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function redirectPayload(): array
{
    return [
        'from_path' => '/cardiology-clinic',
        'to_path' => '/services/cardiology',
        'status_code' => 301,
        'is_active' => true,
    ];
}

test('redirect managers can open the redirects workspace', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->get(route('cms.redirects.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.redirects.create'))->assertOk();
});

test('a user without redirect permissions is forbidden', function () {
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($auditor)->get(route('cms.redirects.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.redirects.index'))->assertForbidden();
});

test('an editor stores a new redirect', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), redirectPayload())
        ->assertRedirect(route('cms.redirects.edit', ['redirect' => 1]));

    $this->assertDatabaseHas('redirects', [
        'from_path' => '/cardiology-clinic',
        'to_path' => '/services/cardiology',
        'status_code' => 301,
        'is_active' => true,
    ]);
});

test('from paths are normalized before validation', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), [
            'from_path' => 'CARDIOLOGY',
            'to_path' => '/services/cardiology',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('redirects', ['from_path' => '/cardiology']);
});

test('a from path containing spaces is rejected', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), [
            'from_path' => 'old /service',
            'to_path' => '/services/old',
        ])
        ->assertSessionHasErrors('from_path');

    expect(Redirect::query()->count())->toBe(0);
});

test('from paths must be unique across the redirect table', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    Redirect::factory()->create(['from_path' => '/cardiology-clinic']);

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), redirectPayload())
        ->assertSessionHasErrors('from_path');
});

test('the redirect type must be a supported status code', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), array_merge(redirectPayload(), ['status_code' => 307]))
        ->assertSessionHasErrors('status_code');
});

test('a to path must stay inside the application', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    // An absolute URL would let an editor point the hospital domain at an
    // external site; the rule rejects anything that is not a local path.
    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), array_merge(redirectPayload(), ['to_path' => 'https://evil.com/steal']))
        ->assertSessionHasErrors('to_path');

    $this->actingAs($editor)
        ->post(route('cms.redirects.store'), array_merge(redirectPayload(), ['to_path' => '//evil.com/steal']))
        ->assertSessionHasErrors('to_path');

    expect(Redirect::query()->where('to_path', 'like', '%evil.com%')->exists())->toBeFalse();
});

test('a user without redirect permissions cannot store redirects', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)
        ->post(route('cms.redirects.store'), redirectPayload())
        ->assertForbidden();
});

test('an editor updates a redirect and can pause it', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $redirect = Redirect::factory()->create(['from_path' => '/old', 'to_path' => '/new']);

    $this->actingAs($editor)
        ->put(route('cms.redirects.update', ['redirect' => $redirect->id]), [
            'from_path' => '/old',
            'to_path' => '/new-destination',
            'is_active' => false,
        ])
        ->assertRedirect(route('cms.redirects.index'));

    $this->assertDatabaseHas('redirects', [
        'id' => $redirect->id,
        'to_path' => '/new-destination',
        'is_active' => false,
    ]);
});
