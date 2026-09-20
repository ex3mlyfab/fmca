<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSeoMetadataRequest;
use App\Models\Department;
use App\Models\Page;
use App\Models\Post;
use App\Models\SeoMetadata;
use App\Models\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeoMetadataController extends Controller
{
    /**
     * Content types the generic SEO editor supports, and the permission that
     * may edit their SEO fields. Listing-page types have no content id.
     *
     * @return array<string, array{model: class-string<Model>, permission: string}>
     */
    private const TYPE_INDEX = [
        'service' => ['model' => Service::class, 'permission' => 'edit_services'],
        'services' => ['model' => Service::class, 'permission' => 'edit_services'],
        'department' => ['model' => Department::class, 'permission' => 'edit_departments'],
        'departments' => ['model' => Department::class, 'permission' => 'edit_departments'],
        'post' => ['model' => Post::class, 'permission' => 'edit_news'],
        'news' => ['model' => Post::class, 'permission' => 'edit_news'],
        'page' => ['model' => Page::class, 'permission' => 'edit_pages'],
        'patient_guides' => ['model' => Page::class, 'permission' => 'edit_pages'],
        'legal_statements' => ['model' => Page::class, 'permission' => 'edit_pages'],
    ];

    /**
     * @return array<int, string>
     */
    private const LISTING_TYPES = ['services', 'departments', 'news', 'patient_guides', 'legal_statements'];

    public function edit(Request $request, string $contentType, ?int $contentId = null): Response
    {
        $type = $this->typeFor($request, $contentType, $contentId);
        $content = $this->contentFor($type['model'], $contentId);
        $row = SeoMetadata::rowFor($contentType, $contentId);

        return Inertia::render('cms/seo/edit', [
            'content' => [
                'type' => $contentType,
                'id' => $contentId,
                'label' => $this->labelFor($contentType, $content),
                'publicUrl' => $this->publicUrlFor($contentType, $content),
            ],
            'seo' => $row?->onlyViewFields(),
        ]);
    }

    public function update(UpdateSeoMetadataRequest $request, string $contentType, ?int $contentId = null): RedirectResponse
    {
        $type = $this->typeFor($request, $contentType, $contentId);
        $this->contentFor($type['model'], $contentId);

        $data = $request->validated();

        $fields = [
            'title' => $this->valueOrNone($data['title'] ?? null),
            'meta_description' => $this->valueOrNone($data['meta_description'] ?? null),
            'canonical_url' => $this->valueOrNone($data['canonical_url'] ?? null),
            'og_image_url' => $this->valueOrNone($data['og_image_url'] ?? null),
            'robots' => $this->valueOrNone($data['robots'] ?? null),
            'structured_data' => $this->structuredData($data['structured_data'] ?? null),
        ];

        $row = SeoMetadata::query()->for($contentType, $contentId)->first();

        if ($row === null) {
            SeoMetadata::query()->create([
                'content_type' => $contentType,
                'content_id' => $contentId,
                ...$fields,
            ]);
        } else {
            $row->update($fields);
        }

        $params = ['content_type' => $contentType];

        if ($contentId !== null) {
            $params['content_id'] = $contentId;
        }

        return to_route('cms.seo.edit', $params);
    }

    /**
     * Resolve a content type to its model and gating permission, aborting
     * when the type is unknown, the id is inconsistent with the type, or
     * the user cannot edit that content kind.
     *
     * @return array{model: class-string<Model>, permission: string}
     */
    private function typeFor(Request $request, string $contentType, ?int $contentId): array
    {
        $type = self::TYPE_INDEX[$contentType] ?? null;

        if ($type === null || (in_array($contentType, self::LISTING_TYPES, true) === ($contentId !== null))) {
            abort(404);
        }

        abort_unless($request->user()?->hasPermission($type['permission']), 403);

        return $type;
    }

    /**
     * @param  class-string<Model>  $model
     */
    private function contentFor(string $model, ?int $contentId): ?Model
    {
        if ($contentId === null) {
            return null;
        }

        return $model::query()
            ->when($model === Page::class, fn ($query) => $query->with('template:id,key,url_prefix'))
            ->findOrFail($contentId);
    }

    private function labelFor(string $contentType, ?Model $content): string
    {
        if ($content !== null) {
            return match (true) {
                $content instanceof Service => $content->name,
                $content instanceof Department => $content->name,
                $content instanceof Post => $content->title,
                $content instanceof Page => $content->title,
                default => (string) $content->id,
            };
        }

        return match ($contentType) {
            'services' => 'Services index page',
            'departments' => 'Departments index page',
            'news' => 'News index page',
            'patient_guides' => 'Patient guides index page',
            'legal_statements' => 'Legal statements index page',
            default => $contentType,
        };
    }

    private function publicUrlFor(string $contentType, ?Model $content): ?string
    {
        return match (true) {
            $content instanceof Service => url('services/'.$content->slug),
            $content instanceof Department => url('departments/'.$content->slug),
            $content instanceof Post => url('news/'.$content->slug),
            $content instanceof Page => $content->template?->url_prefix !== null
                ? url($content->template->url_prefix.'/'.$content->slug)
                : null,
            $contentType === 'services' => url('services'),
            $contentType === 'departments' => url('departments'),
            $contentType === 'news' => url('news'),
            $contentType === 'patient_guides' => url('patients'),
            $contentType === 'legal_statements' => url('legal'),
            default => null,
        };
    }

    private function valueOrNone(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    /**
     * The validated JSON-LD payload, decoded to the array the model's
     * `structured_data` cast expects to store.
     *
     * @return array<string, mixed>|array<int, mixed>|null
     */
    private function structuredData(?string $value): ?array
    {
        $value = $this->valueOrNone($value);

        return $value === null ? null : json_decode($value, true);
    }
}
