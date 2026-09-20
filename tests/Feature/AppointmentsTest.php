<?php

use App\Models\Department;

test('the public appointment request page lists only published departments', function () {
    Department::factory()->published()->create(['name' => 'Cardiology', 'slug' => 'cardiology']);
    Department::factory()->create(['name' => 'Confidential Draft', 'slug' => 'confidential-draft']);

    $response = $this->get(route('appointments'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('appointments')
        ->where('submitted', false));

    expect(collect($response->inertiaProps('departments'))->pluck('name')->all())->toBe(['Cardiology']);
});

test('a valid appointment request is stored and the visitor is redirected with a confirmation', function () {
    $department = Department::factory()->published()->create();

    $response = $this->post(route('appointments.store'), [
        'full_name' => 'Jane Doe',
        'phone' => '+2348000000000',
        'email' => 'jane@example.com',
        'department_id' => $department->id,
        'preferred_service' => 'Outpatient clinic',
        'preferred_date' => now()->addWeek()->format('Y-m-d'),
        'reason' => 'I would like a follow-up review.',
        'consent' => '1',
    ]);

    $response->assertRedirect(route('appointments'))->assertSessionHas('appointmentSubmitted', true);

    $this->assertDatabaseHas('appointment_requests', [
        'full_name' => 'Jane Doe',
        'phone' => '+2348000000000',
        'department_id' => $department->id,
        'status' => 'new',
        'consent' => true,
    ]);
});

test('the appointment form validates required fields and consent', function () {
    $response = $this->from(route('appointments'))->post(route('appointments.store'), [
        'email' => 'not-a-valid-email',
        'consent' => '0',
    ]);

    $response->assertRedirect(route('appointments'))->assertSessionHasErrors(['full_name', 'phone', 'email', 'consent']);

    $this->assertDatabaseCount('appointment_requests', 0);
});

test('a filled honeypot field rejects the submission', function () {
    $response = $this->from(route('appointments'))->post(route('appointments.store'), [
        'full_name' => 'Spam Bot',
        'phone' => '+2348000000000',
        'consent' => '1',
        'website' => 'https://spam.example',
    ]);

    $response->assertRedirect(route('appointments'))->assertSessionHasErrors('website');

    $this->assertDatabaseCount('appointment_requests', 0);
});

test('frequent appointment requests are rate limited per ip', function () {
    $payload = [
        'full_name' => 'Rate Tester',
        'phone' => '+2348000000000',
        'consent' => '1',
    ];

    foreach ([0, 1, 2, 3, 4] as $index) {
        $this->post(route('appointments.store'), $payload)->assertRedirect(route('appointments'));
    }

    $this->post(route('appointments.store'), $payload)->assertStatus(429);

    $this->assertDatabaseCount('appointment_requests', 5);
});
