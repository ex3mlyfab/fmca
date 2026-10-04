<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Inertia\Inertia;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // The Inertia SSR gateway renders initial visits through a live SSR engine —
        // in development that is the Vite dev server — so a running `npm run dev`
        // would change what the feature tests render. Keep the suite hermetic: every
        // test renders the server-side JSON payload instead.
        Inertia::disableSsr();
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
