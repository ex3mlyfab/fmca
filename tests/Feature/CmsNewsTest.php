<?php

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function postPayload(?Post $post = null): array
{
    return [
        'title' => 'Staff meeting notice',
        'slug' => 'staff-meeting-notice',
        'summary' => 'A public notice about the upcoming staff meeting.',
        'body' => "Meeting details.\nLocation: admin block.",
        'category_id' => $post?->category_id ?: Category::factory()->create()->id,
        'author' => 'FMCA Communications',
        'publish_date' => '2026-09-01',
        'owner' => 'FMCA Communications',
        'status' => 'draft',
    ];
}

test('an editor can attach a feature image to a news item', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.news.store'), [
        ...postPayload(),
        'feature_image' => '/media/2026/09/staff-meeting.jpg',
        'feature_image_alt' => 'The FMCA staff meeting',
    ])->assertRedirect();

    $this->assertDatabaseHas('posts', [
        'slug' => 'staff-meeting-notice',
        'feature_image' => '/media/2026/09/staff-meeting.jpg',
        'feature_image_alt' => 'The FMCA staff meeting',
    ]);
});

test('a feature image URL must not use a javascript or data scheme', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.news.store'), [
        ...postPayload(),
        'feature_image' => 'javascript:alert(1)',
    ])->assertSessionHasErrors('feature_image');
});

test('news managers can open the news and category workspaces', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $department = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->get(route('cms.news.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.news.create'))->assertOk();
    $this->actingAs($editor)->get(route('cms.categories.index'))->assertOk();
    $this->actingAs($department)->get(route('cms.news.index'))->assertOk();
});

test('an auditor without news permissions is forbidden', function () {
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($auditor)->get(route('cms.news.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.categories.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.news.index'))->assertForbidden();
});

test('an editor creates a news item', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.news.store'), postPayload());

    $response->assertRedirect(route('cms.news.edit', ['post' => Post::query()->latest()->value('id')]));
    $this->assertDatabaseHas('posts', [
        'slug' => 'staff-meeting-notice',
        'status' => 'draft',
    ]);
});

test('a news item can be created as published by an editor with publish rights', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.news.store'), [...postPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('posts', [
        'slug' => 'staff-meeting-notice',
        'status' => 'published',
    ]);
});

test('news validation rejects invalid slugs, duplicate slugs and unknown categories', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $existing = Post::factory()->create(['slug' => 'existing-story']);

    $this->actingAs($editor)->post(route('cms.news.store'), [...postPayload(), 'slug' => 'Not A Slug'])
        ->assertSessionHasErrors('slug');

    $this->actingAs($editor)->post(route('cms.news.store'), [...postPayload($existing), 'slug' => 'existing-story'])
        ->assertSessionHasErrors('slug');

    $this->actingAs($editor)->post(route('cms.news.store'), [...postPayload(), 'category_id' => 99999])
        ->assertSessionHasErrors('category_id');

    $this->actingAs($editor)->post(route('cms.news.store'), [...postPayload(), 'publish_date' => 'not-a-date'])
        ->assertSessionHasErrors('publish_date');
});

test('a department editor cannot publish but can draft', function () {
    $department = User::factory()->withRole('department_editor')->create();

    $this->actingAs($department)->post(route('cms.news.store'), [...postPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($department)->post(route('cms.news.store'), [...postPayload(), 'status' => 'draft'])
        ->assertRedirect();
});

test('a department editor cannot re-publish a draft but may unpublish a published item', function () {
    $department = User::factory()->withRole('department_editor')->create();
    $category = Category::factory()->create();
    $draft = Post::factory()->create([
        'slug' => 'draft-story',
        'category_id' => $category->id,
        'publish_date' => '2026-09-01',
    ]);
    $published = Post::factory()->published()->create([
        'slug' => 'published-story',
        'category_id' => $category->id,
        'publish_date' => '2026-09-01',
    ]);

    $draftPayload = [
        'title' => $draft->title,
        'slug' => $draft->slug,
        'summary' => $draft->summary,
        'body' => $draft->body,
        'category_id' => $category->id,
        'author' => $draft->author,
        'publish_date' => '2026-09-01',
        'status' => 'published',
    ];
    $this->actingAs($department)->put(route('cms.news.update', ['post' => $draft->id]), $draftPayload)
        ->assertSessionHasErrors('status');

    $publishedPayload = [
        'title' => $published->title,
        'slug' => $published->slug,
        'summary' => $published->summary,
        'body' => $published->body,
        'category_id' => $category->id,
        'author' => $published->author,
        'publish_date' => '2026-09-01',
        'status' => 'draft',
    ];
    $this->actingAs($department)->put(route('cms.news.update', ['post' => $published->id]), $publishedPayload)
        ->assertRedirect(route('cms.news.index'));
    $this->assertDatabaseHas('posts', ['id' => $published->id, 'status' => 'draft']);
});

test('an editor creates and edits a category', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.categories.store'), [
        'name' => 'Press Release',
        'slug' => 'press-releases',
        'description' => 'Statements from the FMCA press office.',
    ]);

    $category = Category::query()->where('slug', 'press-releases')->firstOrFail();
    $response->assertRedirect(route('cms.categories.edit', ['category' => $category->id]));

    $this->actingAs($editor)->put(route('cms.categories.update', ['category' => $category->id]), [
        'name' => 'Press Releases',
        'slug' => $category->slug,
        'description' => null,
    ])->assertRedirect(route('cms.categories.index'));
    $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Press Releases']);
});

test('a category editor cannot duplicate an existing category slug', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    Category::factory()->create(['slug' => 'health-advisories']);

    $this->actingAs($editor)->post(route('cms.categories.store'), [
        'name' => 'Health Advisories',
        'slug' => 'health-advisories',
    ])->assertSessionHasErrors('slug');
});

test('a department editor can manage categories with edit news rights', function () {
    $department = User::factory()->withRole('department_editor')->create();

    $response = $this->actingAs($department)->post(route('cms.categories.store'), [
        'name' => 'Health Advisory',
        'slug' => 'health-advisories',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', ['slug' => 'health-advisories']);
});
