<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Models\Department;
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
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Department::class);

        return Inertia::render('cms/departments/edit', [
            'department' => null,
        ]);
    }

    public function store(StoreDepartmentRequest $request): RedirectResponse
    {
        $department = Department::query()->create($request->validated());

        return to_route('cms.departments.edit', ['department' => $department->id]);
    }

    public function edit(Department $department): Response
    {
        return Inertia::render('cms/departments/edit', [
            'department' => $department,
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): RedirectResponse
    {
        $department->update($request->validated());

        return to_route('cms.departments.index');
    }
}
