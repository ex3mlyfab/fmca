<?php

use App\Models\Category;
use App\Models\Post;

test('the public news page lists published posts newest first', function () {
    Post::factory()->published()->create([
        'title' => 'Old update',
        'slug' => 'old-update',
        'publish_date' => now()->subDays(3)->toDateString(),
    ]);
    $recent = Post::factory()->published()->create([
        'title' => 'Recent update',
        'slug' => 'recent-update',
        'publish_date' => now()->toDateString(),
    ]);
    Post::factory()->published()->create([
        'title' => 'Middle update',
        'slug' => 'middle-update',
        'publish_date' => now()->subDay()->toDateString(),
    ]);
    Post::factory()->create([
        'title' => 'Hidden draft',
        'slug' => 'hidden-draft',
    ]);

    $this->get(route('news'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news')
            ->where('posts.0.id', $recent->id)
            ->where('posts.0.publishDate', now()->format('j M Y'))
            ->where('posts', fn ($posts) => collect($posts)->count() === 3
                && ! collect($posts)->pluck('slug')->contains('hidden-draft')));
});

test('posts sharing a publish date fall back to creation order', function () {
    Post::factory()->published()->create([
        'title' => 'First of the day',
        'slug' => 'first-of-the-day',
        'publish_date' => '2026-09-01',
        'created_at' => now()->subMinutes(5),
    ]);
    $later = Post::factory()->published()->create([
        'title' => 'Later of the day',
        'slug' => 'later-of-the-day',
        'publish_date' => '2026-09-01',
        'created_at' => now(),
    ]);

    $this->get(route('news'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('news')
            ->where('posts.0.id', $later->id));
});

test('news can be filtered to a single category', function () {
    $press = Category::factory()->create(['slug' => 'press-releases']);
    $health = Category::factory()->create(['slug' => 'health-advisories']);
    Post::factory()->published()->inCategory($press)->create([
        'slug' => 'press-item',
        'publish_date' => '2026-09-01',
    ]);
    Post::factory()->published()->inCategory($health)->create([
        'slug' => 'health-item',
        'publish_date' => '2026-09-01',
    ]);

    $this->get(route('news', ['category' => 'press-releases']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news')
            ->where('activeCategory', 'press-releases')
            ->where('posts', fn ($posts) => collect($posts)->count() === 1
                && collect($posts)->pluck('slug')->contains('press-item')));
});

test('an unknown category filter shows an empty list', function () {
    Category::factory()->create(['slug' => 'press-releases']);
    Post::factory()->published()->create(['slug' => 'some-item']);

    $this->get(route('news', ['category' => 'no-such-category']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news')
            ->where('activeCategory', 'no-such-category')
            ->where('posts', fn ($posts) => collect($posts)->count() === 0));
});

test('the public news detail page shows a published post with related items', function () {
    $post = Post::factory()->published()->create([
        'title' => 'Feature story',
        'slug' => 'feature-story',
        'body' => "Line one\nLine two",
        'owner' => 'FMCA Communications',
        'reviewed_at' => now(),
        'publish_date' => '2026-09-01',
    ]);
    Post::factory()->published()->create([
        'slug' => 'related-one',
        'publish_date' => '2026-09-02',
    ]);
    Post::factory()->published()->create([
        'slug' => 'related-two',
        'publish_date' => '2026-09-03',
    ]);
    Post::factory()->create([
        'slug' => 'related-draft',
    ]);

    $this->get(route('news.show', ['slug' => $post->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('article')
            ->where('post.id', $post->id)
            ->where('post.body', "Line one\nLine two")
            ->where('post.owner', 'FMCA Communications')
            ->where('post.reviewedAt', now()->format('j M Y'))
            ->where('related', fn ($related) => collect($related)->count() === 2
                && ! collect($related)->pluck('slug')->contains('related-draft')));
});

test('an unknown news slug renders the 404 page', function () {
    $this->get(route('news.show', ['slug' => 'no-such-story']))
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('errors/404'));
});

test('a draft news slug is not reachable publicly', function () {
    $draft = Post::factory()->create(['slug' => 'secret-draft']);

    $this->get(route('news.show', ['slug' => $draft->slug]))
        ->assertNotFound()
        ->assertInertia(fn ($page) => $page->component('errors/404'));
});

test('the news list exposes each post feature image for the card', function () {
    Post::factory()->published()->create([
        'slug' => 'with-image',
        'publish_date' => now()->toDateString(),
        'feature_image' => '/media/2026/09/campus-aerial.jpg',
        'feature_image_alt' => 'Aerial view of the FMCA campus',
    ]);

    $this->get(route('news'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news')
            ->where('posts.0.featureImage', '/media/2026/09/campus-aerial.jpg')
            ->where('posts.0.featureImageAlt', 'Aerial view of the FMCA campus'));
});

test('a post without a feature image exposes null values', function () {
    Post::factory()->published()->create([
        'slug' => 'without-image',
        'publish_date' => now()->toDateString(),
    ]);

    $this->get(route('news'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('news')
            ->where('posts.0.featureImage', null)
            ->where('posts.0.featureImageAlt', null));
});

test('the article page exposes the feature image and uses it as the og image', function () {
    Post::factory()->published()->create([
        'slug' => 'feature-story',
        'publish_date' => '2026-09-01',
        'feature_image' => '/media/2026/09/feature.jpg',
        'feature_image_alt' => 'The featured announcement',
    ]);

    $this->get(route('news.show', ['slug' => 'feature-story']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('article')
            ->where('post.featureImage', '/media/2026/09/feature.jpg')
            ->where('post.featureImageAlt', 'The featured announcement')
            ->where('seo.og_image', '/media/2026/09/feature.jpg'));
});
