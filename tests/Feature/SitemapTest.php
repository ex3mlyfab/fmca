<?php

use App\Models\Department;
use App\Models\Page;
use App\Models\PageTemplate;
use App\Models\Post;
use App\Models\Service;
use Database\Seeders\PageTemplateSeeder;

test('the sitemap index lists one sitemap per content type', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertOk();

    expect($response->headers->get('Content-Type'))->toContain('application/xml');

    $content = $response->getContent();

    expect($content)->toContain('<sitemapindex')
        ->and($content)->toContain(url('sitemap-services.xml'))
        ->and($content)->toContain(url('sitemap-departments.xml'))
        ->and($content)->toContain(url('sitemap-news.xml'))
        ->and($content)->toContain(url('sitemap-pages.xml'));
});

test('the services sitemap lists only published services', function () {
    Service::factory()->published()->create(['slug' => 'cardiology-clinic']);
    Service::factory()->create(['slug' => 'draft-clinic']);

    $content = $this->get('/sitemap-services.xml')->assertOk()->getContent();

    expect($content)->toContain(url('services/cardiology-clinic'))
        ->and($content)->not->toContain(url('services/draft-clinic'));
});

test('the departments sitemap lists only published departments', function () {
    Department::factory()->published()->create(['slug' => 'cardiology']);
    Department::factory()->create(['slug' => 'draft-department']);

    $content = $this->get('/sitemap-departments.xml')->assertOk()->getContent();

    expect($content)->toContain(url('departments/cardiology'))
        ->and($content)->not->toContain(url('departments/draft-department'));
});

test('the news sitemap uses the publish date as the last-modified date', function () {
    Post::factory()->published()->create(['slug' => 'cardiology-week', 'publish_date' => '2026-08-17']);
    Post::factory()->create(['slug' => 'draft-notice']);

    $content = $this->get('/sitemap-news.xml')->assertOk()->getContent();

    expect($content)->toContain(url('news/cardiology-week'))
        ->and($content)->toContain('2026-08-17T')
        ->and($content)->not->toContain(url('news/draft-notice'));
});

test('the pages sitemap lists only published pages of routable templates', function () {
    (new PageTemplateSeeder)->run();

    $guide = PageTemplate::query()->where('key', 'patient_guide')->first();
    $campaign = PageTemplate::query()->where('key', 'campaign')->first();

    Page::factory()->published()->create(['template_id' => $guide->id, 'slug' => 'visiting-hours']);
    Page::factory()->published()->create(['template_id' => $campaign->id, 'slug' => 'awareness-push']);
    Page::factory()->create(['template_id' => $guide->id, 'slug' => 'draft-guide']);

    $content = $this->get('/sitemap-pages.xml')->assertOk()->getContent();

    expect($content)->toContain(url('patients/visiting-hours'))
        ->and($content)->not->toContain('awareness-push')
        ->and($content)->not->toContain('draft-guide');
});
