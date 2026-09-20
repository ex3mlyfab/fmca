<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultantRequest;
use App\Http\Requests\UpdateConsultantRequest;
use App\Models\Consultant;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ConsultantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/consultants/index', [
            'consultants' => Consultant::query()->orderBy('name')->get(['id', 'name', 'slug', 'specialty', 'position', 'status', 'owner', 'reviewed_at']),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canCreate' => Gate::allows('create', Consultant::class),
            'canPublish' => $this->user()?->hasPermission('publish_consultants') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Consultant::class);

        return Inertia::render('cms/consultants/edit', [
            'consultant' => null,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canPublish' => $this->user()?->hasPermission('publish_consultants') ?? false,
        ]);
    }

    public function store(StoreConsultantRequest $request): RedirectResponse
    {
        $consultant = Consultant::query()->create([
            'name' => $request->string('name')->toString(),
            'slug' => $request->string('slug')->toString(),
            'specialty' => $request->string('specialty')->toString(),
            'position' => $request->filled('position') ? $request->string('position')->toString() : null,
            'biography' => $request->filled('biography') ? $request->string('biography')->toString() : null,
            'portrait' => $request->filled('portrait') ? $request->string('portrait')->toString() : null,
            'specialty_tags' => $this->tags($request->input('specialty_tags')),
            'department_id' => $request->integer('department_id') ?: null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.consultants.edit', ['consultant' => $consultant->id]);
    }

    public function edit(Consultant $consultant): Response
    {
        return Inertia::render('cms/consultants/edit', [
            'consultant' => $this->consultantAttributes($consultant),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canPublish' => $this->user()?->hasPermission('publish_consultants') ?? false,
        ]);
    }

    public function update(UpdateConsultantRequest $request, Consultant $consultant): RedirectResponse
    {
        $consultant->update([
            'name' => $request->string('name')->toString(),
            'slug' => $request->string('slug')->toString(),
            'specialty' => $request->string('specialty')->toString(),
            'position' => $request->filled('position') ? $request->string('position')->toString() : null,
            'biography' => $request->filled('biography') ? $request->string('biography')->toString() : null,
            'portrait' => $request->filled('portrait') ? $request->string('portrait')->toString() : null,
            'specialty_tags' => $this->tags($request->input('specialty_tags')),
            'department_id' => $request->integer('department_id') ?: null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $consultant->status),
        ]);

        return to_route('cms.consultants.index');
    }

    /**
     * The comma-separated tag input normalised to the stored array (max 8 tags).
     *
     * @return array<int, string>|null
     */
    private function tags(mixed $input): ?array
    {
        if (trim((string) $input) === '') {
            return null;
        }

        $tags = array_values(array_filter(array_map('trim', explode(',', (string) $input))));

        return array_slice($tags, 0, 8) ?: null;
    }

    /**
     * @return array<string, mixed>
     */
    private function consultantAttributes(Consultant $consultant): array
    {
        return [
            'id' => $consultant->id,
            'name' => $consultant->name,
            'slug' => $consultant->slug,
            'specialty' => $consultant->specialty,
            'position' => $consultant->position,
            'biography' => $consultant->biography,
            'portrait' => $consultant->portrait,
            'specialty_tags' => $consultant->specialty_tags !== null
                ? implode(', ', $consultant->specialty_tags)
                : null,
            'department_id' => $consultant->department_id,
            'owner' => $consultant->owner,
            'reviewed_at' => $consultant->reviewed_at?->format('Y-m-d'),
            'status' => $consultant->status,
        ];
    }

    private function user()
    {
        return request()->user();
    }
}
