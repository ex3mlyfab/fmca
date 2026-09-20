<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequestRequest;
use App\Models\AppointmentRequest;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentsController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('appointments', [
            'departments' => Department::published()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->values()
                ->all(),
            'submitted' => session('appointmentSubmitted', false),
        ]);
    }

    public function store(StoreAppointmentRequestRequest $request): RedirectResponse
    {
        AppointmentRequest::create($request->validated());

        return redirect()
            ->route('appointments')
            ->with('appointmentSubmitted', true);
    }
}
