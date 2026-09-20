<?php

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageTemplate;
use Database\Seeders\PageTemplateSeeder;
use Illuminate\Support\Facades\Route;

test('the template registry creates exactly the twelve required templates', function () {
    (new PageTemplateSeeder)->run();

    expect(PageTemplate::query()->count())->toBe(12);
    expect(PageTemplate::query()->where('key', 'patient_guide')->firstOrFail()->permitted_blocks)
        ->toBe(['steps', 'alert', 'faq', 'document_list', 'cta', 'contact_panel']);
});

test('the template registry is idempotent', function () {
    (new PageTemplateSeeder)->run();
    (new PageTemplateSeeder)->run();

    expect(PageTemplate::query()->count())->toBe(12);
});

test('each routable template gets one public route', function () {
    $routeNames = collect(array_keys(Route::getRoutes()->getRoutesByName()))
        ->filter(fn (string $name) => str_starts_with($name, 'page.'))
        ->values()
        ->all();

    expect($routeNames)->toBe([
        'page.institutional',
        'page.patient_guide',
        'page.publication',
        'page.career',
        'page.event',
        'page.legal',
    ]);
});

test('a published patient guide renders with its content blocks', function () {
    $guide = Page::factory()->published()->create([
        'slug' => 'visiting-hours',
        'title' => 'Visiting hours',
        'owner' => 'FMCA Patient Services',
        'reviewed_at' => now(),
    ]);
    PageBlock::factory()->for($guide)->steps()->create();
    PageBlock::factory()->for($guide)->contactPanel()->create();

    $this->get(route('page.patient_guide', ['slug' => 'visiting-hours']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('page')
            ->where('page.title', 'Visiting hours')
            ->where('page.owner', 'FMCA Patient Services')
            ->where('page.template.key', 'patient_guide')
            ->where('page.reviewed_at', now()->format('j M Y'))
            ->where('page.blocks', fn ($blocks) => collect($blocks)->count() === 2
                && collect($blocks)->pluck('block_key')->sort()->values()->all() === ['contact_panel', 'steps']));
});

test('a published institutional page renders at its about URL', function () {
    Page::factory()->published()->create([
        'template_id' => PageTemplate::factory()->institutional()->create()->id,
        'slug' => 'group',
        'title' => 'Group',
        'owner' => 'FMCA Communications',
        'summary' => 'About the group.',
    ]);

    $this->get(route('page.institutional', ['slug' => 'group']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('page')
            ->where('page.title', 'Group'));
});

test('a draft page is not reachable publicly', function () {
    Page::factory()->create(['slug' => 'secret-policy']);

    $this->get(route('page.patient_guide', ['slug' => 'secret-policy']))
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('errors/404'));
});

test('an unknown slug renders the 404 page', function () {
    $this->get(route('page.legal', ['slug' => 'no-such-statement']))
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('errors/404'));
});

test('a page is only reachable through its own template route', function () {
    Page::factory()->published()->create([
        'template_id' => PageTemplate::factory()->institutional()->create()->id,
        'slug' => 'shared-slug',
        'title' => 'Group',
        'owner' => 'FMCA Communications',
        'summary' => 'About the group.',
    ]);

    $this->get(route('page.institutional', ['slug' => 'shared-slug']))->assertOk();
    $this->get(route('page.patient_guide', ['slug' => 'shared-slug']))
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('errors/404'));
});
