<?php

use App\Models\AuditLog;
use App\Models\ContentRevision;
use App\Models\HomeConfiguration;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function draftPayload(string $heroTitle = 'Care information you can trust'): array
{
    return [
        'hero_title' => $heroTitle,
        'hero_summary' => 'A supporting summary for the homepage hero.',
    ];
}

function auditCount(string $action, ?int $contentId): int
{
    return AuditLog::query()
        ->where('action', $action)
        ->where('content_type', 'home')
        ->where('content_id', $contentId)
        ->count();
}

test('saving a homepage draft records a created revision and audit entry', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('A reviewed demo title'))
        ->assertRedirect(route('cms.homepage.edit'));

    $configuration = HomeConfiguration::query()->latest()->first();

    expect(ContentRevision::query()->count())->toBe(1);

    $revision = ContentRevision::query()->first();
    expect($revision->content_type)->toBe('home');
    expect($revision->content_id)->toBe($configuration->id);
    expect($revision->revision)->toBe(1);
    expect($revision->status)->toBe('draft');
    expect($revision->sections['hero']['title'])->toBe('A reviewed demo title');
    expect($revision->summary)->toBe('Draft created');
    expect($revision->created_by)->toBe($editor->id);

    expect(auditCount('created', $configuration->id))->toBe(1);
    expect(AuditLog::query()->first()->ip_address)->toBe('127.0.0.1');
});

test('re-saving the homepage draft appends a second revision and an updated audit entry', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('First hero title'));
    $configuration = HomeConfiguration::query()->latest()->first();
    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('Second hero title'));

    expect(ContentRevision::query()->pluck('revision')->sort()->all())->toBe([1, 2]);
    expect($configuration->refresh()->sections['hero']['title'])->toBe('Second hero title');
    expect(auditCount('created', $configuration->id))->toBe(1);
    expect(auditCount('updated', $configuration->id))->toBe(1);
});

test('submitting for review snapshots a revision and audits the event', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload());
    $configuration = HomeConfiguration::query()->latest()->first();

    $this->actingAs($editor)
        ->post(route('cms.homepage.review', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    expect($configuration->refresh()->status)->toBe('in_review');
    expect(ContentRevision::query()->count())->toBe(2);
    expect(ContentRevision::query()->where('revision', 2)->first()->status)->toBe('in_review');
    expect(auditCount('submitted_for_review', $configuration->id))->toBe(1);
});

test('an approver can approve a configuration in review', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'in_review']);
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)
        ->post(route('cms.homepage.approve', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    $configuration->refresh();
    expect($configuration->status)->toBe('approved');
    expect($configuration->approved_by)->toBe($approver->id);
    expect($configuration->reviewed_at)->not->toBeNull();
    expect(auditCount('approved', $configuration->id))->toBe(1);
    expect(ContentRevision::query()->where('status', 'approved')->count())->toBe(1);
});

test('a user without approve_homepage cannot approve or request changes', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'in_review']);
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.approve', $configuration))->assertForbidden();
    $this->actingAs($editor)->post(route('cms.homepage.changes', $configuration))->assertForbidden();

    expect($configuration->refresh()->status)->toBe('in_review');
    expect(AuditLog::query()->where('action', 'approved')->count())->toBe(0);
});

test('approving a configuration that is not in review is rejected', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'draft']);
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.homepage.approve', $configuration))->assertStatus(422);

    expect($configuration->refresh()->status)->toBe('draft');
});

test('an approver can request changes on a configuration in review', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'in_review']);
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)
        ->post(route('cms.homepage.changes', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    expect($configuration->refresh()->status)->toBe('changes_requested');
    expect(auditCount('changes_requested', $configuration->id))->toBe(1);
});

test('a publisher can publish an approved configuration', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'approved']);
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.homepage.publish', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    $configuration->refresh();
    expect($configuration->status)->toBe('published');
    expect($configuration->published_at)->not->toBeNull();
    expect(auditCount('published', $configuration->id))->toBe(1);
});

test('publishing a configuration that is not approved is rejected', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'draft']);
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.publish', $configuration))->assertStatus(422);

    expect($configuration->refresh()->status)->toBe('draft');
});

test('a user without publish_homepage cannot publish', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'approved']);
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.homepage.publish', $configuration))->assertForbidden();

    expect($configuration->refresh()->status)->toBe('approved');
});

test('an archiver can archive a published configuration', function () {
    $publishedAt = now()->subDay();
    $configuration = HomeConfiguration::factory()->create([
        'status' => 'published',
        'published_at' => $publishedAt,
    ]);
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->post(route('cms.homepage.archive', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    $configuration->refresh();
    expect($configuration->status)->toBe('archived');
    expect($configuration->published_at->toDateTimeString())->toBe($publishedAt->toDateTimeString());
    expect(auditCount('archived', $configuration->id))->toBe(1);
});

test('archiving a configuration that is not published is rejected', function () {
    $configuration = HomeConfiguration::factory()->create(['status' => 'draft']);
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.archive', $configuration))->assertStatus(422);

    expect($configuration->refresh()->status)->toBe('draft');
});

test('a super admin can delete a configuration and its revisions', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload());
    $configuration = HomeConfiguration::query()->latest()->first();
    $admin = User::factory()->withRole('super_admin')->create();

    $this->actingAs($admin)
        ->delete(route('cms.homepage.destroy', $configuration))
        ->assertRedirect(route('cms.homepage.edit'));

    expect(HomeConfiguration::query()->whereKey($configuration->id)->exists())->toBeFalse();
    expect(ContentRevision::query()->where('content_id', $configuration->id)->count())->toBe(0);
    expect(auditCount('deleted', $configuration->id))->toBe(1);
});

