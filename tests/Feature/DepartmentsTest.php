<?php

use App\Models\Department;
use App\Models\Service;

test('the departments index lists only published departments, ordered by name', function () {
    Department::factory()->published()->create(['name' => 'Beta Department']);
    Department::factory()->published()->create(['name' => 'Alpha Department']);
    Department::factory()->create(['name' => 'Draft Department']);

    $this->get(route('departments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('departments')
            ->where('departments', fn ($departments) => collect($departments)->pluck('name')->all() === ['Alpha Department', 'Beta Department']));
});

test('the departments index shows an empty state when nothing is published', function () {
    Department::factory()->create(['name' => 'Draft Department']);

    $this->get(route('departments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('departments')
            ->where('departments', []));
});

test('the departments index counts only published services', function () {
    $department = Department::factory()->published()->create(['name' => 'Renal Medicine']);
    Service::factory()->published()->inDepartment($department)->create(['name' => 'Dialysis Services']);
    Service::factory()->published()->inDepartment($department)->create(['name' => 'Transplant Follow-Up']);
    Service::factory()->inDepartment($department)->create(['name' => 'Draft Service']);

    $this->get(route('departments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('departments')
            ->where('departments', fn ($departments) => collect($departments)->pluck('servicesCount')->all() === [2]));
});

test('a published department shows its details', function () {
    $department = Department::factory()
        ->published()
        ->withContact()
        ->create([
            'name' => 'Renal Medicine',
            'slug' => 'renal-medicine',
            'summary' => 'Dialysis and kidney care follow-up.',
            'description' => 'Haemodialysis, peritoneal dialysis and transplant follow-up care.',
            'owner' => 'FMCA Renal Team',
        ]);

    $this->get(route('departments.show', ['slug' => $department->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('department')
            ->where('department.name', 'Renal Medicine')
            ->where('department.slug', 'renal-medicine')
            ->where('department.summary', 'Dialysis and kidney care follow-up.')
            ->where('department.description', 'Haemodialysis, peritoneal dialysis and transplant follow-up care.')
            ->where('department.contactPhone', '08000000000')
            ->where('department.contactEmail', 'clinical-desk@example.com')
            ->where('department.owner', 'FMCA Renal Team')
            ->where('department.reviewedAt', fn ($reviewedAt) => is_string($reviewedAt) && strlen($reviewedAt) > 0));
});

test('draft departments are not publicly accessible', function () {
    $draft = Department::factory()->create(['slug' => 'draft-department']);

    $this->get(route('departments.show', ['slug' => $draft->slug]))->assertNotFound();
    $this->get(route('departments.show', ['slug' => 'does-not-exist']))->assertNotFound();
});

test('the department detail lists only published services, ordered by name', function () {
    $department = Department::factory()->published()->create(['name' => 'Renal Medicine']);
    Service::factory()->published()->inDepartment($department)->create(['name' => 'Zeta Service']);
    Service::factory()->published()->inDepartment($department)->create(['name' => 'Alpha Service']);
    Service::factory()->inDepartment($department)->create(['name' => 'Draft Service']);

    $this->get(route('departments.show', ['slug' => $department->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('department')
            ->where('services', fn ($services) => collect($services)->pluck('name')->all() === ['Alpha Service', 'Zeta Service']));
});

test('a department without services has no services', function () {
    $department = Department::factory()->published()->create(['name' => 'Isolated Department']);

    $this->get(route('departments.show', ['slug' => $department->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('department')
            ->where('services', []));
});
