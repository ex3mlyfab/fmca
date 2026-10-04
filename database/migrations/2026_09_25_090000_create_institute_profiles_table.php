<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institute_profiles', function (Blueprint $table): void {
            $table->id();

            // Identity and the short institute history.
            $table->string('institution_name', 160)->nullable();
            $table->text('about_intro')->nullable();
            $table->text('history_body')->nullable();
            $table->json('history_milestones')->nullable();
            $table->text('vision_statement')->nullable();
            $table->text('mission_statement')->nullable();

            // General and emergency contacts shown site-wide.
            $table->string('general_email', 190)->nullable();
            $table->string('general_phone', 32)->nullable();
            $table->string('general_phone_label', 120)->nullable();
            $table->string('emergency_phone', 32)->nullable();
            $table->string('emergency_label', 120)->nullable();

            // Campus location and the embedded map.
            $table->string('campus_name', 160)->nullable();
            $table->json('address_lines')->nullable();
            $table->string('access_note', 240)->nullable();
            $table->string('location_label', 160)->nullable();
            $table->string('location_address', 240)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedTinyInteger('map_zoom')->nullable();
            $table->string('directions_url', 512)->nullable();
            $table->string('map_embed_url', 512)->nullable();
            $table->string('map_alt_text', 240)->nullable();

            // Ward visiting hours, shown on the about page and /contact.
            $table->json('visiting_hours')->nullable();
            $table->text('visiting_policy_note')->nullable();

            $table->string('owner', 120)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institute_profiles');
    }
};
