<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHomeConfigurationRequest;
use App\Models\AuditLog;
use App\Models\ContentRevision;
use App\Models\HomeConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class HomepageController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('cms/homepage', [
            'configuration' => HomeConfiguration::query()->latest()->first(),
            'sections' => [
                'Global Header', 'Emergency & Status', 'Homepage Campaigns',
                'Quick Services', 'Institutional Metrics', 'Insurance Guidance',
                'Centres of Excellence', 'Institutional Strength', 'Campus Access',
                'Global Footer',
            ],
            'canApprove' => $user?->canApproveHomepage() ?? false,
            'canPublish' => $user?->hasPermission('publish_homepage') ?? false,
            'canArchive' => $user?->canArchiveHomepage() ?? false,
        ]);
    }

    public function submitForReview(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        Gate::authorize('update', $homeConfiguration);
        abort_unless(in_array($homeConfiguration->status, ['draft', 'changes_requested'], true), 422);
        $homeConfiguration->update(['status' => 'in_review']);

        ContentRevision::snapshot('home', $homeConfiguration->id, 'in_review', $homeConfiguration->sections, $request->user()->id, 'Submitted for clinical review');
        AuditLog::log(AuditLog::ACTION_SUBMITTED_FOR_REVIEW, $request->user()->id, 'home', $homeConfiguration->id, 'Submitted for clinical review');

        return to_route('cms.homepage.edit');
    }

    /**
     * Approver sign-off: a configuration in review becomes approved and
     * records who approved it and when.
     */
    public function approve(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        abort_unless($request->user()->canApproveHomepage(), 403);
        abort_unless($homeConfiguration->status === 'in_review', 422);
        $homeConfiguration->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ContentRevision::snapshot('home', $homeConfiguration->id, 'approved', $homeConfiguration->sections, $request->user()->id, 'Approved for publication');
        AuditLog::log(AuditLog::ACTION_APPROVED, $request->user()->id, 'home', $homeConfiguration->id, 'Approved for publication');

        return to_route('cms.homepage.edit');
    }

    /**
     * The approver sends a configuration back to the editor with a note.
     */
    public function requestChanges(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        abort_unless($request->user()->canApproveHomepage(), 403);
        abort_unless($homeConfiguration->status === 'in_review', 422);
        $homeConfiguration->update(['status' => 'changes_requested']);

        ContentRevision::snapshot('home', $homeConfiguration->id, 'changes_requested', $homeConfiguration->sections, $request->user()->id, 'Changes requested');
        AuditLog::log(AuditLog::ACTION_CHANGES_REQUESTED, $request->user()->id, 'home', $homeConfiguration->id, 'Changes requested by clinical reviewer');

        return to_route('cms.homepage.edit');
    }

    /**
     * An approved configuration goes live: the public home page serves it.
     */
    public function publish(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        abort_unless($request->user()->hasPermission('publish_homepage'), 403);
        abort_unless($homeConfiguration->status === 'approved', 422);
        $homeConfiguration->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        ContentRevision::snapshot('home', $homeConfiguration->id, 'published', $homeConfiguration->sections, $request->user()->id, 'Published');
        AuditLog::log(AuditLog::ACTION_PUBLISHED, $request->user()->id, 'home', $homeConfiguration->id, 'Homepage published');

        return to_route('cms.homepage.edit');
    }

    /**
     * Take a live configuration offline. The published_at timestamp is kept
     * so the audit trail shows when it was live.
     */
    public function archive(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        abort_unless($request->user()->canArchiveHomepage(), 403);
        abort_unless($homeConfiguration->status === 'published', 422);
        $homeConfiguration->update([
            'status' => 'archived',
            'published_at' => $homeConfiguration->published_at ?? now(),
        ]);

        ContentRevision::snapshot('home', $homeConfiguration->id, 'archived', $homeConfiguration->sections, $request->user()->id, 'Archived');
        AuditLog::log(AuditLog::ACTION_ARCHIVED, $request->user()->id, 'home', $homeConfiguration->id, 'Homepage archived');

        return to_route('cms.homepage.edit');
    }

    /**
     * Delete the configuration. Denials are audited as deletion attempts,
     * as the governance log requires.
     */
    public function destroy(Request $request, HomeConfiguration $homeConfiguration): RedirectResponse
    {
        if (! Gate::allows('delete', $homeConfiguration)) {
            AuditLog::log(AuditLog::ACTION_DELETED_ATTEMPTED, $request->user()->id, 'home', $homeConfiguration->id, 'Deletion denied by policy');
            abort(403);
        }

        $homeConfiguration->delete();

        ContentRevision::query()
            ->where('content_type', 'home')
            ->where('content_id', $homeConfiguration->id)
            ->delete();

        AuditLog::log(AuditLog::ACTION_DELETED, $request->user()->id, 'home', $homeConfiguration->id, 'Homepage configuration deleted');

        return to_route('cms.homepage.edit');
    }

    public function store(StoreHomeConfigurationRequest $request): RedirectResponse
    {
        $configuration = HomeConfiguration::query()->latest()->first();

        if ($configuration !== null) {
            Gate::authorize('update', $configuration);
        } else {
            Gate::authorize('create', HomeConfiguration::class);
        }

        $isUpdate = $configuration !== null;

        HomeConfiguration::query()->updateOrCreate(
            ['id' => $configuration?->id],
            [
                'status' => 'draft',
                'sections' => [
                    'hero' => [
                        'title' => $request->string('hero_title')->toString(),
                        'summary' => $request->string('hero_summary')->toString(),
                    ],
                    'emergency' => [
                        'message' => $request->filled('emergency_message') ? $request->string('emergency_message')->toString() : 'Clinical emergency triage is active. For life-threatening emergencies, dispatch or visit directly.',
                        'phone' => $request->filled('emergency_phone') ? $request->string('emergency_phone')->toString() : '+2340000000000',
                        'phoneLabel' => 'Emergency dispatch call',
                    ],
                    'status' => [
                        'campusStatus' => $request->filled('campus_status') ? $request->string('campus_status')->toString() : 'Campus operations: Normal clinical capacity',
                        'serviceDesk' => $request->filled('service_desk') ? $request->string('service_desk')->toString() : 'Triage & desk: 24/7 active',
                        'reviewStatus' => 'Verified institutional release',
                    ],
                ],
                'created_by' => $configuration?->created_by ?? $request->user()->id,
                'approved_by' => null,
                'reviewed_at' => null,
                'publish_at' => null,
                'published_at' => null,
            ],
        );

        $record = HomeConfiguration::query()->latest()->first();

        ContentRevision::snapshot(
            'home',
            $record->id,
            'draft',
            $record->sections,
            $request->user()->id,
            $isUpdate ? 'Draft updated' : 'Draft created',
        );
        AuditLog::log(
            $isUpdate ? AuditLog::ACTION_UPDATED : AuditLog::ACTION_CREATED,
            $request->user()->id,
            'home',
            $record->id,
            $isUpdate ? 'Homepage draft updated' : 'Homepage draft created',
        );

        return to_route('cms.homepage.edit');
    }

    /**
     * Revision history for the current configuration: compare and restore
     * live from this screen.
     */
    public function revisions(): Response
    {
        $configuration = HomeConfiguration::query()->latest()->first();

        return Inertia::render('cms/homepage/revisions', [
            'configuration' => $configuration,
            'revisions' => $configuration === null
                ? collect()
                : ContentRevision::historyFor('home', $configuration->id)
                    ->map(fn (ContentRevision $revision) => [
                        'id' => $revision->id,
                        'revision' => $revision->revision,
                        'status' => $revision->status,
                        'sections' => $revision->sections,
                        'summary' => $revision->summary,
                        'createdByName' => $revision->creator?->name,
                        'createdAt' => $revision->created_at->toDateTimeString(),
                    ])
                    ->values(),
            'canRestore' => $configuration !== null
                && Gate::allows('update', $configuration)
                && in_array($configuration->status, ['draft', 'changes_requested'], true),
        ]);
    }

    /**
     * Roll the configuration back to a previous snapshot. Restoring always
     * lands in draft so the content re-enters the review workflow before
     * it can be republished.
     */
    public function restoreRevision(Request $request, ContentRevision $revision): RedirectResponse
    {
        if ($revision->content_type !== 'home') {
            abort(404);
        }

        $configuration = HomeConfiguration::query()->find($revision->content_id);
        abort_if($configuration === null, 404);

        Gate::authorize('update', $configuration);
        abort_unless(in_array($configuration->status, ['draft', 'changes_requested'], true), 422);

        $configuration->update([
            'status' => 'draft',
            'sections' => $revision->sections ?? [],
            'approved_by' => null,
            'reviewed_at' => null,
            'publish_at' => null,
            'published_at' => null,
        ]);

        ContentRevision::snapshot(
            'home',
            $configuration->id,
            'draft',
            $configuration->sections,
            $request->user()->id,
            "Restored from revision {$revision->revision}",
        );
        AuditLog::log(AuditLog::ACTION_RESTORED, $request->user()->id, 'home', $configuration->id, "Restored revision {$revision->revision}");

        return to_route('cms.homepage.revisions');
    }
}
