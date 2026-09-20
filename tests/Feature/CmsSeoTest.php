<?php

use App\Models\Department;
use App\Models\Page;
use App\Models\Post;
use App\Models\SeoMetadata;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function seoPayload(): array
{
    return [
        'title' => 'Cardiology clinic in Abuja',
        'meta_description' => 'Meet the cardiology team at FMCA and book a consultation.',
        'canonical_url' => 'https://fmca.example/services/cardiology',
        'og_image_url' => 'https://fmca.example/img/cardiology.jpg',
        'robots' => 'index,follow',
        'structured_data' => '{"@context":"https://schema.org","@type":"MedicalClinic"}',
    ];
}

test('clinical approvers can open the content seo editors', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();
    $department = Department::factory()->create();
    $post = Post::factory()->create();
    $page = Page::factory()->create();

    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'service', 'content_id' => $service->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/seo/edit')
            ->where('content.label', $service->name)
            ->where('content.id', $service->id)
            ->where('seo', null));

    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'department', 'content_id' => $department->id]))
        ->assertOk();
    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'post', 'content_id' => $post->id]))
        ->assertOk();
    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'page', 'content_id' => $page->id]))
        ->assertOk();
});

test('listing page seo editors render without a content id', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'services']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/seo/edit')
            ->where('content.type', 'services')
            ->where('content.id', null)
            ->where('content.label', 'Services index page')
            ->where('content.publicUrl', url('services')));
});

test('the editor shows saved seo overrides', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();
    SeoMetadata::factory()->create([
        'content_type' => 'service',
        'content_id' => $service->id,
        'title' => 'Custom cardiology title',
    ]);

    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'service', 'content_id' => $service->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/seo/edit')
            ->where('seo.title', 'Custom cardiology title'));
});

test('an editor without the content permission is forbidden', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $service = Service::factory()->create();
    $department = Department::factory()->create();
    $post = Post::factory()->create();

    $this->actingAs($communications)
        ->get(route('cms.seo.edit', ['content_type' => 'service', 'content_id' => $service->id]))
        ->assertForbidden();
    $this->actingAs($communications)
        ->get(route('cms.seo.edit', ['content_type' => 'department', 'content_id' => $department->id]))
        ->assertForbidden();
    $this->actingAs($communications)
        ->get(route('cms.seo.edit', ['content_type' => 'post', 'content_id' => $post->id]))
        ->assertOk();
});

test('auditors and users without a role are forbidden from the seo editor', function () {
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();
    $service = Service::factory()->create();

    $route = route('cms.seo.edit', ['content_type' => 'service', 'content_id' => $service->id]);

    $this->actingAs($auditor)->get($route)->assertForbidden();
    $this->actingAs($noRole)->get($route)->assertForbidden();
});

test('unknown content types and type and id mismatches are not found', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'campaign']))
        ->assertNotFound();
    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'services', 'content_id' => 1]))
        ->assertNotFound();
    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'service']))
        ->assertNotFound();
    $this->actingAs($approver)
        ->get(route('cms.seo.edit', ['content_type' => 'service', 'content_id' => 99999]))
        ->assertNotFound();
});

test('an approver saves seo overrides for a piece of content', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();

    $this->actingAs($approver)
        ->put(route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]), seoPayload())
        ->assertRedirect(route('cms.seo.edit', ['content_type' => 'service', 'content_id' => $service->id]));

    $this->assertDatabaseHas('seo_metadata', [
        'content_type' => 'service',
        'content_id' => $service->id,
        'title' => 'Cardiology clinic in Abuja',
        'meta_description' => 'Meet the cardiology team at FMCA and book a consultation.',
        'robots' => 'index,follow',
    ]);

    $stored = SeoMetadata::rowFor('service', $service->id);
    expect($stored->structured_data)->toBe([
        '@context' => 'https://schema.org',
        '@type' => 'MedicalClinic',
    ]);
});

test('saving seo overrides again updates the same row', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();
    $route = route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]);

    $this->actingAs($approver)->put($route, seoPayload());
    $this->actingAs($approver)
        ->put($route, array_merge(seoPayload(), ['title' => 'Revised cardiology title']))
        ->assertRedirect();

    $this->assertDatabaseCount('seo_metadata', 1);
    $this->assertDatabaseHas('seo_metadata', [
        'content_type' => 'service',
        'content_id' => $service->id,
        'title' => 'Revised cardiology title',
    ]);
});

test('listing page seo is stored with a null content id', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)
        ->put(route('cms.seo.update', ['content_type' => 'news']), seoPayload())
        ->assertRedirect(route('cms.seo.edit', ['content_type' => 'news']));

    $this->assertDatabaseHas('seo_metadata', [
        'content_type' => 'news',
        'content_id' => null,
        'title' => 'Cardiology clinic in Abuja',
    ]);
});

test('blank fields are stored as null so the page defaults apply', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();

    $this->actingAs($approver)
        ->put(route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]), [
            'title' => '',
            'robots' => '   ',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('seo_metadata', [
        'content_type' => 'service',
        'content_id' => $service->id,
        'title' => null,
        'robots' => null,
        'structured_data' => null,
    ]);
});

test('structured data must be a json object or array', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();
    $route = route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]);

    $this->actingAs($approver)
        ->put($route, array_merge(seoPayload(), ['structured_data' => 'not json at all']))
        ->assertSessionHasErrors('structured_data');

    $this->actingAs($approver)
        ->put($route, array_merge(seoPayload(), ['structured_data' => '42']))
        ->assertSessionHasErrors('structured_data');

    $this->assertDatabaseCount('seo_metadata', 0);
});

test('an overlong seo title is rejected', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $service = Service::factory()->create();

    $this->actingAs($approver)
        ->put(route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]), array_merge(
            seoPayload(),
            ['title' => str_repeat('a', 161)]
        ))
        ->assertSessionHasErrors('title');
});

test('a user without the content permission cannot save seo', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $service = Service::factory()->create();

    $this->actingAs($communications)
        ->put(route('cms.seo.update', ['content_type' => 'service', 'content_id' => $service->id]), seoPayload())
        ->assertForbidden();

    $this->assertDatabaseCount('seo_metadata', 0);
});
