# FMCA Task Log

Living execution log for the FMCA website + CMS build. Read `PROJECT_PLAN.md` for the product contract; this file tracks what is shipped, what is queued, and what happened when.

**How to use this file**
- Update queue item status as work lands (`queued` → `in-progress` → `done` with a date and commit).
- Append execution entries to the bottom of the log (newest last), one entry per significant work session or decision.
- Keep entries factual and short: what was done, what was verified, what remains.

## Shipped (verified in git history)

| Area | What landed | Evidence |
| --- | --- | --- |
| Foundation | Laravel 12 + Inertia React + Tailwind 4 + Pest + Boost + Fortify (login, 2FA, passkeys, email verification) | commits 44d5d5a, 330f32f |
| Access control | Roles/permissions (spatie-style pivot tables), policies, seeder with 6 plan roles | `PermissionsRolesTest` (13 tests) |
| Home page | All 10 public sections: emergency hotbar, status strip, campaign carousel, quick services, metrics, insurance guidance, centres of excellence, institutional strength, campus access, emergency banner + `SiteShell` | commit 3ea54be |
| Home CMS | Homepage editor with draft/submit-for-review workflow, one published configuration | `cms/homepage.tsx` |
| Departments & Services | Models, migrations, seeders, public index + detail pages, CMS CRUD | commit 3ea54be |
| Appointments | Request form, minimum-data collection, throttling, rate-limit + validation tests | `AppointmentsTest` (5 tests) |
| Contact | Public contact page, feedback form, throttled submission | `ContactTest` (5 tests) |
| System | 404 error page | `NotFoundTest` |

## Queue

Ordered by the plan's delivery sequence (step 3 "Public MVP" before step 4 "CMS"). Status: `queued` / `in-progress` / `done`.

| # | Task | Plan ref | Status |
| --- | --- | --- | --- |
| 1 | **News & press pipeline**: `Post` + `Category` models/migrations/factories/seeder; public `/news` and `/news/{slug}` (Article template); CMS post + category CRUD gated by the already-seeded `view_news`/`edit_news`/`publish_news` permissions; content owner + last-reviewed date; Pest coverage | §Public MVP, §Article template | done 2026-09-20 |
| 2 | **Campaigns entity + CMS campaign manager**: `Campaign` model with all plan fields (eyebrow, copy, CTAs, desktop/mobile media, alt text, focal point, owner, start/end dates, sort, review status, revision history); CMS manager with draft/review/publish/expire; `HomeController` serves only published campaigns; **remove the hard-coded Unsplash fallback slides in `resources/js/pages/home.tsx`** — carousel must be a content module, not hardcoded | §Homepage campaign carousel | done 2026-09-20 |
| 3 | **Pages foundation**: `page_templates` registry (the 12 required templates), `pages`, `page_blocks` with block-per-template validation; CMS page editor with template picker; unblocks patient guides, legal, institutional pages | §Page-template system | queued |
| 4 | **Patient guides**: `/patients/...` content via pages foundation (Patient Guide template: steps, alert, FAQ, document list, contact panel) | §Public MVP | queued |
| 5 | **Legal pages**: privacy, cookies, accessibility, terms via Legal template; compliance ownership fields | §Public MVP, §SEO/privacy | queued |
| 6 | **Public search**: utility route over services, departments, posts, pages; fixed application view | §Public MVP | queued |
| 7 | **SEO foundation**: `seo_metadata` + `redirects` entities, per-page editable SEO fields, XML sitemaps by content type, robots.txt, breadcrumbs | §SEO, privacy, performance | queued |
| 8 | **Revisions & audit trail**: `content_revisions` + `audit_logs` backing the homepage review workflow; revision compare/restore; immutable audit of create/change/approve/publish/archive/delete attempts | §CMS governance | queued |
| 9 | **Media library + documents**: `media` and `documents` entities, CMS media management, owned review dates | §Blocks, §CMS | queued |
| 10 | **Clinics & consultants**: `clinics`, `consultants` entities; Consultant template page (approved profiles only) | §Page taxonomy | queued |
| 11 | **Quality hardening**: 360px pathway checks (emergency, services, directions, appointment), carousel keyboard/touch/reduced-motion tests, low-bandwidth pass, security review | §Testing and acceptance | queued |

