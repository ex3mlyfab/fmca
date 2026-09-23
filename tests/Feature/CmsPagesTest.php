<?php

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageTemplate;
use App\Models\User;
use Database\Seeders\PageTemplateSeeder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
    (new PageTemplateSeeder)->run();
});

function guideTemplate(): PageTemplate
{
    return PageTemplate::query()->where('key', 'patient_guide')->firstOrFail();
}

function pagePayload(?Page $page = null): array
{
    return [
        'title' => $page?->title ?? 'New page',
        'slug' => $page?->slug ?? 'new-page',
        'summary' => 'A short summary.',
        'template_id' => $page?->template_id ?? guideTemplate()->id,
        'owner' => 'FMCA Patient Services',
        'status' => 'draft',
        'blocks' => [
            ['block_key' => 'faq', 'content' => json_encode(['title' => 'FAQ', 'items' => []])],
        ],
    ];
}

test('staff with page rights can open the page workspace', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $department = User::factory()->withRole('department_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($editor)->get(route('cms.pages.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.pages.create'))->assertOk();
    $this->actingAs($approver)->get(route('cms.pages.index'))->assertOk();
    $this->actingAs($media)->get(route('cms.pages.index'))->assertOk();
    $this->actingAs($department)->get(route('cms.pages.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.pages.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.pages.index'))->assertForbidden();
});

test('the template picker lists all twelve templates with their block catalog', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->get(route('cms.pages.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/pages/create')
            ->where('templates', fn ($templates) => collect($templates)->count() === 12
                && collect($templates)->pluck('key')->contains('patient_guide'))
            ->where('blockCatalog', fn ($catalog) => collect($catalog)->count() === 7));
});

test('the new-page editor preselects the template from the query string', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->get(route('cms.pages.start', ['template' => 'patient_guide']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/pages/edit')
            ->where('page', null)
            ->where('templateKey', 'patient_guide'));
});

test('an editor creates a draft page with content blocks', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.pages.store'), pagePayload());
    $page = Page::query()->where('title', 'New page')->firstOrFail();

    $response->assertRedirect(route('cms.pages.edit', ['page' => $page->id]));
    $this->assertDatabaseHas('pages', ['title' => 'New page', 'status' => 'draft']);
    $this->assertDatabaseHas('page_blocks', ['page_id' => $page->id, 'block_key' => 'faq']);
});

test('an editor with publish rights can create a published page', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [...pagePayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('pages', ['title' => 'New page', 'status' => 'published']);
});

test('a media officer cannot publish pages but can create drafts', function () {
    $media = User::factory()->withRole('media_officer')->create();

    $this->actingAs($media)->post(route('cms.pages.store'), [...pagePayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($media)->post(route('cms.pages.store'), pagePayload())->assertRedirect();
    $this->assertDatabaseHas('pages', ['title' => 'New page', 'status' => 'draft']);
});

test('a media officer may keep a published page published but cannot publish a draft', function () {
    $media = User::factory()->withRole('media_officer')->create();
    $published = Page::factory()->published()->create(['slug' => 'live-page', 'title' => 'Live page']);
    $draft = Page::factory()->create(['slug' => 'quiet-page', 'title' => 'Quiet page']);

    $this->actingAs($media)->put(route('cms.pages.update', ['page' => $published->id]), [
        ...pagePayload($published),
        'status' => 'published',
    ])->assertRedirect(route('cms.pages.index'));
    $this->assertDatabaseHas('pages', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($media)->put(route('cms.pages.update', ['page' => $draft->id]), [
        ...pagePayload($draft),
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('pages', ['id' => $draft->id, 'status' => 'draft']);
});

test('an editor can publish a draft page', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $draft = Page::factory()->create(['slug' => 'quiet-page', 'title' => 'Quiet page']);

    $this->actingAs($editor)->put(route('cms.pages.update', ['page' => $draft->id]), [
        ...pagePayload($draft),
        'status' => 'published',
    ])->assertRedirect(route('cms.pages.index'));
    $this->assertDatabaseHas('pages', ['id' => $draft->id, 'status' => 'published']);
});

test('page validation rejects an invalid slug', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [...pagePayload(), 'slug' => 'Bad Slug!'])
        ->assertSessionHasErrors('slug');
});

test('page validation rejects a duplicate slug', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    Page::factory()->create(['slug' => 'taken-slug']);

    $this->actingAs($editor)->post(route('cms.pages.store'), [...pagePayload(), 'slug' => 'taken-slug'])
        ->assertSessionHasErrors('slug');
});

test('page validation requires a known template', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [...pagePayload(), 'template_id' => 999999])
        ->assertSessionHasErrors('template_id');
});

