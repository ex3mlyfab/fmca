<?php

use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function mediaPayload(): array
{
    return [
        'label' => 'Campaign hero',
        'kind' => 'image',
        'file' => UploadedFile::fake()->image('hero.jpg'),
        'alt_text' => 'FMCA reception and atrium',
        'owner' => 'FMCA Communications',
        'reviewed_at' => '2026-09-20',
    ];
}

test('media managers can open the media library, others cannot', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $mediaOfficer = User::factory()->withRole('media_officer')->create();
    $department = User::factory()->withRole('department_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($editor)->get(route('cms.media.index'))->assertOk();
    $this->actingAs($mediaOfficer)->get(route('cms.media.index'))->assertOk();
    $this->actingAs($department)->get(route('cms.media.index'))->assertOk();
    $this->actingAs($auditor)->get(route('cms.media.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.media.index'))->assertForbidden();
});

test('an uploader creates a media asset', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();

    $response = $this->actingAs($officer)->post(route('cms.media.store'), mediaPayload());

    $response->assertRedirect(route('cms.media.index'));
    $this->assertDatabaseHas('media', [
        'label' => 'Campaign hero',
        'kind' => 'image',
        'alt_text' => 'FMCA reception and atrium',
        'owner' => 'FMCA Communications',
    ]);
    Storage::disk('public')->assertExists(Media::query()->value('file_path'));
});

test('a user without upload rights cannot add media', function () {
    Storage::fake('public');
    $department = User::factory()->withRole('department_editor')->create();

    $this->actingAs($department)->post(route('cms.media.store'), mediaPayload())->assertForbidden();
});

test('video uploads accept video formats and reject images', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();

    $this->actingAs($officer)->post(route('cms.media.store'), [
        'label' => 'Motion spot',
        'kind' => 'video',
        'file' => UploadedFile::fake()->create('spot.mp4', 2048, 'video/mp4'),
        'alt_text' => 'Institutional highlight reel',
    ])->assertRedirect(route('cms.media.index'));

    $this->actingAs($officer)->post(route('cms.media.store'), [
        'label' => 'Bad video',
        'kind' => 'video',
        'file' => UploadedFile::fake()->image('frame.jpg'),
        'alt_text' => 'Wrong format for video',
    ])->assertSessionHasErrors('file');

    $this->actingAs($officer)->post(route('cms.media.store'), [
        'label' => 'Big image',
        'kind' => 'image',
        'file' => UploadedFile::fake()->create('photo.png', 5024, 'image/png'),
        'alt_text' => 'Too large',
    ])->assertSessionHasErrors('file');
});

test('an uploader edits media metadata and can replace the file', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();
    $media = Media::factory()->create(['label' => 'Old label']);
    $originalPath = $media->file_path;

    $response = $this->actingAs($officer)->put(route('cms.media.update', ['media' => $media->id]), [
        'label' => 'New label',
        'kind' => $media->kind,
        'file' => UploadedFile::fake()->image('new.jpg'),
        'alt_text' => 'Updated alt text',
    ]);

    $response->assertRedirect(route('cms.media.index'));
    $this->assertDatabaseHas('media', ['id' => $media->id, 'label' => 'New label']);
    expect(Media::query()->find($media->id)->file_path)->not->toEqual($originalPath);
});

test('a user without upload rights cannot edit media', function () {
    $department = User::factory()->withRole('department_editor')->create();
    $media = Media::factory()->create();

    $this->actingAs($department)->put(route('cms.media.update', ['media' => $media->id]), [
        'label' => 'Sneaky',
        'kind' => 'image',
        'alt_text' => 'Nope',
    ])->assertForbidden();
});

test('only staff with delete rights can remove media', function () {
    Storage::fake('public');
    $mediaOfficer = User::factory()->withRole('media_officer')->create();
    $editor = User::factory()->withRole('communications_editor')->create();
    $media = Media::factory()->create();

    $this->actingAs($editor)->delete(route('cms.media.destroy', ['media' => $media->id]))->assertForbidden();
    $this->assertDatabaseHas('media', ['id' => $media->id]);

    $this->actingAs($mediaOfficer)->delete(route('cms.media.destroy', ['media' => $media->id]))->assertRedirect(route('cms.media.index'));
    $this->assertDatabaseMissing('media', ['id' => $media->id]);
});
