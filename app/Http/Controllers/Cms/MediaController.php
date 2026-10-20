<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkDeleteMediaRequest;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\UpdateMediaRequest;
use App\Models\Media;
use App\Services\MediaImageResizer;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Media::query()->latest();

        $search = $request->query('search');
        if ($search) {
            $query->where('label', 'like', "%{$search}%")
                ->orWhere('kind', 'like', "%{$search}%")
                ->orWhere('owner', 'like', "%{$search}%");
        }

        $kind = $request->query('kind');
        if ($kind) {
            $query->where('kind', $kind);
        }

        $perPage = $request->query('perPage', 20);
        $page = $request->query('page', 1);

        $total = $query->count();
        $media = $query->forPage($page, $perPage)->get()->filter(fn (Media $media) => Storage::disk('public')->exists($media->file_path))->map(fn (Media $media) => [
            'id' => $media->id,
            'label' => $media->label,
            'kind' => $media->kind,
            'url' => $media->url(),
            'thumbnailUrl' => $media->url('thumbnail'),
            'mediumUrl' => $media->url('medium'),
            'largeUrl' => $media->url('large'),
            'fileName' => $media->file_name,
            'sizeBytes' => $media->size_bytes,
            'altText' => $media->alt_text,
            'owner' => $media->owner,
            'reviewedAt' => $media->reviewed_at?->format('j M Y'),
            'canDelete' => Gate::allows('delete', $media),
        ])->values();

        return Inertia::render('cms/media/index', [
            'media' => $media,
            'canUpload' => Gate::allows('create', Media::class),
            'pagination' => [
                'total' => $total,
                'perPage' => $perPage,
                'currentPage' => $page,
                'lastPage' => ceil($total / $perPage),
            ],
            'filters' => [
                'search' => $search ?? '',
                'kind' => $kind ?? '',
            ],
        ]);
    }

    public function store(StoreMediaRequest $request, MediaImageResizer $resizer): RedirectResponse
    {
        $file = $request->file('file');
        $directory = 'media/'.now()->format('Y/m');
        $path = $file->store($directory, 'public');

        $variants = $resizer->resize($file, $directory);

        Media::query()->create([
            'label' => $request->string('label')->toString(),
            'kind' => $request->input('kind'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'thumbnail_path' => $variants['thumbnail_path'],
            'medium_path' => $variants['medium_path'],
            'large_path' => $variants['large_path'],
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
                'thumbnailUrl' => $media->url('thumbnail'),
                'mediumUrl' => $media->url('medium'),
                'largeUrl' => $media->url('large'),
                'fileName' => $media->file_name,
                'altText' => $media->alt_text,
                'owner' => $media->owner,
                'reviewedAt' => $media->reviewed_at?->format('Y-m-d'),
                'canDelete' => Gate::allows('delete', $media),
            ],
        ]);
    }

    public function update(UpdateMediaRequest $request, Media $media, MediaImageResizer $resizer): RedirectResponse
    {
        if ($request->hasFile('file')) {
            $this->deleteAllFiles($media);

            $file = $request->file('file');
            $directory = 'media/'.now()->format('Y/m');
            $path = $file->store($directory, 'public');
            $variants = $resizer->resize($file, $directory);

            $media->fill([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'thumbnail_path' => $variants['thumbnail_path'],
                'medium_path' => $variants['medium_path'],
                'large_path' => $variants['large_path'],
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

        $media->delete();
        $this->deleteAllFiles($media);

        return to_route('cms.media.index');
    }

    public function bulkDelete(BulkDeleteMediaRequest $request): RedirectResponse
    {
        $ids = $request->validated('ids');
        $deleted = 0;

        foreach ($ids as $id) {
            $media = Media::query()->find($id);
            if (! $media) {
                continue;
            }

            try {
                Gate::authorize('delete', $media);
            } catch (AuthorizationException) {
                continue;
            }

            $media->delete();
            $this->deleteAllFiles($media);
            $deleted++;
        }

        return to_route('cms.media.index')->with('success', "{$deleted} media item(s) deleted.");
    }

    /**
     * Delete the original file and all variant files from storage.
     */
    private function deleteAllFiles(Media $media): void
    {
        $disk = Storage::disk('public');

        foreach (['file_path', 'thumbnail_path', 'medium_path', 'large_path'] as $column) {
            $path = $media->{$column};
            if ($path && $disk->exists($path)) {
                $disk->delete($path);
            }
        }
    }
}
