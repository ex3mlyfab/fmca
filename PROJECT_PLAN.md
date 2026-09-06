# Federal Medical Centre, Abuja (FMCA)
## Website and CMS Implementation Plan

## Purpose and authority

This document is the implementation contract for the Federal Medical Centre, Abuja public website and its Laravel CMS. Every contributor and AI agent must read it before creating, changing, or reviewing FMCA product work. User instructions take precedence over this document.

The product is a public-facing, mobile-first federal tertiary-health institution website plus a secure staff CMS. It serves patients and families under stress, referrers, the public, media, staff, and institutional partners. It is not an electronic medical record, diagnostic system, or live clinical scheduling system.

## Product boundaries

The first release provides verified institutional information, service discovery, patient guidance, news, contacts, controlled content publishing, and appointment requests for staff follow-up.

Do not present an appointment request as a confirmed appointment. Do not state clinic availability, clinician details, insurance eligibility, fees, laboratory results, or clinical advice unless the relevant content owner has approved it.

These are future modules, not MVP features:

- Authorised appointment and queue-management integration.
- NHIA eligibility or claims integration.
- Patient, laboratory, pharmacy, or medical-record portals.
- Payment processing and telemedicine.
- SMS, email, and WhatsApp notification integrations.

Each future module requires its own legal, clinical, operational, privacy, security, and vendor-integration approval before implementation.

## Design direction

Reading this as: a Nigerian federal tertiary-health public service for people seeking clear, urgent, trustworthy care information, with a calm clinical-institutional visual language.

The interface must feel authoritative, compassionate, precise, and calm rather than trendy or entertainment-led. Visual variation is restrained; motion supports comprehension and feedback only.

### Design system

- Primary: Federal Medical Green `#0B5D39`.
- Supporting: Clinical Teal `#0D9488`; Surgical Sky `#0284C7`.
- Restricted: Warm Gold `#D97706` for advisory/NHIA contexts; Emergency Crimson `#DC2626` only for critical emergency information and errors.
- Neutrals: sterile near-white surfaces with high-contrast deep-slate text.
- Headlines: Plus Jakarta Sans. Body, labels, dates, and identifiers: Inter.
- Use tabular figures for dates, times, fees, identifiers, and operational data.
- Use an 8-point spacing grid, 48px minimum interactive targets, 8px component radii, 16px card radii, and 24px modal radii.
- Use restrained borders and subtle clinical elevation. Avoid gradients, glassmorphism, heavy shadows, decorative colour, generic SaaS cards, and stock-photo-first design.

### Accessibility and motion

- Meet WCAG 2.2 AA intent: keyboard operation, visible focus, semantic landmarks, accessible errors, adequate contrast, captions/transcripts where applicable, and meaningful alt text.
- Use `prefers-reduced-motion`; reduced motion is a calm fade or no animation, never a degraded experience.
- Never make colour the only status signal.
- Preserve 48px target sizes, including for icon-only controls.

## Mobile-first rules

Design at 360px first, then enhance at 768px and 1024px. Validate at 320px, 360px, 390px, 768px, 1024px, and wide desktop.

- Mobile navigation prioritizes emergency contact, service finding, appointment request, and directions.
- Use a compact sticky header and an accessible mobile menu. Emergency access must remain obvious without obstructing page content.
- Prefer bottom sheets for dense mobile filters and forms when the interaction needs a controlled focus context.
- Build four-column mobile, eight-column tablet, and twelve-column desktop grids with 16px, 24px, and 32px gutters respectively.
- Use responsive images, defer below-the-fold media, avoid autoplaying video, and keep key content usable on constrained connections.
- Do not hide essential patient information behind hover, motion, or desktop-only interactions.

## Information architecture and page taxonomy

Pages are segregated by type. A page belongs to one primary type; do not make a generic page type carry unrelated content.

