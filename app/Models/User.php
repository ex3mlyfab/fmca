<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property int|null $role_id
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->role?->hasPermission($permission) ?? false;
    }

    public function canManageHomepage(): bool
    {
        return $this->hasPermission('view_homepage');
    }

    public function canApproveHomepage(): bool
    {
        return $this->hasPermission('approve_homepage');
    }

    public function canArchiveHomepage(): bool
    {
        return $this->hasPermission('archive_homepage');
    }

    public function canManageDepartments(): bool
    {
        return $this->hasPermission('edit_departments');
    }

    public function canManageServices(): bool
    {
        return $this->hasPermission('edit_services');
    }

    public function canManageNews(): bool
    {
        return $this->hasPermission('edit_news');
    }

    public function canManageCampaigns(): bool
    {
        return $this->hasPermission('edit_campaigns');
    }

    public function canManagePages(): bool
    {
        return $this->hasPermission('edit_pages');
    }

    public function canManageRedirects(): bool
    {
        return $this->hasPermission('edit_redirects');
    }

    public function canManageMedia(): bool
    {
        return $this->hasPermission('upload_media');
    }

    public function canManageDocuments(): bool
    {
        return $this->hasPermission('edit_documents');
    }

    public function canManageClinics(): bool
    {
        return $this->hasPermission('edit_clinics');
    }

    public function canManageConsultants(): bool
    {
        return $this->hasPermission('edit_consultants');
    }

    public function canManageCommittees(): bool
    {
        return $this->hasPermission('edit_committees');
    }
}
