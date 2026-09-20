<?php

test('robots.txt blocks the CMS and auth paths and points at the sitemap', function () {
    $response = $this->get('/robots.txt');

    $response->assertOk();

    expect($response->headers->get('Content-Type'))->toContain('text/plain');

    $content = $response->getContent();

    expect($content)->toContain('Disallow: /cms')
        ->and($content)->toContain('Disallow: /login')
        ->and($content)->toContain('Disallow: /register')
        ->and($content)->toContain('Sitemap: '.url('sitemap.xml'));
});
