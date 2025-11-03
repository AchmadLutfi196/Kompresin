<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompressionHistory extends Model
{
    protected $fillable = [
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
        'huffman_table',
        'image_width',
        'image_height',
    ];

    protected $casts = [
        'huffman_table' => 'array',
        'original_size' => 'integer',
        'compressed_size' => 'integer',
        'compression_ratio' => 'decimal:2',
        'bits_per_pixel' => 'decimal:4',
        'entropy' => 'decimal:4',
        'image_width' => 'integer',
        'image_height' => 'integer',
    ];
}
