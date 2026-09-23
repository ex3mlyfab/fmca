<?php

use App\Models\SiteMenuItem;
use Database\Seeders\SiteMenuSeeder;

test('the public site exposes only published menu items in sort order', function () {
    SiteMenuItem::factory()->published()->create(['label' => 'Member A', 'href' => '/a', 'sort_order' => 2]);
    SiteMenuItem::factory()->published()->create(['label' => 'Member B', 'href' => '/b', 'sort_order' => 1]);
    SiteMenuItem::factory()->create(['label' => 'Member C (draft)', 'href' => '/c', 'sort_order' => 0]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('siteMenu', fn ($items) => collect($items)
            ->pluck('label')
            ->all() === ['Member B', 'Member A']));
});

test('draft menu items are not exposed to the public site', function () {
    SiteMenuItem::factory()->create(['label' => 'Draft Item', 'href' => '/draft']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('siteMenu', fn ($items) => collect($items)->all() === []));
});

test('the public menu carries label, destination and position for each item', function () {
    SiteMenuItem::factory()->published()->create(['label' => 'Services', 'href' => '/services', 'sort_order' => 2]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('siteMenu', fn ($items) => collect($items)->all() === [
            ['label' => 'Services', 'href' => '/services', 'sort_order' => 2],
        ]));
});

test('the seeder publishes the four default public header entries', function () {
    (new SiteMenuSeeder)->run();

    $this->assertDatabaseHas('site_menu_items', ['label' => 'About FMCA', 'href' => '/', 'status' => 'published']);
    $this->assertDatabaseHas('site_menu_items', ['label' => 'Services', 'href' => '/services', 'status' => 'published']);
    $this->assertDatabaseHas('site_menu_items', ['label' => 'Patients & Visitors', 'href' => '/patients', 'status' => 'published']);
    $this->assertDatabaseHas('site_menu_items', ['label' => 'News & Updates', 'href' => '/news', 'status' => 'published']);

    expect(SiteMenuItem::query()->count())->toBe(4);
    expect(SiteMenuItem::query()->published()->count())->toBe(4);
});

test('the site menu seeder is idempotent', function () {
    (new SiteMenuSeeder)->run();
    $countBefore = SiteMenuItem::query()->count();

    (new SiteMenuSeeder)->run();

    expect(SiteMenuItem::query()->count())->toBe($countBefore);
});
