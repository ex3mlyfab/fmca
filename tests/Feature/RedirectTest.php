<?php

use App\Models\Redirect;

test('an active redirect sends visitors to the new address', function () {
    Redirect::factory()->create([
        'from_path' => '/cardiology',
        'to_path' => '/services/cardiology',
    ]);

    $this->get('/cardiology')
        ->assertRedirect('/services/cardiology')
        ->assertStatus(301);
});

test('a temporary redirect returns a 302', function () {
    Redirect::factory()->temporary()->create([
        'from_path' => '/old-notice',
        'to_path' => '/news/old-notice',
    ]);

    $this->get('/old-notice')
        ->assertRedirect('/news/old-notice')
        ->assertStatus(302);
});

test('an inactive redirect does not apply', function () {
    Redirect::factory()->inactive()->create([
        'from_path' => '/cardiology',
        'to_path' => '/services/cardiology',
    ]);

    $this->get('/cardiology')->assertNotFound();
});

test('redirect lookup ignores the letter case of the visited path', function () {
    Redirect::factory()->create([
        'from_path' => '/cardiology',
        'to_path' => '/services/cardiology',
    ]);

    $this->get('/CARDIOLOGY')->assertRedirect('/services/cardiology');
});

test('a stored redirect to a protocol-relative target is not applied', function () {
    Redirect::factory()->create([
        'from_path' => '/legacy',
        'to_path' => '//evil.com/steal',
    ]);

    // The middleware refuses to send visitors off the host; the visited path
    // that matches no real route 404s instead of open-redirecting.
    $this->get('/legacy')->assertNotFound();
});

test('a stored redirect to an absolute external target is not applied', function () {
    Redirect::factory()->create([
        'from_path' => '/external',
        'to_path' => 'https://evil.com/steal',
    ]);

    $this->get('/external')->assertNotFound();
});
