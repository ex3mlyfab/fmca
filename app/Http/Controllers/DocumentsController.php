<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentsController extends Controller
{
    /**
     * Serve a published document for download. Drafts and unknown
     * documents resolve to a 404 so unreviewed content is never exposed.
     */
    public function download(Document $document): StreamedResponse
    {
        abort_unless($document->status === 'published', 404);

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }
}
