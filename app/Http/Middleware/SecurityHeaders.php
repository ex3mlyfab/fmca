<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Apply defense-in-depth security headers to every response, and a nonce-based
     * Content-Security-Policy to HTML responses.
     *
     * CSP is only emitted under the same guardrails as the session cookie: in the
     * test suite and in production, never in local development (where the Vite
     * hot-reload server would otherwise be blocked). The shared nonce matches the
     * `nonce="..."` attributes rendered on the inline appearance script and
     * JSON-LD blocks in resources/views/app.blade.php, and on the Inertia
     * page-props payload script via App\View\Components\InertiaApp.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $enforceCsp = app()->runningUnitTests() || app()->environment('production');

        if ($enforceCsp) {
            view()->share('cspNonce', Str::random(32));
        }

        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        if ($enforceCsp && $response instanceof Response && $this->isHtmlResponse($response)) {
            $response->headers->set(
                'Content-Security-Policy',
                $this->policy(view()->getShared()['cspNonce'] ?? ''),
            );
        }

        return $response;
    }

    protected function isHtmlResponse(Response $response): bool
    {
        $type = (string) $response->headers->get('Content-Type');

        return str_starts_with($type, 'text/html');
    }

    /**
     * The policy mirrors the origins and inline content the site actually loads:
     * OSM/Google map embeds, media-library CDN assets, and the inline appearance
     * detection script plus the Inertia page-props script (both nonce-based).
     */
    protected function policy(string $nonce): string
    {
        // `style-src 'unsafe-inline'` (no nonce) is required because the dashboard
        // renders inline `style` attributes on its progress bars; a nonce-only
        // style-src would silently zero them out.
        return trim(implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'nonce-$nonce'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            'frame-src https://www.openstreetmap.org https://www.google.com https://maps.google.com',
            'form-action \'self\'',
            'base-uri \'self\'',
            'object-src \'none\'',
        ]));
    }
}
