<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/documents/index', [
            'documents' => Document::query()->latest()->get()->map(fn (Document $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'status' => $document->status,
                'fileName' => $document->file_name,
                'sizeBytes' => $document->size_bytes,
                'issuingUnit' => $document->issuing_unit,
                'issueDate' => $document->issue_date?->format('j M Y'),
                'owner' => $document->owner,
                'reviewedAt' => $document->reviewed_at?->format('j M Y'),
                'downloadUrl' => $document->status === 'published' ? route('documents.download', $document->id) : null,
            ])->values(),
            'canCreate' => Gate::allows('create', Document::class),
            'canPublish' => $this->user()?->hasPermission('publish_documents') ?? false,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Document::class);

        return Inertia::render('cms/documents/edit', [
            'document' => null,
            'canPublish' => $this->user()?->hasPermission('publish_documents') ?? false,
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $path = $file->store('documents/'.now()->format('Y/m'), 'local');

        $document = Document::query()->create([
            'title' => $request->string('title')->toString(),
            'summary' => $request->filled('summary') ? $request->string('summary')->toString() : null,
            'file_name' => basename($file->getClientOriginalName()),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'issuing_unit' => $request->filled('issuing_unit') ? $request->string('issuing_unit')->toString() : null,
            'issue_date' => $request->filled('issue_date') ? $request->date('issue_date') : null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', 'draft'),
            'created_by' => $request->user()->id,
        ]);

        return to_route('cms.documents.edit', ['document' => $document->id]);
    }

    public function edit(Document $document): Response
    {
        return Inertia::render('cms/documents/edit', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'summary' => $document->summary,
                'fileName' => $document->file_name,
                'issuingUnit' => $document->issuing_unit,
                'issueDate' => $document->issue_date?->format('Y-m-d'),
                'owner' => $document->owner,
                'reviewedAt' => $document->reviewed_at?->format('Y-m-d'),
                'status' => $document->status,
            ],
            'canPublish' => $this->user()?->hasPermission('publish_documents') ?? false,
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        if ($request->hasFile('file')) {
            Storage::disk('local')->delete($document->file_path);

            $file = $request->file('file');
            $path = $file->store('documents/'.now()->format('Y/m'), 'local');

            $document->fill([
                'file_name' => basename($file->getClientOriginalName()),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ]);
        }

        $document->update([
            'title' => $request->string('title')->toString(),
            'summary' => $request->filled('summary') ? $request->string('summary')->toString() : null,
            'issuing_unit' => $request->filled('issuing_unit') ? $request->string('issuing_unit')->toString() : null,
            'issue_date' => $request->filled('issue_date') ? $request->date('issue_date') : null,
            'owner' => $request->filled('owner') ? $request->string('owner')->toString() : null,
            'reviewed_at' => $request->filled('reviewed_at') ? $request->date('reviewed_at') : null,
            'status' => $request->input('status', $document->status),
        ]);

        return to_route('cms.documents.index');
    }

    private function user()
    {
        return request()->user();
    }
}
