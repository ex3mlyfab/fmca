<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommitteeMemberRequest;
use App\Http\Requests\UpdateCommitteeMemberRequest;
use App\Models\CommitteeMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CommitteeMemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/committees/index', [
            'members' => CommitteeMember::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'role', 'portfolio', 'status', 'owner', 'reviewed_at']),
            'canCreate' => Gate::allows('create', CommitteeMember::class),
            'canPublish' => $this->user()?->hasPermission('publish_committees') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', CommitteeMember::class);

        return Inertia::render('cms/committees/edit', [
            'member' => null,
            'canPublish' => $this->user()?->hasPermission('publish_committees') ?? false,
        ]);
    }

    public function store(StoreCommitteeMemberRequest $request): RedirectResponse
    {
        $member = CommitteeMember::query()->create([
            'name' => $request->string('name')->toString(),
            'slug' => $request->string('slug')->toString(),
            'role' => $request->string('role')->toString(),
            'portfolio' => $request->filled('portfolio') ? $request->string('portfolio')->toString() : null,
            'mandate' => $request->filled('mandate') ? $request->string('mandate')->toString() : null,
            'term' => $request->filled('term') ? $request->string('term')->toString() : null,
            'sort_order' => $request->integer('sort_order') ?: 0,
            'portrait' => $request->filled('portrait') ? $request->string('portrait')->toString() : null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.committees.edit', ['committeeMember' => $member->id]);
    }

    public function edit(CommitteeMember $committeeMember): Response
    {
        return Inertia::render('cms/committees/edit', [
            'member' => $this->memberAttributes($committeeMember),
            'canPublish' => $this->user()?->hasPermission('publish_committees') ?? false,
        ]);
    }

    public function update(UpdateCommitteeMemberRequest $request, CommitteeMember $committeeMember): RedirectResponse
    {
        $committeeMember->update([
            'name' => $request->string('name')->toString(),
            'slug' => $request->string('slug')->toString(),
            'role' => $request->string('role')->toString(),
            'portfolio' => $request->filled('portfolio') ? $request->string('portfolio')->toString() : null,
            'mandate' => $request->filled('mandate') ? $request->string('mandate')->toString() : null,
            'term' => $request->filled('term') ? $request->string('term')->toString() : null,
            'sort_order' => $request->integer('sort_order') ?: 0,
            'portrait' => $request->filled('portrait') ? $request->string('portrait')->toString() : null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $committeeMember->status),
        ]);

        return to_route('cms.committees.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function memberAttributes(CommitteeMember $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'slug' => $member->slug,
            'role' => $member->role,
            'portfolio' => $member->portfolio,
            'mandate' => $member->mandate,
            'term' => $member->term,
            'sort_order' => $member->sort_order,
            'portrait' => $member->portrait,
            'owner' => $member->owner,
            'reviewed_at' => $member->reviewed_at?->format('Y-m-d'),
            'status' => $member->status,
        ];
    }

    private function user()
    {
        return request()->user();
    }
}
