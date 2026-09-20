<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('departments', [
            'departments' => Department::published()
                ->withCount(['services' => fn ($query) => $query->published()])
                ->orderBy('name')
                ->get()
                ->map(fn (Department $department): array => [
                    'id' => $department->id,
                    'name' => $department->name,
                    'slug' => $department->slug,
                    'summary' => $department->summary,
                    'servicesCount' => $department->services_count,
                ]),
        ]);
    }

    public function show(string $slug): Response
    {
        $department = Department::published()
            ->where('slug', $slug)
            ->with(['services' => fn ($query) => $query->published()->orderBy('name')])
            ->firstOrFail();

        return Inertia::render('department', [
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'slug' => $department->slug,
                'summary' => $department->summary,
                'description' => $department->description,
                'contactPhone' => $department->contact_phone,
                'contactEmail' => $department->contact_email,
                'owner' => $department->owner,
                'reviewedAt' => $department->reviewed_at?->format('j M Y'),
            ],
            'services' => $department->services->map(fn ($service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'summary' => $service->summary,
            ]),
        ]);
    }
}
