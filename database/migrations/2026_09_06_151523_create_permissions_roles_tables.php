<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const PERMISSIONS = [
        // Homepage
        ['name' => 'view_homepage',           'guard_name' => 'web'],
        ['name' => 'edit_homepage',           'guard_name' => 'web'],
        ['name' => 'publish_homepage',        'guard_name' => 'web'],
        // Pages
        ['name' => 'view_pages',              'guard_name' => 'web'],
        ['name' => 'create_pages',            'guard_name' => 'web'],
        ['name' => 'edit_pages',              'guard_name' => 'web'],
        ['name' => 'delete_pages',            'guard_name' => 'web'],
        ['name' => 'publish_pages',           'guard_name' => 'web'],
        // Departments
        ['name' => 'view_departments',        'guard_name' => 'web'],
        ['name' => 'edit_departments',        'guard_name' => 'web'],
        ['name' => 'approve_department_content', 'guard_name' => 'web'],
        // Services
        ['name' => 'view_services',           'guard_name' => 'web'],
        ['name' => 'edit_services',           'guard_name' => 'web'],
        // Consultants
        ['name' => 'view_consultants',        'guard_name' => 'web'],
        ['name' => 'edit_consultants',        'guard_name' => 'web'],
        // News / Content
        ['name' => 'view_news',               'guard_name' => 'web'],
        ['name' => 'create_news',             'guard_name' => 'web'],
        ['name' => 'edit_news',               'guard_name' => 'web'],
        ['name' => 'publish_news',            'guard_name' => 'web'],
        // Campaigns
        ['name' => 'view_campaigns',          'guard_name' => 'web'],
        ['name' => 'edit_campaigns',          'guard_name' => 'web'],
        ['name' => 'publish_campaigns',       'guard_name' => 'web'],
        // Media
        ['name' => 'view_media',              'guard_name' => 'web'],
        ['name' => 'upload_media',            'guard_name' => 'web'],
        ['name' => 'delete_media',            'guard_name' => 'web'],
        // Users / Roles
        ['name' => 'view_users',              'guard_name' => 'web'],
        ['name' => 'edit_users',              'guard_name' => 'web'],
        ['name' => 'manage_roles',            'guard_name' => 'web'],
        // Auditing
        ['name' => 'view_audit_logs',         'guard_name' => 'web'],
    ];

    private const ROLES = [
        'super_admin' => ['description' => 'Full system access'],
        'communications_editor' => ['description' => 'Communications content and campaigns'],
        'clinical_content_approver' => ['description' => 'Approves clinical and department content'],
        'department_editor' => ['description' => 'Edits assigned department content only'],
        'media_officer' => ['description' => 'Media library and publications'],
        'auditor' => ['description' => 'Read-only audit access'],
    ];

    private const ROLE_PERMISSIONS = [
        'super_admin' => [
            'view_homepage', 'edit_homepage', 'publish_homepage',
            'view_pages', 'create_pages', 'edit_pages', 'delete_pages', 'publish_pages',
            'view_departments', 'edit_departments', 'approve_department_content',
            'view_services', 'edit_services',
            'view_consultants', 'edit_consultants',
            'view_news', 'create_news', 'edit_news', 'publish_news',
            'view_campaigns', 'edit_campaigns', 'publish_campaigns',
            'view_media', 'upload_media', 'delete_media',
            'view_users', 'edit_users', 'manage_roles',
            'view_audit_logs',
        ],

        'communications_editor' => [
            'view_homepage',
            'edit_homepage',
            'publish_homepage',
            'view_news',
            'create_news',
            'edit_news',
            'publish_news',
            'view_campaigns',
            'edit_campaigns',
            'publish_campaigns',
            'view_media',
            'upload_media',
            'view_audit_logs',
        ],

        'clinical_content_approver' => [
            'view_homepage',
            'view_departments',
            'edit_departments',
            'approve_department_content',
            'view_services',
            'edit_services',
            'view_consultants',
            'edit_consultants',
            'view_news',
            'edit_news',
            'publish_news',
            'view_campaigns',
            'edit_campaigns',
            'view_audit_logs',
        ],

        'department_editor' => [
            'view_homepage',
            'view_departments',
            'edit_departments',
            'view_services',
            'edit_services',
            'view_consultants',
            'edit_consultants',
            'view_news',
            'edit_news',
            'view_media',
        ],

        'media_officer' => [
            'view_homepage',
            'view_news',
            'edit_news',
            'view_campaigns',
            'edit_campaigns',
            'view_media',
            'upload_media',
            'delete_media',
        ],

        'auditor' => [
            'view_homepage',
            'view_audit_logs',
            'view_users',
        ],
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name')->default('web');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name')->default('web');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->primary(['permission_id', 'role_id']);
        });

        DB::transaction(function (): void {
            foreach (self::PERMISSIONS as $perm) {
                DB::table('permissions')->upsert([$perm], ['name', 'guard_name'], ['name', 'guard_name']);
            }

            foreach (self::ROLES as $name => $data) {
                $roleId = DB::table('roles')->insertGetId([
                    'name' => $name,
                    'guard_name' => 'web',
                    'description' => $data['description'],
                    'created_by' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                foreach (self::ROLE_PERMISSIONS[$name] as $permName) {
                    $permId = DB::table('permissions')->where('name', $permName)->value('id');
                    if ($permId !== null) {
                        DB::table('permission_role')->insert([
                            'permission_id' => $permId,
                            'role_id' => $roleId,
                        ]);
                    }
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('email')->constrained('roles')->nullOnDelete();
        });

        DB::table('users')
            ->whereIn('role', ['super_admin', 'communications_editor', 'clinical_content_approver', 'department_editor', 'media_officer', 'auditor'])
            ->orderBy('id')
            ->each(function ($user): void {
                $roleId = DB::table('roles')->where('name', $user->role)->value('id');
                if ($roleId !== null) {
                    DB::table('users')->where('id', $user->id)->update(['role_id' => $roleId]);
                }
            });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_index');
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('auditor')->after('email');
        });

        DB::table('users')->whereIn('role', ['super_admin', 'communications_editor', 'clinical_content_approver', 'department_editor', 'media_officer', 'auditor'])->each(function ($user): void {
            $roleName = DB::table('roles')->where('id', $user->role_id)->value('name');
            if ($roleName !== null) {
                DB::table('users')->where('id', $user->id)->update(['role' => $roleName]);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });

        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');
    }
};
