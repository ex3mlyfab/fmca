<?php

use App\Models\Clinic;
use App\Models\Consultant;
use Database\Seeders\ClinicsConsultantsSeeder;
use Database\Seeders\DepartmentServiceSeeder;

test('the consultants index lists only published profiles', function () {
    Consultant::factory()->published()->create(['name' => 'Published Profile']);
    Consultant::factory()->create(['name' => 'Draft Profile']);

    $this->get(route('consultants'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultants')
            ->where('consultants', fn ($consultants) => collect($consultants)->pluck('name')->all() === ['Published Profile']));
});

test('the consultants index shows an empty state when nothing is published', function () {
    Consultant::factory()->create(['name' => 'Draft Profile']);

    $this->get(route('consultants'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultants')
            ->where('consultants', []));
});

test('a published consultant profile shows its details', function () {
    $consultant = Consultant::factory()
        ->published()
        ->create([
            'name' => 'Published Profile',
            'specialty' => 'Cardiology',
            'specialty_tags' => ['Cardiology', 'Hypertension'],
        ]);

    $this->get(route('consultants.show', ['slug' => $consultant->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('consultant')
            ->where('consultant.name', 'Published Profile')
            ->where('consultant.specialty', 'Cardiology')
            ->where('consultant.specialtyTags', ['Cardiology', 'Hypertension']));
});

test('draft consultant profiles are not publicly accessible', function () {
    $draft = Consultant::factory()->create(['slug' => 'draft-profile']);

    $this->get(route('consultants.show', ['slug' => $draft->slug]))->assertNotFound();
    $this->get(route('consultants.show', ['slug' => 'does-not-exist']))->assertNotFound();
});

test('the seeder creates draft clinics and consultant placeholders, nothing published', function () {
    (new DepartmentServiceSeeder)->run();
    (new ClinicsConsultantsSeeder)->run();

    $this->assertDatabaseHas('clinics', ['name' => 'Cardiology Outpatient Clinic', 'status' => 'draft']);
    expect(Clinic::query()->count())->toBe(3);
    expect(Clinic::query()->published()->count())->toBe(0);

    $this->assertDatabaseHas('consultants', ['slug' => 'cardiology-consultant', 'status' => 'draft']);
    $this->assertDatabaseHas('consultants', ['slug' => 'paediatrics-consultant', 'status' => 'draft']);
    expect(Consultant::query()->published()->count())->toBe(0);
});
