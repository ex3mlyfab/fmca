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

test('a media file whose content does not match an allowed type is rejected', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();

    // The .jpg extension passes `mimes`, but the content MIME type is not an
    // allowed image type, so `mimetypes` rejects it.
    $this->actingAs($officer)->post(route('cms.media.store'), [
        'label' => 'Spoofed image',
        'kind' => 'image',
        'file' => UploadedFile::fake()->create('hero.jpg', 10, 'text/plain'),
        'alt_text' => 'Not actually an image',
    ])->assertSessionHasErrors('file');

    expect(Media::query()->where('label', 'Spoofed image')->exists())->toBeFalse();
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

test('image upload generates responsive variants', function () {
    Storage::fake('public');
    $officer = User::factory()->withRole('media_officer')->create();

    $response = $this->actingAs($officer)->post(route('cms.media.store'), [
        'label' => 'Responsive test image',
        'kind' => 'image',
        'file' => UploadedFile::fake()->image('test.jpg'),
        'alt_text' => 'Test alt text',
    ]);

    $response->assertRedirect(route('cms.media.index'));

    $media = Media::query()->where('label', 'Responsive test image')->first();

    $this->assertNotNull($media);
    $this->assertNotNull($media->file_path);
    $this->assertNotNull($media->thumbnail_path);
    $this->assertNotNull($media->medium_path);
    $this->assertNotNull($media->large_path);

    // Verify all files exist in storage
    Storage::disk('public')->assertExists($media->file_path);
    Storage::disk('public')->assertExists($media->thumbnail_path);
    Storage::disk('public')->assertExists($media->medium_path);
    Storage::disk('public')->assertExists($media->large_path);

    // Verify URLs are accessible
    $this->assertNotEmpty($media->url());
    $this->assertNotEmpty($media->url('thumbnail'));
    $this->assertNotEmpty($media->url('medium'));
    $this->assertNotEmpty($media->url('large'));
});

test('bulk delete removes multiple media items', function () {
    Storage::fake('public');
    $mediaOfficer = User::factory()->withRole('media_officer')->create();

    // Create media items with storage-backed originals and variants.
    $mediaIds = [];
    for ($i = 1; $i <= 3; $i++) {
        $media = Media::factory()->create([
            'label' => "Bulk delete test $i",
            'kind' => 'image',
            'alt_text' => 'Test alt',
            'file_path' => "media/test/original-$i.jpg",
            'thumbnail_path' => "media/test/thumbnail-$i.jpg",
            'medium_path' => "media/test/medium-$i.jpg",
            'large_path' => "media/test/large-$i.jpg",
        ]);
        $mediaIds[] = $media->id;

        foreach (['file_path', 'thumbnail_path', 'medium_path', 'large_path'] as $column) {
            Storage::disk('public')->put($media->{$column}, 'test image');
        }
    }

    // Verify they exist
    foreach ($mediaIds as $id) {
        $this->assertDatabaseHas('media', ['id' => $id]);
    }

    // Perform bulk delete
    $response = $this->actingAs($mediaOfficer)->post(route('cms.media.bulk-delete'), [
        'ids' => $mediaIds,
    ]);

    $response->assertRedirect(route('cms.media.index'));

    // Verify all are deleted
    foreach ($mediaIds as $id) {
        $this->assertDatabaseMissing('media', ['id' => $id]);
    }

    // Verify all originals and variants are deleted from storage.
    foreach (range(1, 3) as $i) {
        foreach (['original', 'thumbnail', 'medium', 'large'] as $variant) {
            Storage::disk('public')->assertMissing("media/test/{$variant}-$i.jpg");
        }
    }
});

test('bulk delete respects per-item authorization', function () {
    Storage::fake('public');
    $mediaOfficer = User::factory()->withRole('media_officer')->create();
    $departmentEditor = User::factory()->withRole('department_editor')->create(); // Can view but not delete

    // Create media items
    $media = Media::factory()->create([
        'label' => 'Auth test media',
        'kind' => 'image',
        'alt_text' => 'Test alt',
    ]);

    // Verify media officer can delete
    $this->actingAs($mediaOfficer)->delete(route('cms.media.destroy', ['media' => $media->id]))
        ->assertRedirect(route('cms.media.index'));

    // Recreate because it was deleted
    $media = Media::factory()->create([
        'label' => 'Auth test media',
        'kind' => 'image',
        'alt_text' => 'Test alt',
    ]);

    // Verify department editor cannot delete via bulk
    $response = $this->actingAs($departmentEditor)->post(route('cms.media.bulk-delete'), [
        'ids' => [$media->id],
    ]);

    $response->assertForbidden(); // Should fail because user lacks delete permission
    $this->assertDatabaseHas('media', ['id' => $media->id]); // Should still exist
});
