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
     */
    public function url(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }
}
