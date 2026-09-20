<?php

use App\Models\Page;
use App\Models\PageTemplate;
use Database\Seeders\PageSeeder;
use Database\Seeders\PageTemplateSeeder;
use Database\Seeders\PatientGuideSeeder;

test('the patient guides index lists only published patient guides', function () {
    (new PageTemplateSeeder)->run();

    Page::factory()->published()->create(['slug' => 'visiting', 'reviewed_at' => now()]);
    Page::factory()->create(['slug' => 'billing']);
    Page::factory()->published()->create([
        'template_id' => PageTemplate::query()->where('key', 'institutional')->first()->id,
        'slug' => 'group',
    ]);

    $this->get(route('patients'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('patient-guides')
            ->where('guides.0.slug', 'visiting')
            ->where('guides.0.reviewed_at', now()->format('j M Y'))
            ->where('guides', fn ($guides) => collect($guides)->pluck('slug')->all() === ['visiting']));
});

test('the patient guides index shows an empty state when nothing is published', function () {
    (new PageTemplateSeeder)->run();

    $this->get(route('patients'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('patient-guides')
            ->where('guides', []));
});

test('the patient guide seeder creates the five required guides with the right statuses', function () {
    (new PageTemplateSeeder)->run();
    (new PageSeeder)->run();
    (new PatientGuideSeeder)->run();

    $template = PageTemplate::query()->where('key', 'patient_guide')->first();
    $guides = Page::query()->where('template_id', $template->id)->pluck('slug');

    expect($guides->all())->toBe([
        'visiting-hours',
        'patient-rights',
        'admission-process',
        'referral-guidance',
        'billing-guidance',
    ]);
    expect(Page::query()->where('slug', 'visiting-hours')->first()->status)->toBe('published');
    expect(Page::query()->where('slug', 'patient-rights')->first()->status)->toBe('draft');
    expect(Page::query()->where('slug', 'billing-guidance')->first()->status)->toBe('draft');
    expect(Page::query()->where('slug', 'admission-process')->first()->owner)->toBe('FMCA Patient Services');
});

test('each draft patient guide carries an alert and contact panel block', function () {
    (new PageTemplateSeeder)->run();
    (new PageSeeder)->run();
    (new PatientGuideSeeder)->run();

    foreach (['patient-rights', 'admission-process', 'referral-guidance', 'billing-guidance'] as $slug) {
        $blocks = Page::query()->where('slug', $slug)->first()->blocks()->pluck('block_key');

        expect($blocks->all())->toBe(['alert', 'contact_panel']);
    }
});

test('the patient guide seeder is idempotent', function () {
    (new PageTemplateSeeder)->run();
    (new PageSeeder)->run();
    (new PatientGuideSeeder)->run();
    (new PatientGuideSeeder)->run();

    $template = PageTemplate::query()->where('key', 'patient_guide')->first();

    expect(Page::query()->where('template_id', $template->id)->count())->toBe(5);
    expect(Page::query()->where('slug', 'admission-process')->first()->blocks()->count())->toBe(2);
});
