<?php

namespace App\Http\Middleware;

use App\Models\Redirect;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandlePublicRedirects
{
    /**
     * Serve configured public URL redirects ahead of normal routing.
     *
     * Active rows win over an existing route for the same path: a retired
     * URL must keep resolving to its new location, even if the slug is
     * ever reused.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = mb_strtolower('/'.ltrim($request->getPathInfo(), '/'));

        if ($path !== '/') {
            $match = Redirect::findFor($path);

            if ($match !== null) {
                return redirect($match['redirect']->to_path, $match['status']);
            }
        }

        return $next($request);
    }
}
