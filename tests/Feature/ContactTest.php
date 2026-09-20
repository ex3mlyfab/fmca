<?php

test('the public contact page renders', function () {
    $response = $this->get(route('contact'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('contact')
        ->where('submitted', false));
});

test('valid contact feedback is stored and the visitor is redirected with a confirmation', function () {
    $response = $this->post(route('contact.feedback.store'), [
        'full_name' => 'John Public',
        'email' => 'john@example.com',
        'subject' => 'Website suggestion',
        'message' => 'The directions section was very helpful.',
    ]);

    $response->assertRedirect(route('contact'))->assertSessionHas('contactSubmitted', true);

    $this->assertDatabaseHas('contact_submissions', [
        'full_name' => 'John Public',
        'email' => 'john@example.com',
        'status' => 'new',
    ]);
});

test('contact feedback validates required fields', function () {
    $response = $this->from(route('contact'))->post(route('contact.feedback.store'), [
        'full_name' => 'No Email',
        'message' => 'Hello there.',
    ]);

    $response->assertRedirect(route('contact'))->assertSessionHasErrors(['email']);

    $this->assertDatabaseCount('contact_submissions', 0);
});

test('a filled honeypot field rejects contact feedback', function () {
    $response = $this->from(route('contact'))->post(route('contact.feedback.store'), [
        'full_name' => 'Spam',
        'email' => 'spam@example.com',
        'message' => 'Buy now.',
        'website' => 'https://spam.example',
    ]);

    $response->assertRedirect(route('contact'))->assertSessionHasErrors('website');

    $this->assertDatabaseCount('contact_submissions', 0);
});

test('frequent contact feedback is rate limited per ip', function () {
    $payload = [
        'full_name' => 'Rate Tester',
        'email' => 'rate@example.com',
        'message' => 'A test message.',
    ];

    foreach ([0, 1, 2, 3, 4] as $index) {
        $this->post(route('contact.feedback.store'), $payload)->assertRedirect(route('contact'));
    }

    $this->post(route('contact.feedback.store'), $payload)->assertStatus(429);

    $this->assertDatabaseCount('contact_submissions', 5);
});
