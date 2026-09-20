<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
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
            'view_pages',
            'edit_pages',
            'publish_pages',
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
            'view_pages',
            'edit_pages',
            'publish_pages',
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
            'view_pages',
            'edit_pages',
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
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::PERMISSIONS as $perm) {
            Permission::firstOrCreate($perm);
        }

        foreach (self::ROLES as $name => $data) {
            $role = Role::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['description' => $data['description']]
            );

            $permIds = collect(self::ROLE_PERMISSIONS[$name])
                ->map(fn (string $permName) => Permission::where('name', $permName)->value('id'))
                ->filter()
                ->all();

            $role->permissions()->sync($permIds);
        }
    }
}
