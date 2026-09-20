<?php

use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\Cms\AuditLogController;
use App\Http\Controllers\Cms\CampaignController;
use App\Http\Controllers\Cms\CategoryController;
use App\Http\Controllers\Cms\DepartmentController;
use App\Http\Controllers\Cms\HomepageController;
use App\Http\Controllers\Cms\PageController as CmsPageController;
use App\Http\Controllers\Cms\PostController;
use App\Http\Controllers\Cms\RedirectController;
use App\Http\Controllers\Cms\SeoMetadataController;
use App\Http\Controllers\Cms\ServiceController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\SitemapController;
use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Department;
use App\Models\HomeConfiguration;
use App\Models\Page;
use App\Models\Post;
use App\Models\Redirect;
use App\Models\Service;
use Database\Seeders\PageTemplateSeeder;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('services', [ServicesController::class, 'index'])->name('services');
Route::get('services/{slug}', [ServicesController::class, 'show'])->name('services.show');
Route::get('departments', [DepartmentsController::class, 'index'])->name('departments');
Route::get('departments/{slug}', [DepartmentsController::class, 'show'])->name('departments.show');
Route::get('news', [NewsController::class, 'index'])->name('news');
Route::get('news/{slug}', [NewsController::class, 'show'])->name('news.show');
Route::get('patients', [PageController::class, 'patientGuides'])->name('patients');
Route::get('legal', [PageController::class, 'legalStatements'])->name('legal');
Route::get('search', [SearchController::class, 'index'])->name('search');

// XML sitemaps (one per public content type, plus the index) and robots.txt.
Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('sitemap-services.xml', [SitemapController::class, 'services'])->name('sitemap.services');
Route::get('sitemap-departments.xml', [SitemapController::class, 'departments'])->name('sitemap.departments');
Route::get('sitemap-news.xml', [SitemapController::class, 'news'])->name('sitemap.news');
Route::get('sitemap-pages.xml', [SitemapController::class, 'pages'])->name('sitemap.pages');
Route::get('robots.txt', [SitemapController::class, 'robots'])->name('robots');

// Public page routes — one per routable page template (registry-driven, read
// from the code definitions so boot never depends on the database).
foreach (PageTemplateSeeder::TEMPLATES as $template) {
    if (! $template['routable'] || $template['url_prefix'] === null) {
        continue;
    }

    Route::get($template['url_prefix'].'/{slug}', [PageController::class, 'show'])
        ->defaults('templateKey', $template['key'])
        ->name('page.'.$template['key']);
}

Route::get('appointments', AppointmentsController::class)->name('appointments');
Route::post('appointments', [AppointmentsController::class, 'store'])
    ->middleware('throttle:appointment-requests')
    ->name('appointments.store');
