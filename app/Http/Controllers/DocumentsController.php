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
     * Files live on the non-public `local` disk; the raw storage path is
     * never web-reachable, so the route is the only access path.
     */
    public function download(Document $document): StreamedResponse
    {
        abort_unless($document->status === 'published', 404);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }
}
