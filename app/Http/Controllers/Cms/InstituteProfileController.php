<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInstituteProfileRequest;
use App\Models\AuditLog;
use App\Models\InstituteProfile;
use App\Support\BlockContentSanitizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InstituteProfileController extends Controller
{
    public function index(): Response
    {
        $profile = InstituteProfile::query()->first();

        return Inertia::render('cms/institute-profile/index', [
            'profile' => $profile?->toSiteInfo(),
            'maxMilestones' => UpdateInstituteProfileRequest::MAX_MILESTONES,
            'maxAddressLines' => UpdateInstituteProfileRequest::MAX_ADDRESS_LINES,
            'maxVisitingSlots' => UpdateInstituteProfileRequest::MAX_VISITING_SLOTS,
            'canPublish' => Gate::allows('publish', InstituteProfile::class),
        ]);
    }

    public function update(UpdateInstituteProfileRequest $request): RedirectResponse
    {
        $data = $this->payload($request);
        $profile = InstituteProfile::query()->first();
        $created = $profile === null;

        if ($created) {
            $profile = InstituteProfile::query()->create($data + [
                'created_by' => $request->user()->id,
            ]);
        } else {
            $profile->update($data);
        }

        AuditLog::log(
            $created ? AuditLog::ACTION_CREATED : AuditLog::ACTION_UPDATED,
            $request->user()->id,
            'institute_profile',
            $profile->id,
            "About page content set to {$profile->status}.",
        );

        return to_route('cms.institute-profile.index');
    }

    /**
     * The validated form fields, normalised for storage: blank strings become
     * null, editor HTML is scrubbed, and rows that hold no value at all are
     * dropped so an emptied timeline stores an empty array rather than a pile
     * of nulls.
     *
     * @return array<string, mixed>
     */
    private function payload(UpdateInstituteProfileRequest $request): array
    {
        $data = collect($request->validated())
            ->map(fn (mixed $value): mixed => is_string($value) && trim($value) === '' ? null : $value)
            ->all();

        $data['history_body'] = BlockContentSanitizer::content(
            'rich_text',
            ['body' => (string) ($data['history_body'] ?? '')],
        )['body'];

        $data['address_lines'] = $this->lines($data['address_lines'] ?? []);
        $data['history_milestones'] = $this->rows(
            $data['history_milestones'] ?? [],
            ['year', 'title', 'body'],
        );
        $data['visiting_hours'] = $this->rows(
            $data['visiting_hours'] ?? [],
            ['day_range', 'morning_slot', 'evening_slot', 'status'],
        );

        return $data;
    }

    /**
     * @param  array<int, mixed>  $lines
     * @return array<int, string>
     */
    private function lines(array $lines): array
    {
        return collect($lines)
            ->map(fn (mixed $line): ?string => $this->text(is_string($line) ? $line : null))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  array<int, mixed>  $rows
     * @param  array<int, string>  $keys
     * @return array<int, array<string, string|null>>
     */
    private function rows(array $rows, array $keys): array
    {
        return collect($rows)
            ->map(function (mixed $row) use ($keys): array {
                $row = is_array($row) ? $row : [];

                return collect($keys)
                    ->mapWithKeys(fn (string $key): array => [$key => $this->text(data_get($row, $key))])
                    ->all();
            })
            ->filter(fn (array $row): bool => collect($row)->contains(fn ($value): bool => $value !== null && $value !== ''))
            ->values()
            ->all();
    }

    /**
     * Trim a value down to its stored form, collapsing blanks to null.
     */
    private function text(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
