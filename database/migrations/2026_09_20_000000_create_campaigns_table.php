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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('eyebrow')->nullable();
            $table->text('copy');
            $table->string('primary_cta_label')->nullable();
            $table->string('primary_cta_href')->nullable();
            $table->string('secondary_cta_label')->nullable();
            $table->string('secondary_cta_href')->nullable();
            $table->string('desktop_media')->nullable();
            $table->string('mobile_media')->nullable();
            $table->string('media_alt')->nullable();
            $table->string('focal_point')->nullable()->default('center');
            $table->string('video_poster')->nullable();
            $table->unsignedTinyInteger('overlay_intensity')->nullable()->default(40);
            $table->string('owner');
            $table->boolean('advisory')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('status')->default('draft')->index();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
