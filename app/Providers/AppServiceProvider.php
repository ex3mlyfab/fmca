<?php

namespace App\Providers;

use App\View\Components\InertiaApp;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();

        // Replace the Inertia v3 `<x-inertia::app />` payload script with a nonce-aware
        // rendering (see App\View\Components\InertiaApp) so the inline page-props
        // script survives the Content-Security-Policy emitted by SecurityHeaders.
        // Resolved before Inertia's `inertia` namespace fallback wins the alias.
        Blade::component('inertia::app', InertiaApp::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Define IP-based rate limits that protect the public request forms.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('appointment-requests', function (Request $request) {
            return Limit::perHour(5)->by($request->ip());
        });

        RateLimiter::for('contact-feedback', function (Request $request) {
            return Limit::perHour(5)->by($request->ip());
        });
    }
}
