<?php

use App\Models\CommitteeMember;
use Database\Seeders\CommitteeMemberSeeder;

test('the committee page lists only published members in sort order', function () {
    CommitteeMember::factory()->published()->create([
        'name' => 'Member A',
        'slug' => 'member-a',
        'role' => 'Executive Chairperson',
        'sort_order' => 2,
    ]);
    CommitteeMember::factory()->published()->create([
        'name' => 'Member B',
        'slug' => 'member-b',
        'role' => 'Director-General',
        'sort_order' => 1,
    ]);
    CommitteeMember::factory()->create([
        'name' => 'Member C (draft)',
        'slug' => 'member-c',
        'role' => 'Pro-Vice-Chancellor',
        'sort_order' => 0,
    ]);

    $this->get(route('about.leadership'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('committee')
            ->where('members', fn ($members) => collect($members)
                ->pluck('name')
                ->all() === ['Member B', 'Member A']));
});

test('the committee page shows an empty state when nothing is published', function () {
    CommitteeMember::factory()->create(['name' => 'Member C (draft)']);

    $this->get(route('about.leadership'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('committee')
            ->where('members', []));
});

test('the committee page carries the latest review date across published members', function () {
    CommitteeMember::factory()->published()->create([
        'name' => 'Member A',
        'slug' => 'member-a',
        'reviewed_at' => '2026-07-01',
    ]);
    CommitteeMember::factory()->published()->create([
        'name' => 'Member B',
        'slug' => 'member-b',
        'reviewed_at' => '2026-08-15',
    ]);

    $this->get(route('about.leadership'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('committee')
            ->where('latestReviewedAt', '15 Aug 2026'));
});

test('draft committee members are not exposed publicly', function () {
    CommitteeMember::factory()->create(['slug' => 'draft-member', 'name' => 'Draft Member']);

    $this->get(route('about.leadership'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('committee')
            ->where('members', fn ($members) => collect($members)->isEmpty()));
});

test('the seeder creates draft committee member placeholders, nothing published', function () {
    (new CommitteeMemberSeeder)->run();

    $this->assertDatabaseHas('committee_members', ['slug' => 'executive-chairperson', 'status' => 'draft']);
    $this->assertDatabaseHas('committee_members', ['slug' => 'director-general-pro-vice-chancellor', 'status' => 'draft']);
    $this->assertDatabaseHas('committee_members', ['slug' => 'head-of-corporate-services', 'status' => 'draft']);

    expect(CommitteeMember::query()->count())->toBe(5);
    expect(CommitteeMember::query()->published()->count())->toBe(0);
});

test('the committee seeder is idempotent', function () {
    (new CommitteeMemberSeeder)->run();
    $countBefore = CommitteeMember::query()->count();

    (new CommitteeMemberSeeder)->run();

    expect(CommitteeMember::query()->count())->toBe($countBefore);
});