| Page type | Purpose | URL pattern | Content owner | Required template |
| --- | --- | --- | --- | --- |
| Landing | Home or controlled campaign destination | `/` or campaign slug | Communications | `Home`, `Campaign` |
| Institutional | About, leadership, governance, history | `/about/...` | Corporate Communications | `Institutional` |
| Patient guide | Patient rights, admission, visiting, referrals, billing guidance | `/patients/...` | Patient Services | `Patient Guide` |
| Department | A clinical department and its verified contacts/services | `/departments/{slug}` | Department Editor + Clinical Approver | `Department` |
| Service | A patient-facing clinical or diagnostic service | `/services/{slug}` | Department Editor + Clinical Approver | `Service` |
| Consultant | Approved professional profile only | `/consultants/{slug}` | Clinical Approver | `Consultant` |
| News | News, press release, public notice | `/news/{slug}` | Communications | `Article` |
| Publication | Report, policy, tender, downloadable document | `/publications/{slug}` | Corporate Services | `Publication` |
| Career | Vacancy and recruitment information | `/careers/{slug}` | Human Resources | `Career` |
| Event | Approved public event or programme | `/events/{slug}` | Communications | `Event` |
| Contact | Directions, approved contacts, feedback | `/contact` | Corporate Communications | `Contact` |
| Legal | Privacy, cookies, accessibility, terms | `/legal/{slug}` | Legal/Compliance | `Legal` |
| Utility | Search, request appointment, 404 and system pages | fixed routes | System owner | fixed application view |

Taxonomy dimensions may supplement, never replace, page types: department, service category, audience, topic, location, and content status.

## Page-template system

The CMS must require a template selection when a user creates a page. The selection screen displays the template name, purpose, preview image, permitted blocks, required fields, and assigned owner.

Templates are controlled application definitions, not user-authored arbitrary layouts. Editors can arrange approved blocks within a template's permitted zones; developers add new templates and blocks through reviewed code.

### Required templates

| Template | Use | Required fields | Permitted blocks |
| --- | --- | --- | --- |
| Home | Root public landing page | Hero campaigns, emergency details, quick actions | carousel, emergency alert, service finder, notice feed, service grid, news feed, CTA |
| Campaign | Time-bound awareness or institutional campaign | campaign dates, owner, primary CTA | hero, rich text, media, statistics, FAQ, CTA |
| Institutional | About, leadership, governance | title, summary, review owner/date | rich text, media, timeline, people, document list, CTA |
| Patient Guide | Practical patient task or policy guidance | title, audience, last reviewed date | steps, alert, FAQ, document list, CTA, contact panel |
| Department | Department overview | department relation, contact, review date | hero, service list, consultant list, clinic information, FAQ, contact panel |
| Service | Patient-facing service details | service relation, department, referral guidance | hero, eligibility/referral panel, preparation steps, FAQ, contact panel |
| Consultant | Approved consultant profile | person, specialty, department | portrait, biography, specialty tags, contact pathway |
| Article | News and press content | author, publish date, category | article body, media, pull quote, related content |
| Publication | Downloadable formal content | document, issuing unit, issue date | summary, document download, related content |
| Career | Vacancy information | closing date, HR owner, application route | job summary, criteria, application CTA, FAQ |
| Event | Public event details | date/time, venue, organiser | event detail, map/directions, registration CTA |
| Contact | Contact and location content | approved contacts, hours, location | emergency contact, map, contact cards, feedback form |
| Legal | Compliance statements | effective date, legal owner | rich text, document download, contact panel |

### Blocks

Initial reusable blocks are: emergency alert, campaign carousel, hero, rich text, image/media, service directory, service card grid, department contacts, consultant list, clinic/session information, patient steps, notice feed, news feed, FAQ, document list, statistics, contact panel, map/directions, related content, and CTA.

Every block must define its public data shape, validation, responsive behavior, empty state, loading state where applicable, accessibility requirements, SEO impact, and permitted templates. Extract a component on the second genuine reuse. Use existing React/Radix project primitives instead of creating inaccessible custom controls.

## Home page: approved Stitch reference and build contract

The supplied Stitch home-page references are the primary visual inspiration for the Home template:

- `stitch_fmca_hospital_landing_page/screen.png`: desktop composition.
- `stitch_fmca_hospital_landing_page (2)/screen.png`: mobile composition.
- Both accompanying `DESIGN.md` files: token and component reference.

They establish hierarchy and interaction intent. They do not authorise unverified service claims, live NHIA verification, laboratory-result access, real-time clinical availability, or use of generated frontend code verbatim.

### Home page composition

