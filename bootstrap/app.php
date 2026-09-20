<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandlePublicRedirects;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\ExceptionResponse;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Public URL redirects must be served ahead of routing so that retired
        // paths (which match no route) still resolve to their new location.
        $middleware->append(HandlePublicRedirects::class);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        Inertia::handleExceptionsUsing(function (ExceptionResponse $exceptionResponse): ?ExceptionResponse {
            $exception = $exceptionResponse->exception;

            if (! $exception instanceof HttpException) {
                return null;
            }

            $request = $exceptionResponse->request;

            if ($request->is('api/*') || $request->expectsJson()) {
                return null;
            }

            return $exceptionResponse->withSharedData()->render('errors/404', [
                'error' => [
                    'status' => $exception->getStatusCode(),
                ],
            ]);
        });
    })->create();
