<?php

use App\Models\Department;
use App\Models\Page;
use App\Models\PageTemplate;
use App\Models\Post;
use App\Models\Service;
use Database\Seeders\PageTemplateSeeder;

test('search returns matching published content across all content types', function () {
    (new PageTemplateSeeder)->run();

    Service::factory()->published()->create(['name' => 'Cardiology follow-up clinic', 'slug' => 'cardio-follow-up', 'summary' => 'Heart clinic']);
    Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology', 'summary' => 'Heart department']);
    Post::factory()->published()->create(['title' => 'Cardiology awareness week', 'slug' => 'cardio-week']);
    Page::factory()->published()->create(['title' => 'Cardiology rehab guidance', 'slug' => 'cardiac-rehab', 'summary' => 'Heart care guide']);

    $this->get('/search?q=cardio')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('query', 'cardio')
            ->where('results.services.0.name', 'Cardiology follow-up clinic')
            ->where('results.departments.0.name', 'Cardiology')
            ->where('results.news.0.title', 'Cardiology awareness week')
            ->where('results.pages.0.title', 'Cardiology rehab guidance')
            ->where('results.pages.0.template.url_prefix', 'patients')
            ->where('total', 4));
});

test('search matches on summary text, not just titles', function () {
    (new PageTemplateSeeder)->run();

    Service::factory()->published()->create(['name' => 'Outpatient clinic', 'slug' => 'outpatient', 'summary' => 'Chest and heart imaging follow-up']);

    $this->get('/search?q=heart')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('results.services.0.slug', 'outpatient')
            ->where('total', 1));
});

test('search is case-insensitive', function () {
    (new PageTemplateSeeder)->run();

    Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology', 'summary' => 'Heart department']);

    $this->get('/search?q=HEART')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('results.departments.0.name', 'Cardiology')
            ->where('total', 1));
});

test('search only returns published content', function () {
    (new PageTemplateSeeder)->run();

    $published = Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology']);
    Department::factory()->create(['name' => 'Cardiology draft', 'slug' => 'cardiology-draft']);
    Post::factory()->published()->create(['title' => 'Cardiology week', 'slug' => 'cardio-week']);
    Post::factory()->create(['title' => 'Cardiology draft notice', 'slug' => 'cardio-draft']);
    Page::factory()->published()->create(['title' => 'Cardiology guide', 'slug' => 'cardiac-published']);
    Page::factory()->create(['title' => 'Cardiology draft guide', 'slug' => 'cardiac-draft']);
    Service::factory()->published()->create(['name' => 'Cardiology clinic', 'slug' => 'cardio-clinic']);
    Service::factory()->create(['name' => 'Cardiology draft clinic', 'slug' => 'cardio-draft-clinic']);

    $this->get('/search?q=cardio')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('results.departments.0.slug', 'cardiology')
            ->where('results.news.0.slug', 'cardio-week')
            ->where('results.pages.0.slug', 'cardiac-published')
            ->where('results.services.0.slug', 'cardio-clinic')
            ->where('total', 4));

    expect($published->id)->not->toBeNull();
});

test('pages without a public URL are not searchable', function () {
    (new PageTemplateSeeder)->run();

    $template = PageTemplate::query()->where('key', 'campaign')->first();
    Page::factory()->published()->create([
        'template_id' => $template->id,
        'title' => 'Cardioblast awareness campaign',
        'slug' => 'cardioblast-campaign',
    ]);

    $this->get('/search?q=cardioblast')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('results.pages', [])
            ->where('total', 0));
});

test('an unmatched search returns empty results', function () {
    (new PageTemplateSeeder)->run();

    Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology']);

    $this->get('/search?q=zzz-no-such-thing')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('results.services', [])
            ->where('results.departments', [])
            ->where('results.news', [])
            ->where('results.pages', [])
            ->where('total', 0));
});

test('an empty query shows no results', function () {
    (new PageTemplateSeeder)->run();

    Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology']);

    $this->get('/search')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('query', '')
            ->where('total', 0));
});