The public Home page has a fixed, ordered composition. Its blocks may be configured, hidden, reordered only within approved regions, or scheduled by authorised editors; its structural hierarchy is not freely assembled per edit.

| Order | Public section | Desktop behavior | Mobile behavior | CMS manager |
| --- | --- | --- | --- | --- |
| 1 | Government/utility strip | Compact federal identity, location, operational contacts and key status links | Hidden or condensed into header/menu, except urgent status | `Global Header` |
| 2 | Primary header and navigation | Brand, primary navigation, utility icons, appointment CTA and emergency CTA | Compact logo, notification/utility action, SOS action and accessible menu sheet | `Global Header` |
| 3 | Emergency hotbar | High-contrast active-triage message with direct dispatch action | Persistent, concise emergency action directly below header | `Emergency & Status` |
| 4 | Operational status strip | Triage, blood-bank, clinic/campus status | One readable summary, expandable for details | `Emergency & Status` |
| 5 | Campaign hero carousel | Full-width or split hero using approved campaign imagery, headline, CTA and carousel controls | Full-bleed media with readable overlay, thumb-reachable controls and no clipped text | `Homepage Campaigns` |
| 6 | Immediate patient services | Six quick-service cards in a responsive grid | Two-column large-tap card grid | `Quick Services` |
| 7 | Capacity/trust strip | Compact institutional metrics | Two-column or horizontal summary without tiny text | `Institutional Metrics` |
| 8 | Insurance guidance | NHIA guidance and request pathway | Single prominent guidance panel | `Insurance Guidance` |
| 9 | Centres of excellence | Four featured service/department cards | Horizontally scrollable snap cards or stacked cards | `Centres of Excellence` |
| 10 | Academic and institutional strength | Accreditation, research/training copy, metrics and approved testimonial | Stacked evidence cards and concise testimonial | `Institutional Strength` |
| 11 | Campus access | Map/directions, address and visiting-hours card | Tap-to-open directions and stacked visiting hours | `Campus Access` |
| 12 | Final emergency banner | Last high-visibility emergency action before footer | Sticky-safe CTA that does not collide with mobile navigation | `Emergency & Status` |
| 13 | Footer | Full multi-column navigation, contacts, governance and legal details | Compact contact/legal groups plus mobile bottom navigation | `Global Footer` |

### Home page component inventory and defensive layout rules

Build the following modular, schema-governed public components under `resources/js/components/public/home/` before assembling the Home page:

- `SiteShell`: Global federal utility strip, responsive navigation header, accessible mobile menu sheet, and mobile quick bottom navigation.
- `EmergencyHotbar`: High-contrast triage alert banner with direct emergency call dispatch.
- `OperationalStatusStrip`: Real-time campus status, blood bank reserves, and clinical desk indicators.
- `CampaignCarousel`: Accessible hero carousel with touch swipe, keyboard navigation, pause on hover, and automated gradient scrim for text readability over variable media.
- `QuickServices`: Asymmetric two-tier services section (Immediate Patient Actions vs. Reference Guidance) eliminating repetitive card-grid monotony.
- `MetricStrip`: Tabular institutional capacity metrics without arbitrary numbers.
- `InsuranceGuidance`: Refined NHIA advisory panel with required document checklist.
- `CentresOfExcellence`: Distinct clinical specialty units with department tags, retiring decorative number watermarks.
- `InstitutionalStrength`: Academic residency, postgraduate training, and clinical governance evidence cards with owner review timestamps.
- `CampusAccess`: 50/50 split campus wayfinding card with address and GPS directions alongside a structured visiting-hours schedule.
- `EmergencyBanner`: Last high-visibility pre-footer SOS dispatch action.

#### CMS-First Defensive UI Directives
- **Character length caps:** Hero headlines are capped at 120 characters; summaries at 240 characters. Mobile layouts use defensive line clamping so CTAs remain visible above the fold.
- **Media safeguards:** Images use fixed aspect ratios (`object-cover`) with dark scrim overlays to preserve WCAG AA text contrast regardless of editor-uploaded image luminosity.
- **Anti-slop standards:** Zero raw Unicode emojis or characters (`⌂`, `+`, `☎`) for interactive controls; all icons are rendered via approved SVG icon primitives. Zero decorative em-dashes (`—`) or en-dashes (`–`).
- **Layout diversity:** Multi-cell grids vary in hierarchy (e.g. prominent action cards paired with bordered guidance rows) rather than repeating identical white cards.

