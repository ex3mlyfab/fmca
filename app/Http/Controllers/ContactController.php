<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('contact', [
            'submitted' => session('contactSubmitted', false),
            'seo' => [
                'title' => 'Contact & Directions | Federal Medical Centre, Abuja',
                'description' => 'Campus address, operating contacts, and the feedback form for the Federal Medical Centre, Abuja website.',
                'canonical' => url('contact'),
                'og_image' => null,
                'robots' => 'index,follow',
                'json_ld' => null,
            ],
        ]);
    }

    public function storeFeedback(StoreContactSubmissionRequest $request): RedirectResponse
    {
        ContactSubmission::create($request->validated());

        return redirect()
            ->route('contact')
            ->with('contactSubmitted', true);
    }
}