test('a block outside the template permit list is rejected', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $institutional = PageTemplate::query()->where('key', 'institutional')->firstOrFail();

    $this->actingAs($editor)->post(route('cms.pages.store'), [
        ...pagePayload(),
        'template_id' => $institutional->id,
        'owner' => 'FMCA Communications',
        'summary' => 'About the group.',
        'blocks' => [['block_key' => 'steps', 'content' => json_encode(['title' => '', 'steps' => []])]],
    ])->assertSessionHasErrors(['blocks.0.block_key']);
});

test('invalid block JSON is rejected', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [
        ...pagePayload(),
        'blocks' => [['block_key' => 'faq', 'content' => 'not json at all']],
    ])->assertSessionHasErrors('blocks.0.content');
});

test('block link targets must be internal or http(s)', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [
        ...pagePayload(),
        'blocks' => [['block_key' => 'cta', 'content' => json_encode(['label' => 'Go', 'href' => 'javascript:alert(1)'])]],
    ])->assertSessionHasErrors('blocks.0.content');

    $this->actingAs($editor)->post(route('cms.pages.store'), [
        ...pagePayload(),
        'blocks' => [
            [
                'block_key' => 'document_list',
                'content' => json_encode(['title' => 'Downloads', 'documents' => [['label' => 'X', 'href' => 'javascript:alert(1)']]]),
            ],
        ],
    ])->assertSessionHasErrors('blocks.0.content');
});

test('a page requires at least one content block', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.pages.store'), [...pagePayload(), 'blocks' => []])
        ->assertSessionHasErrors('blocks');
});

test('the institutional template requires an owner and a summary', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $institutional = PageTemplate::query()->where('key', 'institutional')->firstOrFail();

    $payload = [
        ...pagePayload(),
        'template_id' => $institutional->id,
        'owner' => null,
        'summary' => null,
    ];

    $this->actingAs($editor)->post(route('cms.pages.store'), $payload)
        ->assertSessionHasErrors(['owner', 'summary']);
});

test('updating a page replaces its blocks', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $page = Page::factory()->create(['slug' => 'replace-blocks', 'title' => 'Replace blocks']);
    PageBlock::factory()->for($page)->documentList()->create();

    $this->actingAs($editor)->put(route('cms.pages.update', ['page' => $page->id]), [
        ...pagePayload($page),
        'blocks' => [['block_key' => 'faq', 'content' => json_encode(['title' => 'FAQ', 'items' => []])]],
    ])->assertRedirect(route('cms.pages.index'));

    $this->assertDatabaseHas('page_blocks', ['page_id' => $page->id, 'block_key' => 'faq']);
    $this->assertDatabaseMissing('page_blocks', ['page_id' => $page->id, 'block_key' => 'document_list']);
});

test('the pages workspace lists pages with their templates and public URL', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    Page::factory()->create(['slug' => 'quiet-page', 'title' => 'Quiet page', 'created_at' => now()->subMinute()]);
    Page::factory()->published()->create(['slug' => 'live-page', 'title' => 'Live page']);

    $this->actingAs($editor)->get(route('cms.pages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/pages/index')
            ->where('canCreate', true)
            ->where('pages', fn ($pages) => collect($pages)->count() === 2)
            ->where('pages.0.slug', 'live-page')
            ->where('pages.0.public_url', '/patients/live-page')
            ->where('pages.1.public_url', null));
});

test('the page editor renders an existing page with its blocks', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $record = Page::factory()->create(['slug' => 'edit-me', 'title' => 'Edit me']);
    PageBlock::factory()->for($record)->faq()->create();

    $this->actingAs($editor)->get(route('cms.pages.edit', ['page' => $record->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/pages/edit')
            ->where('page.id', $record->id)
            ->where('page.template_key', 'patient_guide')
            ->where('page.blocks.0.block_key', 'faq')
            ->where('templates', fn ($templates) => collect($templates)->count() === 12));
});