### Home CMS: dedicated backend workspace

The CMS must expose a dedicated **Homepage** workspace rather than bury home configuration inside the generic page editor. It is the sole place for configuring homepage section content and order.

| CMS section | Manageable content | Guardrails |
| --- | --- | --- |
| Overview | publication state, preview, last review, scheduled changes | Only one published home configuration |
| Global Header | utility links, primary navigation, logo/wordmark, header actions, mobile bottom navigation | Shared changes affect every public page; require Communications approval |
| Emergency & Status | emergency hotbar, status-strip messages, emergency contacts, display dates | Emergency content requires Clinical Content Approver; expires automatically |
| Homepage Campaigns | carousel slides, desktop/mobile media, CTAs, order, schedule, preview | No emergency slide auto-advance; approved media and alt text mandatory |
| Quick Services | icon, label, summary, approved route/action, priority and visibility | A service action cannot claim an unavailable integration |
| Institutional Metrics | label, value, qualification/source, display order | Source, owner and review date required; do not publish invented statistics |
| Insurance Guidance | guidance copy, eligibility-request action, help contact | No live verification field or success state until approved integration exists |
| Centres of Excellence | related approved departments/services, highlights, CTA | Relationship-driven rather than duplicated manual content |
| Institutional Strength | accreditation facts, approved testimonial, research/training highlights | Accreditation and testimonial owner/review required |
| Campus Access | approved address, map/directions URL, visiting hours, accessibility details | Contact and hours require owner and review date |
| Global Footer | contact blocks, footer navigation, statutory/governance links, copyright, social links | Shared changes affect every public page; legal links cannot be removed without authority |

Editors use an inline live preview at desktop and mobile widths before submitting changes. Shared header/footer changes display the affected public-page count and require an explicit confirmation. Every section supports draft, review, scheduled publication, revision comparison, rollback, and audit history.

### Header and footer data model

Header and footer are global site settings with versioned content, not copied onto individual pages. Navigation records support a label, Wayfinder route/approved external URL, parent, sort order, visibility breakpoint, icon, and active date range. Header actions and footer contacts are separate managed records to avoid mixing navigation with urgent contact information.

The header has three controlled zones: government/utility, primary navigation, and urgent actions. The footer has four controlled zones: institutional identity, clinical service links, governance/patient-rights links, and 24/7 contact/legal information. The mobile bottom navigation is independently managed but may use only approved primary actions: Home, Services/Clinics, SOS, Appointments/Requests, and Portal/Future access.

## Integration safety for Stitch-inspired actions

The Stitch references show NHIA coverage checking and laboratory/CT result lookup. Until a formally approved integration exists, implement these as guidance or request pathways only:

- NHIA card: `Check NHIA guidance` or `Request eligibility support`, never a live-validation promise.
- Results card: `Patient portal information` or `Contact the laboratory`, never a public-results lookup.
- Appointment card: `Request an appointment`, never a confirmed booking.
- Emergency card: direct call/directions only after FMCA formally verifies the emergency contact.

## Homepage campaign carousel

The home template includes a CMS-managed Campaign Carousel. It is a content module, not hard-coded frontend content.

Each campaign has: title, eyebrow, supporting copy, primary and optional secondary CTA, desktop/mobile media, media alt text, image focal point per breakpoint, optional video poster, overlay intensity, campaign owner, emergency/advisory status, start/end publication dates, sort order, SEO metadata, review status, and revision history.

The carousel uses clinical, deliberate movement: image reveal, layered text entrance, and a modest foreground-depth transition. It must use only opacity and transform animations, have no layout-shifting animation, and never depend on autoplay to convey information.

- Provide previous/next controls, visible slide status, keyboard navigation, swipe support, pause control, and accessible labels.
- Pause automatic advancement on hover, focus, or user interaction; do not auto-advance emergency content.
- Use reduced-motion fade/no-motion behavior.
- Eager-load only the first eligible campaign; defer all other media.
- If only one campaign is published, render it as a static hero without carousel controls.
- Draft, review, preview, schedule, publish, expire, archive, and restore campaigns through the CMS.

