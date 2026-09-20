<?php

test('an unknown web route renders the Inertia 404 page', function () {
    $response = $this->get('/definitely-not-a-real-route');

    $response->assertNotFound()->assertInertia(fn ($page) => $page
        ->component('errors/404')
        ->where('error.status', 404));
});
