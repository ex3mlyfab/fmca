<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Ssr\Gateway;
use Inertia\Ssr\Response as SsrResponse;

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

test('every response sets the browser MIME-type and referrer guards', function () {
    $this->get(route('home'))
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('html responses carry a nonce-based content security policy', function () {
    $response = $this->get(route('home'))->assertOk();

    $csp = $response->headers->get('Content-Security-Policy');

    expect($csp)
        ->not->toBeNull()
        ->toContain("default-src 'self'")
        ->toContain("script-src 'self' 'nonce-")
        ->toContain("object-src 'none'");

    // The inline Inertia page-props script is granted by a nonce that must match the header.
    preg_match("/'nonce-([A-Za-z0-9_-]+)'/", $csp, $match);
    $nonce = $match[1] ?? '';

    expect($nonce)->not->toBeEmpty();
    $response->assertSee(sprintf('<script nonce="%s" data-page="app"', $nonce), false);
});

test('the content security policy nonce is shared with authenticated cms pages', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->get(route('cms.pages.index'))->assertOk();

    $csp = $response->headers->get('Content-Security-Policy');

    expect($csp)->not->toBeNull();

    preg_match("/'nonce-([A-Za-z0-9_-]+)'/", $csp, $match);
    $nonce = $match[1] ?? '';

    expect($nonce)->not->toBeEmpty();
    $response->assertSee(sprintf('<script nonce="%s" data-page="app"', $nonce), false);
});

test('the content security policy nonce is stamped onto a server-side rendered payload', function () {
    // The SSR gateway emits its own data-page script and cannot know the nonce;
    // App\View\Components\InertiaApp stamps it onto the response when it renders.
    $this->app->instance(Gateway::class, new class implements Gateway
    {
        public function dispatch(array $page): ?SsrResponse
        {
            return new SsrResponse(
                '',
                '<script data-page="app" type="application/json">{"component":"home"}</script><div id="app"></div>',
            );
        }
    });

    $response = $this->get(route('home'))->assertOk();

    $csp = $response->headers->get('Content-Security-Policy');

    expect($csp)->not->toBeNull();

    preg_match("/'nonce-([A-Za-z0-9_-]+)'/", $csp, $match);
    $nonce = $match[1] ?? '';

    expect($nonce)->not->toBeEmpty();
    $response->assertSee(sprintf('<script nonce="%s" data-page="app"', $nonce), false);
});

test('feature tests render the server-side payload rather than a server-side rendered body', function () {
    // Tests\TestCase disables the Inertia SSR gateway: the suite must not render
    // through a live SSR engine, which in development is the Vite dev server.
    $this->get(route('home'))->assertSee('<div id="app"></div>', false);
});

test('the content security policy is omitted on non-html responses', function () {
    // A 404 to an unknown API path renders JSON; CSP is scoped to HTML payloads only.
    $this->get('/api/nonexistent')->assertHeaderMissing('Content-Security-Policy');
});
