<?php

use App\Models\Department;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    (new RolePermissionSeeder)->run();
});

function departmentPayload(): array
{
    return [
        'name' => 'Renal Medicine',
        'slug' => 'renal-medicine',
        'summary' => 'Dialysis and kidney care follow-up.',
        'description' => 'Haemodialysis, peritoneal dialysis and transplant follow-up care.',
        'contact_phone' => '08000000000',
        'contact_email' => 'renal-desk@example.com',
        'owner' => 'FMCA Renal Team',
    ];
}

test('clinical roles can open the departments workspace, others cannot', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $communications = User::factory()->withRole('communications_editor')->create();
    $auditor = User::factory()->withRole('auditor')->create();
    $noRole = User::factory()->create();

    $this->actingAs($approver)->get(route('cms.departments.index'))->assertOk();
    $this->actingAs($approver)->get(route('cms.departments.create'))->assertOk();
    $this->actingAs($editor)->get(route('cms.departments.index'))->assertOk();
    $this->actingAs($communications)->get(route('cms.departments.index'))->assertForbidden();
    $this->actingAs($auditor)->get(route('cms.departments.index'))->assertForbidden();
    $this->actingAs($noRole)->get(route('cms.departments.index'))->assertForbidden();
});

test('a department editor creates a draft department', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $response = $this->actingAs($editor)->post(route('cms.departments.store'), departmentPayload());

    $created = Department::query()->latest()->first();
    $response->assertRedirect(route('cms.departments.edit', ['department' => $created->id]));
    $this->assertDatabaseHas('departments', [
        'name' => 'Renal Medicine',
        'slug' => 'renal-medicine',
        'status' => 'draft',
        'contact_phone' => '08000000000',
        'contact_email' => 'renal-desk@example.com',
        'owner' => 'FMCA Renal Team',
    ]);
});

test('department descriptions are sanitized before storage on create and update', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $description = '<h2>Department details</h2><p>Patients <strong>must</strong> register.</p>'
        .'<script>alert(1)</script><img src="javascript:alert(1)" alt="Unsafe image">'
        .'<img src="/storage/media/renal-team.jpg" alt="Renal care team" onerror="alert(1)">';

    $this->actingAs($editor)->post(route('cms.departments.store'), [
        ...departmentPayload(),
        'description' => $description,
    ])->assertRedirect();

    $department = Department::query()->where('slug', 'renal-medicine')->firstOrFail();

    expect($department->description)
        ->toContain('<h2>Department details</h2>')
        ->toContain('<strong>must</strong>')
        ->toContain('src="/storage/media/renal-team.jpg"')
        ->toContain('alt="Renal care team"')
        ->not->toContain('<script')
        ->not->toContain('javascript:')
        ->not->toContain('onerror');

    $this->actingAs($editor)->put(route('cms.departments.update', ['department' => $department->id]), [
        ...departmentPayload(),
        'description' => '<p>Updated department details.</p><iframe src="https://evil.example"></iframe>',
    ])->assertRedirect(route('cms.departments.index'));

    expect($department->fresh()->description)
        ->toContain('<p>Updated department details.</p>')
        ->not->toContain('<iframe')
        ->not->toContain('evil.example');
});

test('editing a department sanitizes legacy description markup', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $department = Department::factory()->create([
        'description' => '<p>Legacy detail.</p><img src="javascript:alert(1)" alt="Unsafe">'
            .'<img src="/storage/media/department.jpg" alt="Department team" onerror="alert(1)">',
    ]);

    $this->actingAs($editor)->get(route('cms.departments.edit', ['department' => $department->id]))
        ->assertInertia(fn ($page) => $page
            ->component('cms/departments/edit')
            ->where('department.description', fn ($description) => str_contains($description, '<p>Legacy detail.</p>')
                && str_contains($description, 'src="/storage/media/department.jpg"')
                && ! str_contains($description, 'javascript:')
                && ! str_contains($description, 'onerror')));
});

test('department slugs are unique', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    Department::factory()->create(['slug' => 'renal-medicine']);

    $this->actingAs($editor)->post(route('cms.departments.store'), departmentPayload())
        ->assertSessionHasErrors('slug');
});

