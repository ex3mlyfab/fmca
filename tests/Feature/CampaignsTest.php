<?php

use App\Models\Campaign;

test('the home page lists only published campaigns inside their active window', function () {
    Campaign::factory()->published()->alwaysOn()->create(['title' => 'Always on campaign']);
    Campaign::factory()->published()->create([
        'title' => 'Windowed campaign',
        'start_date' => now()->subDay()->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
    ]);
    Campaign::factory()->create(['title' => 'Hidden draft']);
    Campaign::factory()->create(['title' => 'In review', 'status' => 'review']);
    Campaign::factory()->published()->create([
        'title' => 'Future start',
        'start_date' => now()->addWeek()->toDateString(),
    ]);
    Campaign::factory()->published()->create([
        'title' => 'Expired',
        'end_date' => now()->subDay()->toDateString(),
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->where('campaigns', fn ($campaigns) => collect($campaigns)->count() === 2
                && collect($campaigns)->pluck('title')->contains('Always on campaign')
                && collect($campaigns)->pluck('title')->contains('Windowed campaign')
                && ! collect($campaigns)->pluck('title')->contains('Hidden draft')
                && ! collect($campaigns)->pluck('title')->contains('In review')
                && ! collect($campaigns)->pluck('title')->contains('Future start')
                && ! collect($campaigns)->pluck('title')->contains('Expired')));
});

test('active campaigns are ordered by sort order', function () {
    $first = Campaign::factory()->published()->alwaysOn()->create([
        'title' => 'First slide',
        'sort_order' => 0,
    ]);
    Campaign::factory()->published()->alwaysOn()->create([
        'title' => 'Second slide',
        'sort_order' => 1,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where('campaigns.0.id', $first->id)
            ->where('campaigns.1.title', 'Second slide'));
});

test('the campaign payload carries the carousel fields', function () {
    $campaign = Campaign::factory()->published()->alwaysOn()->advisory()->create([
        'eyebrow' => 'Tertiary Care',
        'copy' => 'Clear, compassionate guidance.',
        'primary_cta_label' => 'Find services',
        'primary_cta_href' => '#services',
        'secondary_cta_label' => 'About FMCA',
        'secondary_cta_href' => '#about',
        'owner' => 'FMCA Communications',
        'focal_point' => 'top',
        'overlay_intensity' => 60,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where('campaigns.0.id', $campaign->id)
            ->where('campaigns.0.eyebrow', 'Tertiary Care')
            ->where('campaigns.0.primaryCtaLabel', 'Find services')
            ->where('campaigns.0.primaryCtaHref', '#services')
            ->where('campaigns.0.secondaryCtaLabel', 'About FMCA')
            ->where('campaigns.0.owner', 'FMCA Communications')
            ->where('campaigns.0.focalPoint', 'top')
            ->where('campaigns.0.advisory', true)
            ->where('campaigns.0.overlayIntensity', 60));
});

test('the home page has no campaigns when none are published or active', function () {
    Campaign::factory()->create(['title' => 'Draft only']);
    Campaign::factory()->published()->create([
        'title' => 'Expired',
        'end_date' => now()->subDay()->toDateString(),
    ]);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->where('campaigns', fn ($campaigns) => collect($campaigns)->count() === 0));
});
