<?php

namespace App\Http\Controllers;

use App\Models\HomeConfiguration;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $configuration = HomeConfiguration::query()->published()->latest('published_at')->first();

        return Inertia::render('home', [
            'configuration' => $configuration?->sections ?? [],
        ]);
    }
}
