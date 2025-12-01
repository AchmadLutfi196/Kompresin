<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompressionHistory extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'filename',
        'original_path',
        'compressed_path',
        'decompressed_path',
        'original_size',
        'compressed_size',
        'compression_ratio',
        'bits_per_pixel',
        'entropy',
        'image_width',
        'image_height',
    ];

    protected $casts = [
        'original_size' => 'integer',
        'compressed_size' => 'integer',
        'compression_ratio' => 'decimal:2',
        'bits_per_pixel' => 'decimal:4',
        'entropy' => 'decimal:4',
        'image_width' => 'integer',
        'image_height' => 'integer',
    ];

    /**
     * Get the user that owns the compression history.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
