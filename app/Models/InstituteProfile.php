<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstituteProfile extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    /**
     * The map span, in tiles, that a single embed frame is expected to cover.
     * A wider span keeps the campus marker centred with room to breathe.
     */
    private const MAP_SPAN_TILES = 4;

    protected $fillable = [
        'institution_name',
        'about_intro',
        'history_body',
        'history_milestones',
        'vision_statement',
        'mission_statement',
        'general_email',
        'general_phone',
        'general_phone_label',
        'emergency_phone',
        'emergency_label',
        'campus_name',
        'address_lines',
        'access_note',
        'location_label',
        'location_address',
        'latitude',
        'longitude',
        'map_zoom',
        'directions_url',
        'map_embed_url',
        'map_alt_text',
        'visiting_hours',
        'visiting_policy_note',
        'owner',
        'reviewed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'history_milestones' => 'array',
            'address_lines' => 'array',
            'visiting_hours' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'map_zoom' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only profiles approved for public display. The site keeps its built-in
     * contact constants until a profile is published.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', self::STATUS_PUBLISHED);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The published profile for the public site, or null when nothing is
     * published yet so callers fall back to the built-in contact constants.
     *
     * @return array<string, mixed>|null
     */
    public static function publishedSiteInfo(): ?array
    {
        return static::query()->published()->first()?->toSiteInfo();
    }

    /**
     * The iframe source for the campus map: an editor-supplied embed URL wins,
     * otherwise an OpenStreetMap embed is built from the stored coordinates.
     * Null means no coordinates are set, so the map panel shows only the
     * address and the directions link.
     */
    public function mapEmbedUrl(): ?string
    {
        $override = $this->map_embed_url;

        if ($override !== null && $override !== '') {
            return $override;
        }

        $latitude = $this->coordinate('latitude');
        $longitude = $this->coordinate('longitude');

        if ($latitude === null || $longitude === null) {
            return null;
        }

        $zoom = $this->zoom();
        $span = self::MAP_SPAN_TILES * 360 / 2 ** $zoom;

        $edges = [
            max(-180, $longitude - $span / 2),
            max(-85, $latitude - $span / 2),
            min(180, $longitude + $span / 2),
            min(85, $latitude + $span / 2),
        ];

        return 'https://www.openstreetmap.org/export/embed.html?'.http_build_query([
            'bbox' => implode(',', array_map(fn (float $edge): string => self::point($edge), $edges)),
            'layer' => 'mapnik',
            'marker' => self::point($latitude).','.self::point($longitude),
        ]);
    }

    /**
     * Where a visitor can open the campus in an external map application.
     */
    public function directionsUrl(): ?string
    {
        $override = $this->directions_url;

        if ($override !== null && $override !== '') {
            return $override;
        }

        $latitude = $this->coordinate('latitude');
        $longitude = $this->coordinate('longitude');

        if ($latitude !== null && $longitude !== null) {
            $point = self::point($latitude).','.self::point($longitude);

            return 'https://www.openstreetmap.org/?mlat='.self::point($latitude)
                .'&mlon='.self::point($longitude).'#map='.$this->zoom().'/'.$point;
        }

        $address = $this->location_address;

        if ($address !== null && trim($address) !== '') {
            return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode(trim($address));
        }

        return null;
    }

    /**
     * The camelCase payload shared by the CMS form and the public site. Dates
     * and computed links are pre-formatted so no model ever crosses the wire.
     *
     * @return array<string, mixed>
     */
    public function toSiteInfo(): array
    {
        $latitude = $this->coordinate('latitude');
        $longitude = $this->coordinate('longitude');

        return [
            'id' => $this->id,
            'status' => $this->status,
            'institutionName' => $this->institution_name,
            'aboutIntro' => $this->about_intro,
            'historyBody' => $this->history_body,
            'historyMilestones' => $this->history_milestones ?? [],
            'visionStatement' => $this->vision_statement,
            'missionStatement' => $this->mission_statement,
            'generalEmail' => $this->general_email,
            'generalEmailHref' => $this->emailHref($this->general_email),
            'generalPhone' => $this->general_phone,
            'generalPhoneLabel' => $this->general_phone_label,
            'generalPhoneHref' => $this->telHref($this->general_phone),
            'emergencyPhone' => $this->emergency_phone,
            'emergencyLabel' => $this->emergency_label,
            'emergencyTel' => $this->telHref($this->emergency_phone),
            'campusName' => $this->campus_name,
            'addressLines' => $this->address_lines ?? [],
            'accessNote' => $this->access_note,
            'locationLabel' => $this->location_label,
            'locationAddress' => $this->location_address,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'mapZoom' => $this->map_zoom,
            'mapEmbedUrl' => $this->mapEmbedUrl(),
            'directionsUrl' => $this->directionsUrl(),
            'mapAltText' => $this->map_alt_text,
            'visitingHours' => $this->visitingHours(),
            'visitingPolicyNote' => $this->visiting_policy_note,
            'owner' => $this->owner,
            'reviewedAt' => $this->reviewed_at?->toDateString(),
            'reviewedAtLabel' => $this->reviewed_at?->format('F Y'),
        ];
    }

    /**
     * The visiting-hour rows in the camelCase shape the public site renders,
     * so database column names and UI field names never have to agree.
     *
     * @return array<int, array<string, string|null>>
     */
    private function visitingHours(): array
    {
        return collect($this->visiting_hours ?? [])
            ->values()
            ->map(function (mixed $slot): array {
                $slot = is_array($slot) ? $slot : [];

                return [
                    'dayRange' => $slot['day_range'] ?? null,
                    'morningSlot' => $slot['morning_slot'] ?? null,
                    'eveningSlot' => $slot['evening_slot'] ?? null,
                    'status' => $slot['status'] ?? null,
                ];
            })
            ->all();
    }

    /**
     * A stored coordinate as a float, or null when absent. The decimal cast
     * yields a string, which the URL builders need as a number.
     */
    private function coordinate(string $column): ?float
    {
        $value = $this->{$column};

        return $value === null ? null : (float) $value;
    }

    /**
     * The clamped zoom level used to derive both the embed box and the link.
     */
    private function zoom(): int
    {
        return min(max($this->map_zoom ?? 16, 3), 19);
    }

    /**
     * Trim a coordinate to six decimals: beyond that the address is already
     * in street, not building, territory, and OSM rejects the URL as invalid.
     */
    private static function point(float $value): string
    {
        return number_format($value, 6, '.', '');
    }

    /**
     * A mailto target. The request validates the value as an address, so it is
     * trimmed rather than reduced to characters.
     */
    private function emailHref(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return 'mailto:'.trim($value);
    }

    /**
     * Build a dialable target from a free-text value. Digits and the leading
     * plus are all that can carry meaning in a tel target.
     */
    private function telHref(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return 'tel:'.preg_replace('/[^0-9+*#.]/', '', trim($value));
    }
}
