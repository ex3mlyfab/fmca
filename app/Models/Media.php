<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'kind',
        'file_name',
        'file_path',
        'thumbnail_path',
        'medium_path',
        'large_path',
        'mime_type',
        'size_bytes',
        'alt_text',
        'owner',
        'reviewed_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The public URL of the stored asset.
     *
     * @param  string  $size  original, thumbnail, medium, or large
     */
    public function url(string $size = 'original'): string
    {
        $path = match ($size) {
            'thumbnail' => $this->thumbnail_path,
            'medium' => $this->medium_path,
            'large' => $this->large_path,
            default => $this->file_path,
        };

        if (! $path) {
            $path = $this->file_path;
        }

        return Storage::disk('public')->url($path);
    }
}
