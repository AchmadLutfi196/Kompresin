<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compression_histories', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'compress' or 'decompress'
            $table->string('filename');
            $table->string('original_path')->nullable();
            $table->string('compressed_path')->nullable();
            $table->string('decompressed_path')->nullable();
            $table->bigInteger('original_size'); // bytes
            $table->bigInteger('compressed_size')->nullable(); // bytes
            $table->decimal('compression_ratio', 5, 2)->nullable(); // percentage
            $table->decimal('bits_per_pixel', 10, 4)->nullable();
            $table->decimal('entropy', 10, 4)->nullable();
            $table->json('huffman_table')->nullable();
            $table->integer('image_width')->nullable();
            $table->integer('image_height')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compression_histories');
    }
};
