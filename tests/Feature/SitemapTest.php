<?php

use App\Models\CommitteeMember;
use App\Models\Consultant;
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
        ->and($content)->toContain(url('sitemap-consultants.xml'))
        ->and($content)->toContain(url('sitemap-committees.xml'))
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

test('the consultants sitemap lists only published consultants', function () {
    Consultant::factory()->published()->create(['slug' => 'cardiology-consultant']);
    Consultant::factory()->create(['slug' => 'draft-consultant']);

    $content = $this->get('/sitemap-consultants.xml')->assertOk()->getContent();

    expect($content)->toContain(url('consultants/cardiology-consultant'))
        ->and($content)->not->toContain(url('consultants/draft-consultant'));
});

test('the committees sitemap lists the committee page only when a member is published', function () {
    CommitteeMember::factory()->create(['slug' => 'draft-member']);

    $empty = $this->get('/sitemap-committees.xml')->assertOk()->getContent();
    expect($empty)->not->toContain(url('about/leadership'));

    CommitteeMember::factory()->published()->create(['slug' => 'published-member']);

    $content = $this->get('/sitemap-committees.xml')->assertOk()->getContent();
    expect($content)->toContain(url('about/leadership'));
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
