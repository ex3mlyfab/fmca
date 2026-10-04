<?php

namespace App\View\Components;

use Inertia\Ssr\Response as SsrResponse;
use Inertia\View\Components\App as BaseApp;

/**
 * CSP-aware replacement for the Inertia v3 `<x-inertia::app />` component.
 *
 * The vendor component emits the page-props JSON inside an inline <script>
 * with no nonce, which a nonce-based script-src CSP would block and brick the
 * app. This subclass re-renders that payload script with the nonce shared by
 * App\Http\Middleware\SecurityHeaders. When the page is rendered by Inertia's
 * SSR gateway, the gateway emits the payload script itself and has no way of
 * knowing the nonce, so it is stamped onto the response here.
 *
 * Registered under the `inertia::app` alias in AppServiceProvider::boot(); the
 * Blade component tag compiler resolves aliases before Inertia's namespace
 * fallback, so this class wins.
 */
class InertiaApp extends BaseApp
{
    public function render(): string
    {
        $this->stampSsrPayload();

        return <<<'blade'
@if($response)
{!! $response->body !!}
@else
<script nonce="{{ $cspNonce ?? '' }}" data-page="{{ $id }}" type="application/json">{!! $pageJson !!}</script><div id="{{ $id }}"></div>
@endif
blade;
    }

    /**
     * Stamp the CSP nonce onto the payload script the SSR gateway emitted.
     */
    protected function stampSsrPayload(): void
    {
        if ($this->response === null || ($nonce = view()->getShared()['cspNonce'] ?? '') === '') {
            return;
        }

        $body = preg_replace(
            '/<script(?=[^>]*\bdata-page=)/',
            '<script nonce="'.$nonce.'"',
            $this->response->body,
            1,
        );

        $this->response = new SsrResponse($this->response->head, $body ?? $this->response->body);
    }
}
