<?php

namespace Database\Seeders;

use App\Models\SiteMenuItem;
use Illuminate\Database\Seeder;

class SiteMenuSeeder extends Seeder
{
    /**
     * Seed the four entries that make up the public header navigation today,
     * published so the default public site is unchanged by this feature.
     * Re-running only tops up items that are missing, never duplicates.
     */
    public function run(): void
    {
        $items = [
            ['label' => 'About FMCA', 'href' => '/', 'sort_order' => 1],
            ['label' => 'Services', 'href' => '/services', 'sort_order' => 2],
            ['label' => 'Patients & Visitors', 'href' => '/patients', 'sort_order' => 3],
            ['label' => 'News & Updates', 'href' => '/news', 'sort_order' => 4],
        ];

        foreach ($items as $item) {
            SiteMenuItem::query()->firstOrCreate(
                ['label' => $item['label'], 'href' => $item['href']],
                [
                    'sort_order' => $item['sort_order'],
                    'owner' => 'FMCA Corporate Communications',
                    'status' => 'published',
                ],
            );
        }
    }
}
