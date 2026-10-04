<?php

use App\Models\HomeConfiguration;
use App\Models\Partner;
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Carbon;

test('the public home page renders the controlled Inertia page', function () {
    $response = $this->get(route('home'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('home')
        ->where('configuration', []));
});

test('only approved CMS roles can access the homepage workspace', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($editor)->get(route('cms.homepage.edit'))->assertOk();
    $this->actingAs($auditor)->get(route('cms.homepage.edit'))->assertOk();
    $this->actingAs($noRole)->get(route('cms.homepage.edit'))->assertForbidden();
});

test('the public home only receives an active published configuration', function () {
    HomeConfiguration::factory()->create([
        'status' => 'published',
        'sections' => ['hero' => ['title' => 'Approved demo content']],
        'published_at' => now(),
    ]);
    HomeConfiguration::factory()->create([
        'status' => 'published',
        'sections' => ['hero' => ['title' => 'Future content']],
        'publish_at' => Carbon::now()->addDay(),
        'published_at' => Carbon::now()->addDay(),
    ]);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('configuration.hero.title', 'Approved demo content'));
});

test('an editor can save a validated homepage draft', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.homepage.store'), [
        'hero_title' => 'A reviewed demo title',
        'hero_summary' => 'A reviewed demo summary for the homepage.',
    ]);

    $response->assertRedirect(route('cms.homepage.edit'));
    $this->assertDatabaseHas('home_configurations', [
        'status' => 'draft',
    ]);
    expect(HomeConfiguration::query()->latest()->first()->sections['hero']['title'])
        ->toBe('A reviewed demo title');
});

test('an editor can save emergency and status fields in a homepage draft', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.homepage.store'), [
        'hero_title' => 'Emergency Response Title',
        'hero_summary' => 'Emergency response summary details.',
        'emergency_message' => 'Custom triage advisory message.',
        'emergency_phone' => '+2348000000000',
        'campus_status' => 'Surge capacity active',
        'service_desk' => 'Desk operating at station 2',
    ]);

    $response->assertRedirect(route('cms.homepage.edit'));
    $config = HomeConfiguration::query()->latest()->first();
    expect($config->sections['emergency']['message'])->toBe('Custom triage advisory message.')
        ->and($config->sections['emergency']['phone'])->toBe('+2348000000000')
        ->and($config->sections['status']['campusStatus'])->toBe('Surge capacity active')
        ->and($config->sections['status']['serviceDesk'])->toBe('Desk operating at station 2');
});

test('the home page surfaces the newest published news with feature images', function () {
    $recent = Post::factory()->published()->create([
        'slug' => 'recent-news',
        'publish_date' => now()->toDateString(),
        'feature_image' => '/media/2026/09/recent.jpg',
        'feature_image_alt' => 'Recent announcement',
    ]);
    Post::factory()->published()->create([
        'slug' => 'older-news',
        'publish_date' => now()->subWeek()->toDateString(),
    ]);
    Post::factory()->create([
        'slug' => 'draft-news',
        'publish_date' => now()->toDateString(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->where('news.0.id', $recent->id)
            ->where('news.0.featureImage', '/media/2026/09/recent.jpg')
            ->where('news', fn ($news) => collect($news)->count() === 2
                && ! collect($news)->pluck('slug')->contains('draft-news')));
});

test('the home page lists published partners by sort order', function () {
    $second = Partner::factory()->published()->create(['name' => 'Second Partner', 'sort_order' => 2]);
    $first = Partner::factory()->published()->withWebsite('https://example.org')->create([
        'name' => 'First Partner',
        'sort_order' => 1,
    ]);
    Partner::factory()->create(['name' => 'Draft Partner', 'sort_order' => 0]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->where('partners.0.id', $first->id)
            ->where('partners.0.name', 'First Partner')
            ->where('partners.0.websiteUrl', 'https://example.org')
            ->where('partners.1.id', $second->id)
            ->where('partners.1.websiteUrl', null)
            ->where('partners', fn ($partners) => collect($partners)->count() === 2));
});

test('the home page gets an empty partner list when none is published', function () {
    Partner::factory()->create(['name' => 'Draft Partner']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('partners', []));
});
