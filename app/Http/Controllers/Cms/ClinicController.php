<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClinicRequest;
use App\Http\Requests\UpdateClinicRequest;
use App\Models\Clinic;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/clinics/index', [
            'clinics' => Clinic::query()->orderBy('name')->get(['id', 'name', 'summary', 'status', 'department_id', 'owner', 'reviewed_at']),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canCreate' => Gate::allows('create', Clinic::class),
            'canPublish' => $this->user()?->hasPermission('publish_clinics') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Clinic::class);

        return Inertia::render('cms/clinics/edit', [
            'clinic' => null,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canPublish' => $this->user()?->hasPermission('publish_clinics') ?? false,
        ]);
    }

    public function store(StoreClinicRequest $request): RedirectResponse
    {
        $clinic = Clinic::query()->create([
            'name' => $request->string('name')->toString(),
            'summary' => $request->filled('summary') ? $request->string('summary')->toString() : null,
            'hours' => $request->filled('hours') ? $request->string('hours')->toString() : null,
            'department_id' => $request->integer('department_id') ?: null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.clinics.edit', ['clinic' => $clinic->id]);
    }

    public function edit(Clinic $clinic): Response
    {
        return Inertia::render('cms/clinics/edit', [
            'clinic' => $this->clinicAttributes($clinic),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'canPublish' => $this->user()?->hasPermission('publish_clinics') ?? false,
        ]);
    }

    public function update(UpdateClinicRequest $request, Clinic $clinic): RedirectResponse
    {
        $clinic->update([
            'name' => $request->string('name')->toString(),
            'summary' => $request->filled('summary') ? $request->string('summary')->toString() : null,
            'hours' => $request->filled('hours') ? $request->string('hours')->toString() : null,
            'department_id' => $request->integer('department_id') ?: null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $clinic->status),
        ]);

        return to_route('cms.clinics.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function clinicAttributes(Clinic $clinic): array
    {
        return [
            'id' => $clinic->id,
            'name' => $clinic->name,
            'summary' => $clinic->summary,
            'hours' => $clinic->hours,
            'department_id' => $clinic->department_id,
            'owner' => $clinic->owner,
            'reviewed_at' => $clinic->reviewed_at?->format('Y-m-d'),
            'status' => $clinic->status,
        ];
    }

    private function user()
    {
        return request()->user();
    }
}
