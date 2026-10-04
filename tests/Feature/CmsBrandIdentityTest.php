<?php

use App\Models\BrandAsset;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

/**
 * Payload for one slot upload. Extra metadata merges over the defaults.
 *
 * @return array<string, array<string, mixed>>
 */
function brandPayload(string $slot, UploadedFile $file, array $extra = []): array
{
    return [
        'slots' => [
            $slot => array_merge([
                'file' => $file,
                'owner' => 'FMCA Corporate Communications',
                'status' => 'draft',
            ], $extra),
        ],
    ];
}

function brandError(string $slot, string $field): string
{
    return "slots.{$slot}.{$field}";
}

function brandEditorWithoutPublish(): User
{
    $role = Role::firstOrCreate(
        ['name' => 'brand_editor_test', 'guard_name' => 'web'],
        ['description' => 'Test-only brand editor without publish rights']
    );
    $role->syncPermissions(['view_brand_identity', 'edit_brand_identity']);

    return User::factory()->create(['role_id' => $role->id]);
}

test('communications and super-admin roles can open the brand identity workspace, others cannot', function () {
    $communications = User::factory()->withRole('communications_editor')->create();
    $admin = User::factory()->withRole('super_admin')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($communications)->get(route('cms.brand-identity.index'))->assertOk();
    $this->actingAs($admin)->get(route('cms.brand-identity.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.brand-identity.index'))->assertForbidden();
    $this->actingAs($media)->get(route('cms.brand-identity.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.brand-identity.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.brand-identity.index'))->assertForbidden();
});

test('a brand editor uploads a header logo that is stored as a draft', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->image('header-logo.png'), [
            'alt_text' => 'Federal Medical Centre, Abuja',
            'reviewed_at' => '2026-09-23',
        ]));

    $response->assertRedirect(route('cms.brand-identity.index'));
    $this->assertDatabaseHas('brand_assets', [
        'slot' => 'header_logo',
        'file_name' => 'header-logo.png',
        'mime_type' => 'image/png',
        'alt_text' => 'Federal Medical Centre, Abuja',
        'owner' => 'FMCA Corporate Communications',
        'status' => 'draft',
    ]);
    Storage::disk('public')->assertExists(BrandAsset::query()->value('file_path'));
});

test('icons have no alt text, which is dropped instead of stored', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FAVICON, UploadedFile::fake()->create('favicon.ico', 4, 'image/x-icon')))
        ->assertRedirect();

    $this->assertDatabaseHas('brand_assets', [
        'slot' => 'favicon',
        'mime_type' => 'image/x-icon',
        'alt_text' => null,
    ]);
});

test('logo slots accept vector uploads but the favicon slot rejects them', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();

    // A favicon is fetched by the browser as a standalone document rather than
    // drawn inside an <img>, so a script-bearing SVG would execute on the
    // domain. Logos are always rendered as images, so vector is safe there.
    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FAVICON, UploadedFile::fake()->create('favicon.svg', 4, 'image/svg+xml')))
        ->assertSessionHasErrors(brandError(BrandAsset::SLOT_FAVICON, 'file'));
    expect(BrandAsset::query()->where('slot', BrandAsset::SLOT_FAVICON)->exists())->toBeFalse();

    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->create('emblem.svg', 4, 'image/svg+xml')))
        ->assertRedirect();
    $this->assertDatabaseHas('brand_assets', ['slot' => 'header_logo', 'mime_type' => 'image/svg+xml']);
});

test('a file whose content type is not an allowed image type is rejected', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();

    // The .png extension passes `mimes`, but the content MIME type is not an
    // allowed image type, so `mimetypes` rejects it.
    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->create('header-logo.png', 10, 'text/plain')))
        ->assertSessionHasErrors(brandError(BrandAsset::SLOT_HEADER_LOGO, 'file'));

    expect(BrandAsset::query()->where('slot', BrandAsset::SLOT_HEADER_LOGO)->exists())->toBeFalse();
});

test('an upload above the slot size ceiling is rejected', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FAVICON, UploadedFile::fake()->create('favicon.png', 600, 'image/png')))
        ->assertSessionHasErrors(brandError(BrandAsset::SLOT_FAVICON, 'file'));

    expect(BrandAsset::query()->where('slot', BrandAsset::SLOT_FAVICON)->exists())->toBeFalse();
});

test('an editor without publish rights cannot publish a brand asset', function () {
    Storage::fake('public');
    $editor = brandEditorWithoutPublish();

    $this->actingAs($editor)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->image('header-logo.png'), ['status' => 'published']))
        ->assertSessionHasErrors(brandError(BrandAsset::SLOT_HEADER_LOGO, 'status'));

    $this->actingAs($editor)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->image('header-logo.png')))
        ->assertRedirect();
    $this->assertDatabaseHas('brand_assets', ['slot' => 'header_logo', 'status' => 'draft']);
});

