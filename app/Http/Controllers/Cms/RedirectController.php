<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRedirectRequest;
use App\Http\Requests\UpdateRedirectRequest;
use App\Models\Redirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RedirectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/redirects/index', [
            'redirects' => Redirect::query()
                ->orderBy('from_path')
                ->get(['id', 'from_path', 'to_path', 'status_code', 'is_active']),
            'canCreate' => Gate::allows('create', Redirect::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Redirect::class);

        return Inertia::render('cms/redirects/edit', [
            'redirect' => null,
        ]);
    }

    public function store(StoreRedirectRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $redirect = Redirect::query()->create([
            'from_path' => $data['from_path'],
            'to_path' => $data['to_path'],
            'status_code' => $data['status_code'] ?? 301,
        ]);

        return to_route('cms.redirects.edit', ['redirect' => $redirect->id]);
    }

    public function edit(Redirect $redirect): Response
    {
        return Inertia::render('cms/redirects/edit', [
            'redirect' => $redirect,
        ]);
    }

    public function update(UpdateRedirectRequest $request, Redirect $redirect): RedirectResponse
    {
        $redirect->update($request->safe()->only(['from_path', 'to_path', 'status_code', 'is_active']));

        return to_route('cms.redirects.index');
    }
}
