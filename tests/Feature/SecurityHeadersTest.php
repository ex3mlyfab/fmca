<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

test('public responses are protected against clickjacking with a same-origin frame guard', function () {
    $this->get(route('home'))->assertOk()->assertHeader('X-Frame-Options', 'SAMEORIGIN');
});

test('the cms workspace is also frame-protected', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->get(route('cms.pages.index'))
        ->assertOk()
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN');
});

test('a malicious appearance cookie is not reflected into the page script', function () {
    $response = $this->withUnencryptedCookie('appearance', "system}; alert('xss') //")
        ->get(route('home'))
        ->assertOk();

    // The middleware whitelists to a known value, so the raw payload never reaches the browser.
    $response->assertSee("const appearance = 'system'", false);
    $this->assertStringNotContainsString("alert('xss')", $response->getContent());
});

test('a valid appearance cookie is reflected as its safe escaped value', function () {
    $this->withUnencryptedCookie('appearance', 'dark')->get(route('home'))
        ->assertOk()
        ->assertSee("const appearance = 'dark'", false);
});
