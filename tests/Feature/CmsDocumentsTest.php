<?php

use App\Models\Document;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function documentPayload(): array
{
    return [
        'title' => 'Visitation policy',
        'summary' => 'Current visiting policy for inpatients.',
        'file' => UploadedFile::fake()->create('policy.pdf', 2048, 'application/pdf'),
        'issuing_unit' => 'FMCA Patient Services',
        'issue_date' => '2026-09-01',
        'owner' => 'FMCA Patient Services',
        'reviewed_at' => '2026-09-20',
    ];
}

test('document managers can open the workspace, others cannot', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $mediaOfficer = User::factory()->withRole('media_officer')->create();
    $department = User::factory()->withRole('department_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($editor)->get(route('cms.documents.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.documents.create'))->assertOk();
    $this->actingAs($mediaOfficer)->get(route('cms.documents.index'))->assertOk();
    $this->actingAs($department)->get(route('cms.documents.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.documents.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.documents.index'))->assertForbidden();
});

test('an editor creates a draft document', function () {
    Storage::fake('public');
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.documents.store'), documentPayload());

    $created = Document::query()->latest()->first();
    $response->assertRedirect(route('cms.documents.edit', ['document' => $created->id]));
    $this->assertDatabaseHas('documents', [
        'title' => 'Visitation policy',
        'status' => 'draft',
        'issuing_unit' => 'FMCA Patient Services',
    ]);
});

test('a document editor cannot publish a new document', function () {
    Storage::fake('public');
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.documents.store'), [...documentPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.documents.store'), documentPayload())
        ->assertRedirect();
    $this->assertDatabaseHas('documents', ['title' => 'Visitation policy', 'status' => 'draft']);
});

test('a media officer can create and publish a document', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();

    $this->actingAs($officer)->post(route('cms.documents.store'), [...documentPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('documents', ['title' => 'Visitation policy', 'status' => 'published']);
});

test('only staff with edit rights can add documents', function () {
    Storage::fake('public');
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.documents.store'), documentPayload())->assertForbidden();
});

test('an editor keeps a published document published or unpublishes it, but cannot publish a draft', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $published = Document::factory()->published()->create(['title' => 'Live policy']);
    $draft = Document::factory()->create(['title' => 'Draft policy']);

    $this->actingAs($editor)->put(route('cms.documents.update', ['document' => $published->id]), [
        'title' => $published->title,
        'status' => 'published',
    ])->assertRedirect(route('cms.documents.index'));
    $this->assertDatabaseHas('documents', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.documents.update', ['document' => $published->id]), [
        'title' => $published->title,
        'status' => 'draft',
    ])->assertRedirect(route('cms.documents.index'));
    $this->assertDatabaseHas('documents', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.documents.update', ['document' => $draft->id]), [
        'title' => $draft->title,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('documents', ['id' => $draft->id, 'status' => 'draft']);
});

test('an editor updates document metadata', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $document = Document::factory()->create(['title' => 'Old title']);

    $this->actingAs($editor)->put(route('cms.documents.update', ['document' => $document->id]), [
        'title' => 'Renamed policy',
        'owner' => 'FMCA Corporate Services',
        'status' => 'draft',
    ])->assertRedirect(route('cms.documents.index'));
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Renamed policy', 'owner' => 'FMCA Corporate Services']);
});

test('published documents are publicly downloadable, drafts are not', function () {
    Storage::fake('public');
    $published = Document::factory()->published()->create(['title' => 'Public policy']);
    Storage::disk('public')->put($published->file_path, 'pdf-bytes');
    $draft = Document::factory()->create(['title' => 'Draft policy']);

    $this->get(route('documents.download', ['document' => $published->id]))
        ->assertOk()
        ->assertDownload($published->file_name);

    $this->get(route('documents.download', ['document' => $draft->id]))->assertNotFound();
});
