<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class MediaImageResizer
{
    /**
     * Generate thumbnail, medium, and large variants of an image.
     * Returns an array with keys: thumbnail_path, medium_path, large_path.
     *
     * @return array<string, string|null>
     */
    public function resize(UploadedFile $file, string $destination): array
    {
        $result = [
            'thumbnail_path' => null,
            'medium_path' => null,
            'large_path' => null,
        ];

        if ($file->getMimeType() === 'video/mp4'
            || $file->getMimeType() === 'video/webm'
            || $file->getMimeType() === 'video/quicktime') {
            return $result;
        }

        $result['thumbnail_path'] = $this->resizeVariant($file, $destination, '_thumb', 100, 100);
        $result['medium_path'] = $this->resizeVariant($file, $destination, '_medium', 500, 500);
        $result['large_path'] = $this->resizeVariant($file, $destination, '_large', 1200, 800);

        return $result;
    }

    private function resizeVariant(UploadedFile $file, string $destination, string $suffix, int $width, int $height): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION);
        $newFileName = "{$originalName}{$suffix}.{$extension}";
        $path = "{$destination}/{$newFileName}";

        $sourcePath = $file->getRealPath();

        if (! $sourcePath || ! is_readable($sourcePath)) {
            // Fallback: try the temporary path provided by the request
            $sourcePath = $file->getPathname();
        }

        $image = ImageManager::usingDriver(Driver::class)->decodePath($sourcePath);
        $image->cover($width, $height, 'center');
        $image->save(Storage::disk('public')->path($path));

        return $path;
    }
}
