<?php

use App\Models\HomeConfiguration;
use App\Models\User;
use Illuminate\Support\Carbon;

test('the public home page renders the controlled Inertia page', function () {
    $response = $this->get(route('home'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('home')
        ->where('configuration', []));
});

test('only approved CMS roles can access the homepage workspace', function () {
    $editor = User::factory()->create(['role' => 'communications_editor']);
    $auditor = User::factory()->create(['role' => 'auditor']);

    $this->actingAs($editor)->get(route('cms.homepage.edit'))->assertOk();
    $this->actingAs($auditor)->get(route('cms.homepage.edit'))->assertForbidden();
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
    $editor = User::factory()->create(['role' => 'communications_editor']);

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
    $editor = User::factory()->create(['role' => 'communications_editor']);

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