Route::get('contact', [ContactController::class, 'show'])->name('contact');
Route::post('contact/feedback', [ContactController::class, 'storeFeedback'])
    ->middleware('throttle:contact-feedback')
    ->name('contact.feedback.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('can:viewAny,'.HomeConfiguration::class)->group(function (): void {
        Route::get('cms/homepage', [HomepageController::class, 'edit'])->name('cms.homepage.edit');
        Route::post('cms/homepage', [HomepageController::class, 'store'])->name('cms.homepage.store');
        Route::get('cms/homepage/revisions', [HomepageController::class, 'revisions'])->name('cms.homepage.revisions');
        Route::post('cms/homepage/revisions/{revision}/restore', [HomepageController::class, 'restoreRevision'])
            ->name('cms.homepage.restore');
        Route::post('cms/homepage/{homeConfiguration}/review', [HomepageController::class, 'submitForReview'])
            ->middleware('can:update,homeConfiguration')
            ->name('cms.homepage.review');
        Route::post('cms/homepage/{homeConfiguration}/approve', [HomepageController::class, 'approve'])->name('cms.homepage.approve');
        Route::post('cms/homepage/{homeConfiguration}/changes', [HomepageController::class, 'requestChanges'])->name('cms.homepage.changes');
        Route::post('cms/homepage/{homeConfiguration}/publish', [HomepageController::class, 'publish'])->name('cms.homepage.publish');
        Route::post('cms/homepage/{homeConfiguration}/archive', [HomepageController::class, 'archive'])->name('cms.homepage.archive');
        Route::delete('cms/homepage/{homeConfiguration}', [HomepageController::class, 'destroy'])->name('cms.homepage.destroy');
    });

    Route::middleware('can:viewAny,'.AuditLog::class)->group(function (): void {
        Route::get('cms/audit', [AuditLogController::class, 'index'])->name('cms.audit.index');
    });

    Route::middleware('can:viewAny,'.Department::class)->group(function (): void {
        Route::get('cms/departments', [DepartmentController::class, 'index'])->name('cms.departments.index');
        Route::get('cms/departments/create', [DepartmentController::class, 'create'])->name('cms.departments.create');
        Route::post('cms/departments', [DepartmentController::class, 'store'])->name('cms.departments.store');
        Route::get('cms/departments/{department}', [DepartmentController::class, 'edit'])->name('cms.departments.edit');
        Route::put('cms/departments/{department}', [DepartmentController::class, 'update'])->name('cms.departments.update');
    });

    Route::middleware('can:viewAny,'.Service::class)->group(function (): void {
        Route::get('cms/services', [ServiceController::class, 'index'])->name('cms.services.index');
        Route::get('cms/services/create', [ServiceController::class, 'create'])->name('cms.services.create');
        Route::post('cms/services', [ServiceController::class, 'store'])->name('cms.services.store');
        Route::get('cms/services/{service}', [ServiceController::class, 'edit'])->name('cms.services.edit');
        Route::put('cms/services/{service}', [ServiceController::class, 'update'])->name('cms.services.update');
    });

    Route::middleware('can:viewAny,'.Post::class)->group(function (): void {
        Route::get('cms/news', [PostController::class, 'index'])->name('cms.news.index');
        Route::get('cms/news/create', [PostController::class, 'create'])->name('cms.news.create');
        Route::post('cms/news', [PostController::class, 'store'])->name('cms.news.store');
        Route::get('cms/news/{post}', [PostController::class, 'edit'])->name('cms.news.edit');
        Route::put('cms/news/{post}', [PostController::class, 'update'])->name('cms.news.update');
    });

    Route::middleware('can:viewAny,'.Category::class)->group(function (): void {
        Route::get('cms/categories', [CategoryController::class, 'index'])->name('cms.categories.index');
        Route::get('cms/categories/create', [CategoryController::class, 'create'])->name('cms.categories.create');
        Route::post('cms/categories', [CategoryController::class, 'store'])->name('cms.categories.store');
        Route::get('cms/categories/{category}', [CategoryController::class, 'edit'])->name('cms.categories.edit');
        Route::put('cms/categories/{category}', [CategoryController::class, 'update'])->name('cms.categories.update');
    });

    Route::middleware('can:viewAny,'.Campaign::class)->group(function (): void {
        Route::get('cms/campaigns', [CampaignController::class, 'index'])->name('cms.campaigns.index');
        Route::get('cms/campaigns/create', [CampaignController::class, 'create'])->name('cms.campaigns.create');
        Route::post('cms/campaigns', [CampaignController::class, 'store'])->name('cms.campaigns.store');
        Route::get('cms/campaigns/{campaign}', [CampaignController::class, 'edit'])->name('cms.campaigns.edit');
        Route::put('cms/campaigns/{campaign}', [CampaignController::class, 'update'])->name('cms.campaigns.update');
    });

    Route::middleware('can:viewAny,'.Page::class)->group(function (): void {
        Route::get('cms/pages', [CmsPageController::class, 'index'])->name('cms.pages.index');
        Route::get('cms/pages/create', [CmsPageController::class, 'create'])->name('cms.pages.create');
        Route::get('cms/pages/start', [CmsPageController::class, 'start'])->name('cms.pages.start');
        Route::post('cms/pages', [CmsPageController::class, 'store'])->name('cms.pages.store');
        Route::get('cms/pages/{page}', [CmsPageController::class, 'edit'])->name('cms.pages.edit');
        Route::put('cms/pages/{page}', [CmsPageController::class, 'update'])->name('cms.pages.update');
    });

    Route::middleware('can:viewAny,'.Redirect::class)->group(function (): void {
        Route::get('cms/redirects', [RedirectController::class, 'index'])->name('cms.redirects.index');
        Route::get('cms/redirects/create', [RedirectController::class, 'create'])->name('cms.redirects.create');
        Route::post('cms/redirects', [RedirectController::class, 'store'])->name('cms.redirects.store');
        Route::get('cms/redirects/{redirect}', [RedirectController::class, 'edit'])->name('cms.redirects.edit');
        Route::put('cms/redirects/{redirect}', [RedirectController::class, 'update'])->name('cms.redirects.update');
    });

    // Generic per-content SEO editor; the controller gates each content type
    // on its own edit permission. Listing-page types omit the content id.
    Route::get('cms/seo/{content_type}/{content_id?}', [SeoMetadataController::class, 'edit'])->name('cms.seo.edit');
    Route::put('cms/seo/{content_type}/{content_id?}', [SeoMetadataController::class, 'update'])->name('cms.seo.update');
});

require __DIR__.'/settings.php';
