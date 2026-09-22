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
        Schema::create('committee_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('role');
            $table->string('portfolio')->nullable();
            $table->text('mandate')->nullable();
            $table->string('term')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('portrait')->nullable();
            $table->string('owner')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('status')->default('draft')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_members');
    }
};
