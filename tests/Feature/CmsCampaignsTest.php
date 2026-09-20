<?php

use App\Models\Campaign;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function campaignPayload(?Campaign $campaign = null): array
{
    return [
        'title' => $campaign?->title ?? 'New campaign',
        'eyebrow' => 'Campaign',
        'copy' => 'Supporting copy for the home page carousel.',
        'primary_cta_label' => 'Find services',
        'primary_cta_href' => '#services',
        'owner' => $campaign?->owner ?? 'FMCA Communications',
        'advisory' => '0',
        'sort_order' => 0,
        'status' => 'draft',
    ];
}

test('campaign managers can open the campaign workspace', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $media = User::factory()->withRole('media_officer')->create();
    $department = User::factory()->withRole('department_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($editor)->get(route('cms.campaigns.index'))->assertOk();
    $this->actingAs($editor)->get(route('cms.campaigns.create'))->assertOk();
    $this->actingAs($media)->get(route('cms.campaigns.index'))->assertOk();
    $this->actingAs($department)->get(route('cms.campaigns.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.campaigns.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.campaigns.index'))->assertForbidden();
});

test('the campaign editor page renders for creating and editing', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $campaign = Campaign::factory()->create();

    $this->actingAs($editor)->get(route('cms.campaigns.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('cms/campaigns/edit')->where('campaign', null));

    $this->actingAs($editor)->get(route('cms.campaigns.edit', ['campaign' => $campaign->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('cms/campaigns/edit')->where('campaign.id', $campaign->id));
});

test('an editor creates a draft campaign', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.campaigns.store'), campaignPayload());

    $response->assertRedirect(route('cms.campaigns.edit', ['campaign' => Campaign::query()->latest()->value('id')]));
    $this->assertDatabaseHas('campaigns', [
        'title' => 'New campaign',
        'status' => 'draft',
    ]);
});

test('an editor with publish rights can create a published campaign', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.campaigns.store'), [...campaignPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('campaigns', [
        'title' => 'New campaign',
        'status' => 'published',
    ]);
});

test('a media officer cannot publish campaigns but can create drafts', function () {
    $media = User::factory()->withRole('media_officer')->create();

    $this->actingAs($media)->post(route('cms.campaigns.store'), [...campaignPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($media)->post(route('cms.campaigns.store'), [...campaignPayload(), 'status' => 'draft'])
        ->assertRedirect();
    $this->assertDatabaseHas('campaigns', [
        'title' => 'New campaign',
        'status' => 'draft',
    ]);
});

test('a media officer may keep a published campaign published but cannot publish a draft', function () {
    $media = User::factory()->withRole('media_officer')->create();
    $published = Campaign::factory()->published()->create(['title' => 'Live campaign']);
    $draft = Campaign::factory()->create(['title' => 'Draft campaign']);

    $this->actingAs($media)->put(route('cms.campaigns.update', ['campaign' => $published->id]), [
        ...campaignPayload($published),
        'status' => 'published',
    ])->assertRedirect(route('cms.campaigns.index'));
    $this->assertDatabaseHas('campaigns', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($media)->put(route('cms.campaigns.update', ['campaign' => $draft->id]), [
        ...campaignPayload($draft),
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('campaigns', ['id' => $draft->id, 'status' => 'draft']);
});

test('an editor can unpublish a published campaign', function () {
    $editor = User::factory()->withRole('communications_editor')->create();
    $published = Campaign::factory()->published()->create(['title' => 'Live campaign']);

    $this->actingAs($editor)->put(route('cms.campaigns.update', ['campaign' => $published->id]), [
        ...campaignPayload($published),
        'status' => 'draft',
    ])->assertRedirect(route('cms.campaigns.index'));
    $this->assertDatabaseHas('campaigns', ['id' => $published->id, 'status' => 'draft']);
});

test('campaign validation rejects an end date before the start date', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.campaigns.store'), [
        ...campaignPayload(),
        'start_date' => '2026-09-20',
        'end_date' => '2026-09-01',
    ])->assertSessionHasErrors('end_date');
});

test('campaign validation rejects an out-of-range overlay intensity', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.campaigns.store'), [
        ...campaignPayload(),
        'overlay_intensity' => '150',
    ])->assertSessionHasErrors('overlay_intensity');
});
