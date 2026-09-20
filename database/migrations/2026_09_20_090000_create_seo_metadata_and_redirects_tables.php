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
        Schema::create('seo_metadata', function (Blueprint $table) {
            $table->id();
            $table->string('content_type', 40)->index();
            $table->unsignedBigInteger('content_id')->nullable();
            $table->string('title', 160)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->string('canonical_url', 2048)->nullable();
            $table->string('og_image_url', 2048)->nullable();
            $table->string('robots', 40)->nullable()->default('index,follow');
            $table->json('structured_data')->nullable();
            $table->timestamps();

            $table->unique(['content_type', 'content_id']);
        });

        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('from_path', 255)->unique();
            $table->string('to_path', 2048);
            $table->unsignedTinyInteger('status_code')->default(301);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('seo_metadata');
    }
};
