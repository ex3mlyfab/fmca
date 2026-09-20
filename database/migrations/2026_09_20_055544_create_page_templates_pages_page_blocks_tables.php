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
        Schema::create('page_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('purpose');
            $table->string('url_prefix')->nullable();
            $table->boolean('routable')->default(false);
            $table->boolean('requires_owner')->default(false);
            $table->boolean('requires_summary')->default(false);
            $table->json('required_fields');
            $table->json('permitted_blocks');
            $table->string('default_owner')->nullable();
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('page_templates');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('summary')->nullable();
            $table->string('owner')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('page_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('block_key');
            $table->json('content');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('page_templates');
    }
};