test('a department contact email must be valid', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.departments.store'), [...departmentPayload(), 'contact_email' => 'not-an-email'])
        ->assertSessionHasErrors('contact_email');
});

test('a department editor cannot publish a new department', function () {
    $editor = User::factory()->withRole('department_editor')->create();

    $this->actingAs($editor)->post(route('cms.departments.store'), [...departmentPayload(), 'status' => 'published'])
        ->assertSessionHasErrors('status');

    $this->actingAs($editor)->post(route('cms.departments.store'), departmentPayload())
        ->assertRedirect();
    $this->assertDatabaseHas('departments', ['name' => 'Renal Medicine', 'status' => 'draft']);
});

test('a clinical content approver can publish a new department', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();

    $this->actingAs($approver)->post(route('cms.departments.store'), [...departmentPayload(), 'status' => 'published'])
        ->assertRedirect();
    $this->assertDatabaseHas('departments', ['name' => 'Renal Medicine', 'status' => 'published']);
});

test('a department editor keeps a published department published or unpublishes it, but cannot publish a draft', function () {
    $editor = User::factory()->withRole('department_editor')->create();
    $published = Department::factory()->published()->create(['name' => 'Live department', 'slug' => 'live-department']);
    $draft = Department::factory()->create(['name' => 'Draft department', 'slug' => 'draft-department']);

    $this->actingAs($editor)->put(route('cms.departments.update', ['department' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'summary' => $published->summary,
        'description' => $published->description,
        'status' => 'published',
    ])->assertRedirect(route('cms.departments.index'));
    $this->assertDatabaseHas('departments', ['id' => $published->id, 'status' => 'published']);

    $this->actingAs($editor)->put(route('cms.departments.update', ['department' => $published->id]), [
        'name' => $published->name,
        'slug' => $published->slug,
        'summary' => $published->summary,
        'description' => $published->description,
        'status' => 'draft',
    ])->assertRedirect(route('cms.departments.index'));
    $this->assertDatabaseHas('departments', ['id' => $published->id, 'status' => 'draft']);

    $this->actingAs($editor)->put(route('cms.departments.update', ['department' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'summary' => $draft->summary,
        'description' => $draft->description,
        'status' => 'published',
    ])->assertSessionHasErrors('status');
    $this->assertDatabaseHas('departments', ['id' => $draft->id, 'status' => 'draft']);
});

test('an approver can publish a draft department', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $draft = Department::factory()->create(['name' => 'Draft department', 'slug' => 'draft-department']);

    $this->actingAs($approver)->put(route('cms.departments.update', ['department' => $draft->id]), [
        'name' => $draft->name,
        'slug' => $draft->slug,
        'summary' => $draft->summary,
        'description' => $draft->description,
        'status' => 'published',
    ])->assertRedirect(route('cms.departments.index'));
    $this->assertDatabaseHas('departments', ['id' => $draft->id, 'status' => 'published']);
});

test('only staff with department edit rights can add departments', function () {
    $auditor = User::factory()->withRole('auditor')->create();

    $this->actingAs($auditor)->post(route('cms.departments.store'), departmentPayload())->assertForbidden();
});

test('the screens expose canPublish only to staff who may publish', function () {
    $approver = User::factory()->withRole('clinical_content_approver')->create();
    $editor = User::factory()->withRole('department_editor')->create();
    $department = Department::factory()->published()->create();

    $this->actingAs($approver)->get(route('cms.departments.index'))->assertInertia(fn ($page) => $page
        ->where('canPublish', true));
    $this->actingAs($editor)->get(route('cms.departments.index'))->assertInertia(fn ($page) => $page
        ->where('canPublish', false));

    $this->actingAs($approver)->get(route('cms.departments.create'))->assertInertia(fn ($page) => $page
        ->where('canPublish', true));
    $this->actingAs($editor)->get(route('cms.departments.create'))->assertInertia(fn ($page) => $page
        ->where('canPublish', false));

    $this->actingAs($approver)->get(route('cms.departments.edit', ['department' => $department->id]))->assertInertia(fn ($page) => $page
        ->where('canPublish', true));
    $this->actingAs($editor)->get(route('cms.departments.edit', ['department' => $department->id]))->assertInertia(fn ($page) => $page
        ->where('canPublish', false));
});
