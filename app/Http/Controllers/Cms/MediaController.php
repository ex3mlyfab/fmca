<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\UpdateMediaRequest;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/media/index', [
            'media' => Media::query()->latest()->get()->map(fn (Media $media) => [
                'id' => $media->id,
                'label' => $media->label,
                'kind' => $media->kind,
                'url' => $media->url(),
                'fileName' => $media->file_name,
                'sizeBytes' => $media->size_bytes,
                'altText' => $media->alt_text,
                'owner' => $media->owner,
                'reviewedAt' => $media->reviewed_at?->format('j M Y'),
                'canDelete' => Gate::allows('delete', $media),
            ])->values(),
            'canUpload' => Gate::allows('create', Media::class),
        ]);
    }

    public function store(StoreMediaRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $path = $file->store('media/'.now()->format('Y/m'), 'public');

        Media::query()->create([
            'label' => $request->string('label')->toString(),
            'kind' => $request->input('kind'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'alt_text' => $request->string('alt_text')->toString(),
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.media.index');
    }

    public function edit(Media $media): Response
    {
        Gate::authorize('update', $media);

        return Inertia::render('cms/media/edit', [
            'media' => [
                'id' => $media->id,
                'label' => $media->label,
                'kind' => $media->kind,
                'url' => $media->url(),
                'fileName' => $media->file_name,
                'altText' => $media->alt_text,
                'owner' => $media->owner,
                'reviewedAt' => $media->reviewed_at?->format('Y-m-d'),
                'canDelete' => Gate::allows('delete', $media),
            ],
        ]);
    }

    public function update(UpdateMediaRequest $request, Media $media): RedirectResponse
    {
        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($media->file_path);

            $file = $request->file('file');
            $path = $file->store('media/'.now()->format('Y/m'), 'public');

            $media->fill([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ]);
        }

        $media->update([
            'label' => $request->string('label')->toString(),
            'kind' => $request->input('kind'),
            'alt_text' => $request->string('alt_text')->toString(),
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
        ]);

        return to_route('cms.media.index');
    }

    public function destroy(Media $media): RedirectResponse
    {
        Gate::authorize('delete', $media);

        Storage::disk('public')->delete($media->file_path);
        $media->delete();

        return to_route('cms.media.index');
    }
}
