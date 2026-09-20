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
            'seo' => [
                'title' => 'Request an Appointment | Federal Medical Centre, Abuja',
                'description' => 'Submit an appointment request to a department at the Federal Medical Centre, Abuja.',
                'canonical' => url('appointments'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ],
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
