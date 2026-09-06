<?php

use App\Http\Controllers\Cms\HomepageController;
use App\Http\Controllers\HomeController;
use App\Models\HomeConfiguration;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('can:viewAny,'.HomeConfiguration::class)->group(function (): void {
        Route::get('cms/homepage', [HomepageController::class, 'edit'])->name('cms.homepage.edit');
        Route::post('cms/homepage', [HomepageController::class, 'store'])->name('cms.homepage.store');
        Route::post('cms/homepage/{homeConfiguration}/review', [HomepageController::class, 'submitForReview'])
            ->middleware('can:update,homeConfiguration')
            ->name('cms.homepage.review');
    });
});

require __DIR__.'/settings.php';
