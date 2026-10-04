<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * One row per brand slot. Slots are unique so an editor can only ever hold
     * one candidate asset for a given placement, and only the published row is
     * surfaced to the public site.
     */
    public function up(): void
    {
        Schema::create('brand_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('slot', 32)->unique();
            $table->string('file_name', 255);
            $table->string('file_path', 1024);
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes');
            $table->string('alt_text', 255)->nullable();
            $table->string('owner', 120)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brand_assets');
    }
};