Dependencies: 3 blocks 4 and 5; 1 and 2 are independent; 8 should follow 1–5 (revisions need content to revise); 11 runs last across the board.

## Execution log

- **2026-09-20** — Project survey of shipped state (models, routes, pages, tests, seeders) against PROJECT_PLAN.md. Findings: 16 of the plan's 23 domain entities unimplemented; news/patient guides/legal/search absent from public site; carousel not yet CMS-managed (served from `HomeConfiguration.sections` JSON with hard-coded Unsplash fallback — conflicts with plan). No TODO markers in code; seeder already carries `view_campaigns`/`view_pages` permissions ahead of their features. **Task log created. Next task: Q1 News & press pipeline.**
- **2026-09-20** — Q1 News & press pipeline shipped. Backend: `categories` + `posts` migration (`2026_09_19_233248`), `Post`/`Category` models (with `published()` scope, owner/reviewed_at audit fields), factories + `NewsSeeder` (3 categories, 4 published placeholder posts, cautious prose per plan), `User::canManageNews()`. Public `NewsController` (`/news` with `?category=` filter, `/news/{slug}` with related items) rendering `news`/`article` Inertia pages. CMS: `Cms\PostController` + `Cms\CategoryController` gated by policies (`view_news` → index/view, `edit_news` → writes, `publish_news` → status=published); routes `cms.news.*` + `cms.categories.*` (renamed from `cms.posts.*` so Wayfinder emits `@/routes/cms/news`). Gating note: reused the seeder's existing `*_news` permissions instead of adding `*_posts` (seeder already had them; avoids divergence). Frontend: `news.tsx`, `article.tsx`, `cms/news/index.tsx` + `edit.tsx`, `cms/categories/index.tsx` + `edit.tsx`; sidebar "News" nav; footer "News & Updates" → `news()`; Wayfinder modules regenerated via `npm run build`. Verified: 17 new Pest tests (`NewsTest` 7 public + `CmsNewsTest` 10 CMS, incl. publish gate — `department_editor` can draft/unpublish but not publish), full suite 85/85 passing, `tsc --noEmit` clean, Pint applied. Pint applied. **Committed to main. Next task: Q2 Campaigns entity + CMS campaign manager.**
- **2026-09-20** — Q2 Campaigns entity + CMS campaign manager shipped. Backend: `campaigns` migration (`2026_09_20_000000`) with all plan fields (eyebrow, copy, dual CTAs, desktop/mobile media, media alt, focal point, video poster, overlay intensity, owner, advisory flag, start/end window, sort order, status, reviewed_at), `Campaign` model with `published()` + `active()` scopes (expiry is derived from the start/end window, not a status — draft/review/published states only), `CampaignFactory` (`published`/`advisory`/`alwaysOn` states) + `CampaignSeeder` (2 cautious always-on published campaigns, media null until the Q9 media library lands; wired into `DatabaseSeeder`), `User::canManageCampaigns()`. CMS: `Cms/CampaignController` + `CampaignPolicy` (`view_campaigns` → read, `edit_campaigns` → write, `publish_campaigns` → status=published); `StoreCampaignRequest`/`UpdateCampaignRequest` with a `statusRule` that mirrors the news publish gate (`media_officer` can keep a published campaign published or demote it, but cannot publish a draft/review item); routes `cms.campaigns.*` under the auth+verified group. `HomeController` now serves `campaigns` via the `active()` scope mapped to camelCase slide arrays; the hard-coded Unsplash slides and the hero-derived fallback in `home.tsx`/`campaign-carousel.tsx` are removed — the carousel is a content module with a static institutional fallback when nothing is published, advisory slides never auto-advance, reduced-motion respected, first media eager / rest lazy. Frontend: `cms/campaigns/index.tsx` + `edit.tsx` (mirrors the news manager), `StatusChip` gains an `In review` state, sidebar "Campaigns" nav; Wayfinder modules regenerated. Out of scope, matching Q1: revision history / content_revisions (Q8) and the media-library-driven media fields (Q9). Verified: 13 new Pest tests (`CampaignsTest` 4 public window/ordering/field checks + `CmsCampaignsTest` 9 CMS access/publish-gate/validation), full suite 98/98 passing, `tsc --noEmit` clean, Pint clean, seeder confirmed to produce 2 published campaigns. **Committed to main. Next task: Q3 Pages foundation.**