test('a denied deletion attempt is audited', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload());
    $configuration = HomeConfiguration::query()->latest()->first();

    $this->actingAs($editor)
        ->delete(route('cms.homepage.destroy', $configuration))
        ->assertForbidden();

    expect(HomeConfiguration::query()->whereKey($configuration->id)->exists())->toBeTrue();
    expect(auditCount('deleted_attempted', $configuration->id))->toBe(1);
});

test('the revisions screen renders the snapshot history', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('First hero title'));
    $configuration = HomeConfiguration::query()->latest()->first();
    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('Second hero title'));

    $this->actingAs($editor)
        ->get(route('cms.homepage.revisions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/homepage/revisions')
            ->where('configuration.id', $configuration->id)
            ->where('canRestore', true)
            ->where('revisions.0.revision', 2)
            ->where('revisions.1.revision', 1)
            ->where('revisions.0.summary', 'Draft updated')
            ->where('revisions.1.summary', 'Draft created'));
});

test('the revisions screen shows an empty state when there is no configuration', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)
        ->get(route('cms.homepage.revisions'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/homepage/revisions')
            ->where('configuration', null)
            ->where('revisions', [])
            ->where('canRestore', false));
});

test('a revision can be restored back into the draft workflow', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('Old hero title'));
    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('New hero title'));

    $original = ContentRevision::query()->where('revision', 1)->first();

    $this->actingAs($editor)
        ->post(route('cms.homepage.restore', ['revision' => $original->id]))
        ->assertRedirect(route('cms.homepage.revisions'));

    $configuration = HomeConfiguration::query()->latest()->first();
    expect($configuration->sections['hero']['title'])->toBe('Old hero title');
    expect($configuration->status)->toBe('draft');
    expect($configuration->approved_by)->toBeNull();
    expect($configuration->published_at)->toBeNull();
    expect(ContentRevision::query()->count())->toBe(3);
    expect(ContentRevision::query()->where('revision', 3)->first()->summary)->toBe('Restored from revision 1');
    expect(auditCount('restored', $configuration->id))->toBe(1);
});

test('restoring is rejected while the configuration is not in an editor state', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload());
    $configuration = HomeConfiguration::query()->latest()->first();
    $configuration->update(['status' => 'published', 'published_at' => now()]);

    $revision = ContentRevision::query()->where('revision', 1)->first();

    $this->actingAs($editor)
        ->post(route('cms.homepage.restore', ['revision' => $revision->id]))
        ->assertStatus(422);

    expect($configuration->refresh()->status)->toBe('published');
});

test('restoring a revision whose configuration no longer exists is a 404', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload());
    $configuration = HomeConfiguration::query()->latest()->first();
    $revision = ContentRevision::query()->where('revision', 1)->first();
    $configuration->delete();

    $this->actingAs($editor)
        ->post(route('cms.homepage.restore', ['revision' => $revision->id]))
        ->assertNotFound();
});

test('the audit log screen lists recent governance events', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('An audited hero title'));
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)
        ->get(route('cms.audit.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/audit')
            ->where('logs.0.action', 'created')
            ->where('logs.0.actorName', $editor->name)
            ->where('logs.0.contentType', 'home'));
});

test('the audit log is forbidden to users without view_audit_logs', function () {
    $mediaOfficer = User::factory()->withRole('media_officer')->create();
    $noRole = User::factory()->create();

    $this->actingAs($mediaOfficer)->get(route('cms.audit.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.audit.index'))->assertForbidden();
});

test('audit entries and revisions are immutable once recorded', function () {
    $editor = User::factory()->withRole('communications_editor')->create();

    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('Original hero title'));
    $this->actingAs($editor)->post(route('cms.homepage.store'), draftPayload('Changed hero title'));

    $createdLog = AuditLog::query()->where('action', 'created')->first();
    $revisionOne = ContentRevision::query()->where('revision', 1)->first();

    $logSnapshot = $createdLog->toJson();
    $revisionSnapshot = $revisionOne->toJson();

    $configuration = HomeConfiguration::query()->latest()->first();
    $this->actingAs($editor)->post(route('cms.homepage.restore', ['revision' => $revisionOne->id]));

    expect(AuditLog::query()->where('action', 'created')->first()->toJson())->toBe($logSnapshot);
    expect(ContentRevision::query()->where('revision', 1)->first()->toJson())->toBe($revisionSnapshot);
    expect($configuration->refresh()->status)->toBe('draft');
});
