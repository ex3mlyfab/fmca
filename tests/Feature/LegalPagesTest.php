<?php

use App\Models\Page;
use App\Models\PageTemplate;
use Database\Seeders\LegalPagesSeeder;
use Database\Seeders\PageTemplateSeeder;

test('the legal statements index lists only published legal pages', function () {
    (new PageTemplateSeeder)->run();

    $legalTemplate = PageTemplate::query()->where('key', 'legal')->first();
    $guideTemplate = PageTemplate::query()->where('key', 'patient_guide')->first();

    Page::factory()->published()->create([
        'template_id' => $legalTemplate->id,
        'slug' => 'cookie-notice',
        'reviewed_at' => now(),
    ]);
    Page::factory()->create([
        'template_id' => $legalTemplate->id,
        'slug' => 'terms-of-use',
    ]);
    Page::factory()->published()->create([
        'template_id' => $guideTemplate->id,
        'slug' => 'visiting',
    ]);

    $this->get(route('legal'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('legal')
            ->where('statements.0.slug', 'cookie-notice')
            ->where('statements.0.reviewed_at', now()->format('j M Y'))
            ->where('statements', fn ($statements) => collect($statements)->pluck('slug')->all() === ['cookie-notice']));
});

test('the legal statements index shows an empty state when nothing is published', function () {
    (new PageTemplateSeeder)->run();

    $this->get(route('legal'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('legal')
            ->where('statements', []));
});

test('a published legal statement renders at its public URL', function () {
    $statement = Page::factory()->published()->create([
        'template_id' => PageTemplate::factory()->legal()->create()->id,
        'slug' => 'cookie-notice',
        'owner' => 'FMCA Legal & Compliance',
        'reviewed_at' => now(),
    ]);

    $this->get(route('page.legal', ['slug' => 'cookie-notice']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('page')
            ->where('page.template.key', 'legal')
            ->where('page.title', $statement->title));
});

test('the legal pages seeder creates the four statements as drafts', function () {
    (new PageTemplateSeeder)->run();
    (new LegalPagesSeeder)->run();

    $template = PageTemplate::query()->where('key', 'legal')->first();
    $slugs = Page::query()->where('template_id', $template->id)->pluck('slug');

    expect($slugs->all())->toBe([
        'privacy-statement',
        'cookie-notice',
        'accessibility-statement',
        'terms-of-use',
    ]);

    foreach ($slugs as $slug) {
        $statement = Page::query()->where('slug', $slug)->first();

        expect($statement->status)->toBe('draft');
        expect($statement->owner)->toBe('FMCA Legal & Compliance');
        expect($statement->blocks()->pluck('block_key')->all())->toBe(['rich_text', 'contact_panel']);
    }
});

test('the legal pages seeder is idempotent', function () {
    (new PageTemplateSeeder)->run();
    (new LegalPagesSeeder)->run();
    (new LegalPagesSeeder)->run();

    $template = PageTemplate::query()->where('key', 'legal')->first();

    expect(Page::query()->where('template_id', $template->id)->count())->toBe(4);
    expect(Page::query()->where('slug', 'cookie-notice')->first()->blocks()->count())->toBe(2);
});
