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

function richTextPagePayload(string $body): array
{
    return [
        'title' => 'Visiting policy',
        'slug' => 'visiting-policy',
        'summary' => 'How to visit a patient.',
        'template_id' => PageTemplate::query()->where('key', 'institutional')->firstOrFail()->id,
        'owner' => 'FMCA Patient Services',
        'status' => 'draft',
        'blocks' => [
            ['block_key' => 'rich_text', 'content' => json_encode(['heading' => 'Visiting hours', 'body' => $body])],
        ],
    ];
}

function storedRichTextBody(Page $page): string
{
    return (string) PageBlock::query()->where('page_id', $page->id)->firstOrFail()->content['body'];
}

test('rich text block html is reduced to the public whitelist before storage', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $body = '<p>Visitors <strong>must</strong> register.</p>'
        .'<script>document.cookie</script>'
        .'<img src="x" onerror="alert(1)">'
        .'<a href="javascript:alert(1)">bad link</a>'
        .'<a href="https://fmca.gov.ng/visit" class="x">national site</a>'
        .'<a href="/visiting">internal link</a>'
        .'<style>body{display:none}</style>'
        .'<div><em>nested note</em></div>';

    $this->actingAs($editor)->post(route('cms.pages.store'), richTextPagePayload($body))->assertRedirect();

    $page = Page::query()->where('slug', 'visiting-policy')->firstOrFail();
    $stored = storedRichTextBody($page);

    expect($stored)
        ->toContain('<strong>must</strong>')
        ->toContain('<em>nested note</em>')
        ->toContain('https://fmca.gov.ng/visit')
        ->toContain('/visiting');

    expect($stored)
        ->not->toContain('script')
        ->not->toContain('document.cookie')
        ->not->toContain('<img')
        ->not->toContain('onerror')
        ->not->toContain('javascript:')
        ->not->toContain('<style')
        ->not->toContain('<div')
        ->not->toContain('class=');
});

test('updating a page re-sanitizes rich text blocks', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $template = PageTemplate::query()->where('key', 'institutional')->firstOrFail();
    $page = Page::factory()->published()->create([
        'slug' => 'live-visiting',
        'title' => 'Live visiting page',
        'template_id' => $template->id,
    ]);

    $this->actingAs($editor)->put(route('cms.pages.update', ['page' => $page->id]), [
        ...richTextPagePayload('<iframe src="https://evil.example"></iframe><p><u>Careful</u> wording.</p>'),
        'title' => $page->title,
        'slug' => $page->slug,
        'template_id' => $page->template_id,
    ])->assertRedirect();

    $stored = storedRichTextBody($page->fresh());

    expect($stored)->toContain('<u>Careful</u>')
        ->not->toContain('<iframe')
        ->not->toContain('evil.example');
});

test('plain text rich text bodies are preserved unchanged', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $body = 'Visitors must register at the entrance. Two lines of plain text.';

    $this->actingAs($editor)->post(route('cms.pages.store'), richTextPagePayload($body))->assertRedirect();

    $page = Page::query()->where('slug', 'visiting-policy')->firstOrFail();

    expect(storedRichTextBody($page))->toBe($body);
});
