<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Models\Department;
use App\Support\BlockContentSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/departments/index', [
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'slug', 'summary', 'status']),
            'canCreate' => Gate::allows('create', Department::class),
            'canPublish' => $this->user()?->hasPermission('publish_departments') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Department::class);

        return Inertia::render('cms/departments/edit', [
            'department' => null,
            'canPublish' => $this->user()?->hasPermission('publish_departments') ?? false,
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['description'] = BlockContentSanitizer::richTextBody($data['description']);
        $department = Department::query()->create($data);

        return to_route('cms.departments.edit', ['department' => $department->id]);
    }

    public function edit(Department $department): Response
    {
        return Inertia::render('cms/departments/edit', [
            'department' => [
                ...$department->toArray(),
                'description' => BlockContentSanitizer::richTextBody($department->description),
            ],
            'canPublish' => $this->user()?->hasPermission('publish_departments') ?? false,
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $data = $request->validated();
        $data['description'] = BlockContentSanitizer::richTextBody($data['description']);
        $department->update($data);

        return to_route('cms.departments.index');
    }

    private function user()
    {
        return request()->user();
    }
}