test('an editor without publish rights keeps a published slot published or unpublishes it, but cannot publish a draft', function () {
    Storage::fake('public');
    $editor = brandEditorWithoutPublish();
    $published = BrandAsset::factory()->published()->inSlot(BrandAsset::SLOT_FOOTER_LOGO)->create();
    $draft = BrandAsset::factory()->inSlot(BrandAsset::SLOT_FAVICON)->create();

    $this->actingAs($editor)->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FOOTER_LOGO, UploadedFile::fake()->image('footer-logo.png'), ['status' => 'published']))
        ->assertRedirect(route('cms.brand-identity.index'));
    $this->assertDatabaseHas('brand_assets', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FOOTER_LOGO, UploadedFile::fake()->image('footer-logo.png'), ['status' => 'draft']))
        ->assertRedirect(route('cms.brand-identity.index'));
    $this->assertDatabaseHas('brand_assets', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_FAVICON, UploadedFile::fake()->create('favicon.png', 4, 'image/png'), ['status' => 'published']))
        ->assertSessionHasErrors(brandError(BrandAsset::SLOT_FAVICON, 'status'));
    $this->assertDatabaseHas('brand_assets', ['id' => $draft->id, 'status' => 'draft']);
});

test('a super admin can publish a brand asset', function () {
    Storage::fake('public');
    $admin = User::factory()->withRole('super_admin')->create();
    $draft = BrandAsset::factory()->inSlot(BrandAsset::SLOT_APPLE_TOUCH_ICON)->create();

    $this->actingAs($admin)->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_APPLE_TOUCH_ICON, UploadedFile::fake()->image('home-screen.png'), ['status' => 'published']))
        ->assertRedirect(route('cms.brand-identity.index'));
    $this->assertDatabaseHas('brand_assets', ['id' => $draft->id, 'status' => 'published']);
});

test('replacing an asset stores the new file and removes the previous one', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();
    $existing = BrandAsset::factory()->inSlot(BrandAsset::SLOT_HEADER_LOGO)->create();
    Storage::disk('public')->put($existing->file_path, 'previous bytes');

    $this->actingAs($communications)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->image('header-logo-v2.png')))
        ->assertRedirect();

    $fresh = BrandAsset::query()->where('slot', BrandAsset::SLOT_HEADER_LOGO)->first();
    expect($fresh->file_name)->toBe('header-logo-v2.png')
        ->and($fresh->file_path)->not->toBe($existing->file_path);
    Storage::disk('public')->assertMissing($existing->file_path);
    Storage::disk('public')->assertExists($fresh->file_path);
});

test('removing a brand asset deletes the row and its file', function () {
    Storage::fake('public');
    $communications = User::factory()->withRole('communications_editor')->create();
    $asset = BrandAsset::factory()->published()->inSlot(BrandAsset::SLOT_FAVICON)->create();
    Storage::disk('public')->put($asset->file_path, 'tab icon bytes');

    $this->actingAs($communications)->delete(route('cms.brand-identity.destroy', ['asset' => $asset->id]))
        ->assertRedirect(route('cms.brand-identity.index'));

    $this->assertDatabaseMissing('brand_assets', ['id' => $asset->id]);
    Storage::disk('public')->assertMissing($asset->file_path);
});

test('only staff with brand identity edit rights can update brand assets', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)
        ->put(route('cms.brand-identity.update'), brandPayload(BrandAsset::SLOT_HEADER_LOGO, UploadedFile::fake()->image('header-logo.png')))
        ->assertForbidden();
});

test('only published brand assets reach the public site', function () {
    Storage::fake('public');
    $published = BrandAsset::factory()->published()
        ->inSlot(BrandAsset::SLOT_FAVICON)
        ->create(['file_name' => 'published-favicon.png', 'file_path' => 'brand/live/published-favicon.png', 'mime_type' => 'image/png']);
    $draft = BrandAsset::factory()->inSlot(BrandAsset::SLOT_APPLE_TOUCH_ICON)
        ->create(['file_name' => 'draft-touch.png', 'file_path' => 'brand/draft/draft-touch.png', 'mime_type' => 'image/png']);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee($published->url());
    $response->assertDontSee($draft->url());
});

test('the public site falls back to the default icons when none are published', function () {
    BrandAsset::factory()->inSlot(BrandAsset::SLOT_FAVICON)->create();
    BrandAsset::factory()->inSlot(BrandAsset::SLOT_APPLE_TOUCH_ICON)->create();

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('href="/favicon.ico"', false);
    $response->assertSee('href="/favicon.svg"', false);
    $response->assertSee('href="/apple-touch-icon.png"', false);
});
