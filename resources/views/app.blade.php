<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @php
            $seo = $page['props']['seo'] ?? null;
            $seoTitle = ($seo['title'] ?? null) ?: config('app.name', 'Laravel');
        @endphp
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
            @if ($seo !== null)
                @if (isset($seo['description']))
                    <meta name="description" content="{{ $seo['description'] }}">
                @endif
                @if (isset($seo['robots']))
                    <meta name="robots" content="{{ $seo['robots'] }}">
                @endif
                @if (isset($seo['canonical']))
                    <link rel="canonical" href="{{ $seo['canonical'] }}">
                @endif
                <meta property="og:title" content="{{ $seoTitle }}">
                @if (isset($seo['description']))
                    <meta property="og:description" content="{{ $seo['description'] }}">
                @endif
                <meta property="og:type" content="website">
                <meta property="og:url" content="{{ $seo['canonical'] ?? url()->current() }}">
                @if (isset($seo['og_image']))
                    <meta property="og:image" content="{{ $seo['og_image'] }}">
                @endif
                @if (isset($seo['json_ld']))
                    @foreach ((array) $seo['json_ld'] as $jsonLd)
                        <script type="application/ld+json">{!! json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
                    @endforeach
                @endif
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
