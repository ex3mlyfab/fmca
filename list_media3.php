<?php
require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (\App\Models\Media::all() as $media) {
    echo $media->id.': '.$media->file_path.PHP_EOL;
}
