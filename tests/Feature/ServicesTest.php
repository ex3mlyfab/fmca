<?php

use App\Models\Department;
use App\Models\Service;
use Database\Seeders\DepartmentServiceSeeder;

test('the services index lists only published services, ordered by name', function () {
    Service::factory()->published()->create(['name' => 'Beta Service']);
    Service::factory()->published()->create(['name' => 'Alpha Service']);
    Service::factory()->create(['name' => 'Draft Service']);

    $this->get(route('services'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('services')
            ->where('services', fn ($services) => collect($services)->pluck('name')->all() === ['Alpha Service', 'Beta Service']));
});

test('the services index shows an empty state when nothing is published', function () {
    Service::factory()->create(['name' => 'Draft Service']);

    $this->get(route('services'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('services')
            ->where('services', []));
});

test('a published service shows its details', function () {
    $department = Department::factory()->create();
    $service = Service::factory()
        ->published()
        ->inDepartment($department)
        ->create([
            'name' => 'Chemotherapy & Infusion Services',
            'summary' => 'Cancer treatment administration in a monitored setting.',
            'referral_guidance' => 'Refer via the standard clinical referral pathway.',
            'eligibility' => 'Eligibility is confirmed by the treating clinician.',
        ]);

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('service.name', 'Chemotherapy & Infusion Services')
            ->where('service.summary', 'Cancer treatment administration in a monitored setting.')
            ->where('service.referralGuidance', 'Refer via the standard clinical referral pathway.')
            ->where('service.eligibility', 'Eligibility is confirmed by the treating clinician.')
            ->where('service.department.name', $department->name));
});

test('draft services are not publicly accessible', function () {
    $draft = Service::factory()->create(['slug' => 'draft-service']);

    $this->get(route('services.show', ['slug' => $draft->slug]))->assertNotFound();
    $this->get(route('services.show', ['slug' => 'does-not-exist']))->assertNotFound();
});

test('the service detail lists related published services from the same department', function () {
    $department = Department::factory()->create();
    $service = Service::factory()->published()->inDepartment($department)->create(['name' => 'Standalone Service']);
    Service::factory()->published()->inDepartment($department)->create(['name' => 'Sibling Service']);
    Service::factory()->inDepartment($department)->create(['name' => 'Draft Sibling']);

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('related', fn ($related) => collect($related)->pluck('name')->all() === ['Sibling Service']));
});

test('a service without a department has no related services', function () {
    $service = Service::factory()->published()->create(['name' => 'Standalone Service']);

    $this->get(route('services.show', ['slug' => $service->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service')
            ->where('related', []));
});

test('the seeder publishes sample departments and services', function () {
    (new DepartmentServiceSeeder)->run();

    $this->assertDatabaseHas('departments', ['slug' => 'cardiology', 'status' => 'published']);
    $this->assertDatabaseHas('services', ['slug' => 'emergency-trauma-services', 'status' => 'published']);
    $this->assertDatabaseHas('services', ['slug' => 'diagnostic-imaging', 'department_id' => null, 'status' => 'published']);
    expect(Department::query()->count())->toBe(4);
    expect(Service::query()->count())->toBe(6);
});
