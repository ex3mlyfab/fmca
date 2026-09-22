<?php

use App\Models\AppointmentRequest;
use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\ContactSubmission;
use App\Models\Department;
use App\Models\HomeConfiguration;
use App\Models\Post;
use App\Models\Service;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users see the studio overview', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('userName', $user->name)
            ->has('content', 9)
            ->where('publishedTotal', 0)
            ->where('reviewTotal', 0)
            ->where('mediaAssets', 0)
            ->where('activeCampaigns', 0)
            ->has('pendingReview', 0)
            ->where('appointmentRequests.newCount', 0)
            ->has('appointmentRequests.items', 0)
            ->where('contactSubmissions.newCount', 0)
            ->has('contactSubmissions.items', 0)
            ->has('activity', 0));
});

test('content totals split live, in-review, and not-yet-live rows', function () {
    Department::factory()->count(2)->published()->create();
    Department::factory()->create();
    Service::factory()->published()->create();
    Post::factory()->published()->create();
    Post::factory()->create(['status' => 'review']);
    Campaign::factory()->published()->create();
    Campaign::factory()->create(['status' => 'review']);
    HomeConfiguration::factory()->create(['status' => 'published']);
    HomeConfiguration::factory()->create(['status' => 'in_review']);

    $response = $this->actingAs(User::factory()->create())->get(route('dashboard'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('dashboard')
        ->where('publishedTotal', 6)
        ->where('reviewTotal', 3)
        ->where('activeCampaigns', 1));

    $byType = collect($response->inertiaProps('content'))->keyBy('type');

    expect($byType->get('departments')['total'])->toBe(3)
        ->and($byType->get('departments')['published'])->toBe(2)
        ->and($byType->get('departments')['pending'])->toBe(1)
        ->and($byType->get('departments')['review'])->toBe(0)
        ->and($byType->get('news')['total'])->toBe(2)
        ->and($byType->get('news')['published'])->toBe(1)
        ->and($byType->get('news')['review'])->toBe(1)
        ->and($byType->get('news')['pending'])->toBe(0)
        ->and($byType->get('homepage')['published'])->toBe(1)
        ->and($byType->get('homepage')['review'])->toBe(1);
});

test('the review queue lists only items waiting for clinical review', function () {
    $newsItem = Post::factory()->create(['status' => 'review']);
    Campaign::factory()->create(['status' => 'review']);
    HomeConfiguration::factory()->create(['status' => 'in_review']);
    HomeConfiguration::factory()->create(['status' => 'changes_requested']);
    Department::factory()->create(['status' => 'draft']);
    Post::factory()->published()->create();

    $response = $this->actingAs(User::factory()->create())->get(route('dashboard'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('dashboard')
        ->where('reviewTotal', 4)
        ->has('pendingReview', 4));

    $queue = collect($response->inertiaProps('pendingReview'));

    expect($queue->count())->toBe(4)
        ->and($queue->pluck('title')->contains($newsItem->title))->toBeTrue()
        ->and($queue->pluck('type')->contains('homepage'))->toBeTrue()
        ->and($queue->pluck('status')->contains('changes_requested'))->toBeTrue()
        ->and($queue->pluck('status')->contains('review'))->toBeTrue()
        ->and($queue->pluck('status')->contains(null))->toBeFalse()
        ->and($queue->pluck('status')->contains('draft'))->toBeFalse()
        ->and($queue->pluck('status')->contains('published'))->toBeFalse();
});

test('patient requests only count submissions staff have not answered', function () {
    $department = Department::factory()->published()->create();
    AppointmentRequest::factory()->forDepartment($department)->create(['preferred_date' => '2026-10-01']);
    AppointmentRequest::factory()->contacted()->create();
    AppointmentRequest::factory()->closed()->create();
    ContactSubmission::factory()->create();
    ContactSubmission::factory()->answered()->create();

    $response = $this->actingAs(User::factory()->create())->get(route('dashboard'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('dashboard')
        ->where('appointmentRequests.newCount', 1)
        ->has('appointmentRequests.items', 1)
        ->where('contactSubmissions.newCount', 1)
        ->has('contactSubmissions.items', 1));

    $requests = collect($response->inertiaProps('appointmentRequests.items'));

    expect($requests->first()['detail'])->toBe("{$department->name} · 1 Oct 2026");
});

test('the activity feed shows the most recent governance events first', function () {
    $earlier = AuditLog::factory()->create([
        'action' => 'created',
        'summary' => 'Drafted the homepage layout.',
    ]);
    $newer = AuditLog::factory()->create([
        'action' => 'published',
        'summary' => 'Released the new campaign to patients.',
    ]);

    $response = $this->actingAs(User::factory()->create())->get(route('dashboard'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('dashboard')
        ->has('activity', 2));

    $feed = collect($response->inertiaProps('activity'));

    expect($feed->first()['id'])->toBe($newer->id)
        ->and($feed->last()['id'])->toBe($earlier->id)
        ->and($feed->first()['actorName'])->toBe($newer->actor->name)
        ->and($feed->first()['createdAt'])->toBe($newer->created_at->toIso8601String());
});