## CMS governance and workflow

Roles: Super Admin, Communications Editor, Clinical Content Approver, Department Editor, Media Officer, and Auditor.

- Department Editors may change only their assigned department content.
- Clinical content requires approval by a Clinical Content Approver before publication.
- Communications may publish non-clinical news and campaigns within delegated authority.
- Legal pages require designated compliance ownership.
- Keep immutable audit entries for creation, change, approval, publication, archive, restore, and deletion attempts.
- Support draft, in-review, changes-requested, approved, scheduled, published, expired, and archived statuses.
- Maintain revision history, compare revisions, restore revisions, and password-protect privileged actions where appropriate.
- Require a content owner and review date for all patient-facing clinical, operational, and contact information.

## Backend and frontend architecture

- Use Laravel, Inertia React 3, Tailwind CSS 4, existing Radix UI primitives, Lucide icons, and Wayfinder-generated route/action functions.
- Use Laravel models, migrations, Form Requests, policies, events, queues, and cache invalidation in established project conventions.
- Public content routes are server-rendered through Inertia responses. CMS routes require authenticated staff access.
- Use Fortify for staff authentication. Require verified staff accounts and two-factor authentication for privileged roles.
- Use named routes and Wayfinder in React; do not hard-code application URLs.
- Do not add dependencies without explicit approval.

Initial domain entities: users, roles, permissions, departments, services, clinics, consultants, pages, page_blocks, page_templates, campaigns, posts, categories, tags, media, documents, notices, redirects, seo_metadata, content_revisions, audit_logs, contact_submissions, and appointment_requests.

Appointment requests must collect only the minimum data needed for follow-up. They are sensitive personal data, must be rate-limited and spam-protected, and must not be repurposed as clinical records.

## SEO, privacy, performance, and security

- Every indexable page must have an editable title, meta description, canonical URL, Open Graph image, indexability directive, and page-type-appropriate structured data.
- Generate XML sitemaps by content type, robots.txt, breadcrumbs, and a news feed where appropriate.
- Preserve redirects whenever public URLs change. Do not silently change slugs, primary navigation labels, or legal copy.
- Use organization/hospital, article, event, FAQ, breadcrumb, and department structured data only when the page contains verified corresponding content.
- Add a visible last-reviewed date to health, service, contact, and patient-guide information.
- Optimize LCP, INP, and CLS through responsive media, font strategy, image dimensions, deferred below-fold assets, and no layout-shifting carousel behavior.
- Implement consent-aware analytics only after privacy approval.
- Follow Nigeria Data Protection Act obligations and privacy-by-design: minimum collection, stated purpose, access controls, encryption in transit, retention rules, incident procedure, and approved processor controls.

## Testing and acceptance

Each feature needs focused Pest coverage for its observable behavior and important failure modes. Test page-template selection, template permissions, publishing workflow, policies, page rendering, redirects, SEO metadata, campaign scheduling, mobile menu semantics, carousel reduced-motion behavior, and input validation.

Before release, verify:

- Emergency, services, directions, and appointment-request pathways are reachable quickly on a 360px viewport.
- Every CMS page has a valid page type and template.
- Editors cannot select blocks outside the chosen template's permissions.
- Clinical information cannot publish without the required approval.
- The carousel works by keyboard, touch, screen reader, and reduced-motion preference.
- Published information has an owner, review date, and valid SEO fields.
- Future-system language never implies a live integration that does not exist.

## Delivery sequence

1. Content and governance discovery: verified service data, owners, approval workflow, media rights, emergency contacts, and legal/privacy review.
2. Foundation: tokens, layouts, responsive components, access control, page types, template registry, blocks, media handling, and SEO defaults.
3. Public MVP: home/carousel, service and department directories, patient guides, news, contact/directions, search, appointment request, and legal pages.
4. CMS: page creation/template picker, block editor, campaign manager, media library, approvals, revisions, audit trail, and SEO editor.
5. Quality hardening: accessibility, responsive/device QA, low-bandwidth performance, security review, backups, monitoring, and editor training.
6. Approved future modules: only after their separate discovery and governance work.
