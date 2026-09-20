<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Department;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/services/index', [
            'services' => Service::query()
                ->with('department:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'summary', 'status', 'department_id']),
            'canCreate' => Gate::allows('create', Service::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Service::class);

        return Inertia::render('cms/services/edit', [
            'service' => null,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $service = Service::query()->create($request->validated());

        return to_route('cms.services.edit', ['service' => $service->id]);
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('cms/services/edit', [
            'service' => $service,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

        return to_route('cms.services.index');
    }
}
