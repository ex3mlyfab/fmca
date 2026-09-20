<?php

use App\Models\SeoMetadata;
use App\Models\Service;

test('a service page shows its default seo fields when no overrides exist', function () {
    $service = Service::factory()->published()->create();

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('seo.title', $service->name.' | Federal Medical Centre, Abuja')
            ->where('seo.description', $service->summary)
            ->where('seo.canonical', url('services/'.$service->slug))
            ->where('seo.robots', 'index,follow')
            ->where('seo.json_ld.@type', 'BreadcrumbList'));
});

test('service page breadcrumbs list home, services and the service name', function () {
    $service = Service::factory()->published()->create();

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('seo.json_ld.itemListElement.0.name', 'Home')
            ->where('seo.json_ld.itemListElement.0.position', 1)
            ->where('seo.json_ld.itemListElement.1.name', 'Services')
            ->where('seo.json_ld.itemListElement.2.name', $service->name)
            ->where('seo.json_ld.itemListElement.2.position', 3));
});

test('saved overrides win over the generated defaults on a service page', function () {
    $service = Service::factory()->published()->create();
    SeoMetadata::factory()->minimal()->create([
        'content_type' => 'service',
        'content_id' => $service->id,
        'title' => 'Overridden cardiology title',
        'robots' => 'noindex,follow',
    ]);

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('seo.title', 'Overridden cardiology title')
            ->where('seo.description', $service->summary)
            ->where('seo.robots', 'noindex,follow'));
});

test('listing page overrides are stored per listing type', function () {
    SeoMetadata::factory()->minimal()->create([
        'content_type' => 'services',
        'content_id' => null,
        'title' => 'Our clinical services | FMCA Abuja',
    ]);

    $this->get(route('services'))
        ->assertInertia(fn ($page) => $page
            ->component('services')
            ->where('seo.title', 'Our clinical services | FMCA Abuja')
            ->where('seo.canonical', url('services')));
});

test('the search page is kept out of search engines', function () {
    $this->get(route('search'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('search')
            ->where('seo.robots', 'noindex,follow'));
});
