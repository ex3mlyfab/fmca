---
name: ui-design-system
description: "ACTIVATE for ANY interface work in this app: building or restyling Inertia React pages (resources/js/pages), components (resources/js/components), Tailwind utility classes, dashboards, CMS/admin screens, forms, inputs, cards, navigation, alerts, status indicators, data tables, empty/loading/error states, or auditing existing UI for contrast, hierarchy, or polish. Enforces the FMCA vibrant high-contrast design system: a bold but harmonious, WCAG-compliant palette, clear typographic hierarchy, generous whitespace, strong visual grouping, prominent primary CTAs, clearly distinguishable interactive elements, and complete hover/active/focus/disabled/success/warning/error states. Prioritizes readability, accessibility, and visual hierarchy while keeping a colorful premium aesthetic. Skip for backend PHP, database, API, or build-config-only changes."
---

# FMCA UI Design System

This skill is the quality bar for **every** page and component in the FMCA application. It produces UI that is vivid, highly legible, and premium without tipping into clutter or washed-out "muddy" defaults. Use it whenever you create or modify any visible surface.

## 0. Scope and how to use this skill

- The app is **Inertia v3 + React 19 + Tailwind CSS v4 (CSS-first)** with shadcn-style primitives in `resources/js/components/ui/` and FMCA-specific public-site sections in `resources/js/components/public/`.
- Styling is done with Tailwind utilities, composed through `cn()` from `@/lib/utils` (clsx + tailwind-merge) and `class-variance-authority` (`cva`) for varianted primitives. Match that idiom — do not introduce CSS modules, styled-components, or inline `style` objects for color/spacing.
- Design tokens live in `resources/css/app.css`:
  - Brand palette under `@theme` → `--color-fmca-*` (usable as `text-fmca-green`, `bg-fmca-crimson`, `border-fmca-ink/10`, etc.).
  - Semantic shadcn tokens under `:root` / `.dark` (`--primary`, `--muted`, `--destructive`, `--ring`, ...) → `bg-primary`, `text-muted-foreground`, `ring-ring`.
- Before shipping UI, run the **Pre-flight audit (§9)** on what you changed. Do not declare a screen done until it passes.

This skill layers on top of `PROJECT_PLAN.md` (WCAG 2.2 AA, 48px targets, 8px grid, reduced-motion, "never color-only signal" are non-negotiable). The brand's baseline is calm/clinical; **this skill pushes it toward "vibrant + highly contrasting + premium" while keeping that discipline.** User instructions always override this file.

---

## 1. The color system (vibrant, harmonious, contrast-verified)

Six hues are the **entire** chromatic vocabulary. Do not introduce off-palette colors (no neon, no AI-purple, no random rainbow accents). Pick a hue by *semantic role* and lock it for the page.

| Token | Hex | Role (semantic) | Verified contrast w/ white (measured) |
|---|---|---|---|
| `fmca-green` `#0B5D39` | Primary brand | **Primary CTA**, key actions, brand emphasis, active nav | 7.96:1 → **AAA both ways** (green-on-white and white-on-green) |
| `fmca-green-dark` `#06432A` | Primary depth | Header/footer, hover state of green, large text | 11.39:1 white-on-dark → AAA |
| `fmca-teal` `#0D9488` | Supporting accent | Clinical/positive supports, large headings, icons, UI shapes | 3.74:1 → **large/UI only** (fails 4.5 small text) |
| `fmca-sky` `#0284C7` | Info accent | Informational/links, focus ring, large/UI shapes | 4.10:1 → **large/UI only** (fails 4.5 small text) |
| `fmca-gold` `#D97706` | Advisory accent | Advisory/NHIA, **warning**, attention | 3.19:1 → **large/UI or as a fill w/ dark text** |
| `fmca-crimson` `#DC2626` | Critical accent | **Emergency + error/destructive** (only where things are genuinely critical) | 4.83:1 white-on-crimson → AA |
| `fmca-ink` `#18302A` | Text | Primary body/heading text on light surfaces | 14.05:1 → AAA |
| `fmca-mist` `#F4F8F6` | Surface tint | Soft alternate background, section bands, cards on white | (use ink on it: 13.11:1 AAA) |

Neutrals (clean, not muddy): white `#FFFFFF`, `fmca-mist` as the tinted surface, and the `slate` scale for the CMS/admin. Rule of thumb: **ink for primary text, `slate-600` for secondary text, never `slate-400` or lighter for anything a user must read.**

### "Vibrant, not excessive" — the accent budget
- **Primary CTA of a screen = one saturated green block.** It is the loudest thing on the page.
- **Emergency = crimson**, and *only* for genuinely critical items (SOS line, error states). A page can carry at most one persistent crimson element; more reads as an alarm storm.
- **Teal / sky / gold are supporting accents** used for grouping, secondary states, icons, and section emphasis — not painted across whole backgrounds.
- Keep **surfaces mostly white / mist** so the saturated accents have contrast to pop against. Color carries the visual energy; whitespace carries the legibility. That combination is what reads "vibrant + premium" instead of "loud."
- Lock **one accent per view.** Audit every badge, button, and icon before shipping; a teal section must not suddenly get a sky CTA.

---

## 2. Contrast floor (WCAG 2.2 AA, measured)

Target **AA** for everything; **AAA** for body text. Numbers below are computed for *this* palette — trust the ones you verify, never assume.

| Element | Minimum | Notes |
|---|---|---|
| Body / small text (< 18.66px or < 14pt at 400) | **4.5:1** | Use ink or `slate-700/600` on light. This is why teal/sky/gold are **not** for small body text on white. |
| Large text (≥ 18.66px, or ≥ 14pt bold) | **3:1** | teal/sky/gold are fine here (headings, big numbers, labels ≥ 18px bold). |
| UI components & graphical objects (icon borders, input outlines, focus rings, status borders) | **3:1** | borders/icons must clear 3:1 against their *adjacent* background. |
| Focus indicator | **3:1** | ring vs both the element it surrounds and the page. |

**Practical mapping:**
- Text **on a solid brand fill**: white-on-green 7.96, white-on-crimson 4.83 (AA), white-on-sky 4.10 (large only), white-on-teal 3.74 (large/UI only), **white-on-gold fails (3.19) → use `amber-950`/dark text on gold, or put gold as a fill with ink text.**
- **Status fills** (solid chip + white label): use a **darker step** so white clears 4.5:1 — success `emerald-700` (5.48), warning: don't pair white-on-amber; use **dark text on amber-500** (6.97) or amber-50 bg + amber-900 text; error `red-700` (6.47); info `blue-600` (5.17).
- On a **colored/mist background**, step text one darker: `slate-500` on mist is 4.44 (fails 4.5) → use `slate-600` on `fmca-mist`.

If you cannot make a combo pass, change the fill (go a step darker/saturate) or add a scrim/border — do **not** ship low-contrast text.

---

## 3. Typography (bold headings, readable body)

- **Headings → `font-display` (Plus Jakarta Sans), weight 700–800.** This is where "bold" lives. Never thin headings.
- **Body / labels / data → `font-sans` (Inter).** Tabular figures for dates, times, fees, IDs, and operational data: add `tabular-nums`.
- **Minimum sizes:** body ≥ `text-sm` (14px) desktop / `text-base` (16px) mobile for anything essential; no essential text below 14px; helper/micro text ≥ 12px.
- **Minimum weight for any user must read: 400.** No `font-light`/`font-thin` for body or labels — "overly thin fonts" is a named anti-pattern. Reserve light weights for giant display numbers at most.
- **Hierarchy scale** (one step at a time; a page has one H1):

  | Level | Size | Weight |
  |---|---|---|
  | H1 / page hero | `text-4xl` → `text-6xl` | 800, `tracking-tight`, `leading-tight` |
  | H2 section | `text-2xl` → `text-3xl` | 700 |
  | H3 / card title | `text-lg` → `text-xl` | 700 |
  | Lead / intro | `text-lg` → `text-xl` | 400/500, `text-slate-600` |
  | Body | `text-base` | 400, `leading-relaxed`, `max-w-[65ch]` |
  | Secondary/meta | `text-sm` | 500, `text-slate-600` |

- Line length for prose: cap readable measures with `max-w-[65ch]` / `max-w-2xl`.

---

## 4. Spacing, layout & visual grouping (generous whitespace)

- **8-point grid.** All spacing is a multiple of 8 (`p-2`=8, `p-4`=16, `p-6`=24, `gap-8`=32, section `py-16`/`py-24`). No arbitrary half-steps for structure.
- **Use `gap` between siblings**, not margins, for spacing.
- **Section rhythm:** generous vertical padding (`py-16`+ on marketing, `py-10` on dense app screens). Let whitespace do the separating.
- **Visual grouping** (strongest to weakest):
  1. A tinted surface (`bg-fmca-mist` or `bg-slate-50`) around a cluster.
  2. A card (border + elevation) around a unit.
  3. `divide-y` / `border-t` hairlines within a list.
  4. Negative space alone.
  Pick one mechanism per nesting level; don't stack border + shadow + tint + heavy padding all at once (that is clutter).
- Cards: `rounded-xl`, `border`, `shadow-sm`, `p-6` on light; keep shadow subtle and *tinted to the surface* (never pure-black drop on white at high opacity).
- **48px minimum interactive target** everywhere, including icon-only controls (`min-h-12 min-w-12` or `size-12`).

---

## 5. Component standards (immediately distinguishable)

Build/modify the shadcn primitives and FMCA sections to meet these. Each interactive element must be distinguishable from its neighbors by **fill OR border OR consistent 48px target**, and must have every state in §6.

### Buttons
- **Primary (the prominent CTA):** `bg-fmca-green text-white` (7.96:1). Bigger and more saturated than anything beside it. Hover `hover:bg-fmca-green-dark`. One per view as the main action.
- **Secondary:** `bg-white text-fmca-green border border-fmca-green` or `bg-fmca-mist` filled — clearly a step below primary in loudness.
- **Tertiary/Ghost:** text-only `text-fmca-green` + icon, subtle hover tint.
- **Destructive:** `bg-fmca-crimson text-white hover:bg-red-700`. Reserve for irreversible actions.
- Default `Button` sizes already carry the target; for marketing CTAs bump to `h-12`/`h-14` and `font-semibold`. CTA labels: 1–3 words, never wrapping at desktop.
- Every button variant needs `focus-visible` (see §6) and a `disabled` state (muted, `cursor-not-allowed`, still legible ≥ 4.5 or marked non-interactive).

### Inputs / forms
- Label **above** the field, `text-sm font-medium text-slate-700` (never placeholder-as-label).
- Field: `h-11`+ target, `border` ≥ 3:1, `rounded-lg`, `px-4`. Helper text below in `text-sm text-slate-600`; error text below in `text-sm font-medium text-fmca-crimson` **with** an icon (never color-only — see §8).
- Focus: `focus-visible:ring-[3px]` in a color that clears 3:1 against the field bg.
- Invalid: crimson border + crimson helper; disabled: `opacity-50` + `cursor-not-allowed` (still readable).

### Cards
- Clear identity: `bg-white` (on mist) or `bg-card`, `border`, `rounded-xl`, `p-6`, `shadow-sm`. Distinguish interactive cards (lift + border accent on hover) from static cards. Card title uses §3 H3.

### Navigation
- Links ≥ 48px targets, `font-semibold`. **Active** = solid `bg-fmca-green text-white` or thick `border-b-2`/underline in green. **Hover** = green text or mist tint. **Focus-visible** = ring. Primary nav must read as one clear row on desktop.
- Mobile menu: full-width rows, `min-h-14`, high-contrast labels; emergency link is a solid crimson row.

### Alerts
- Four semantic types, each **color + icon + text** (color never alone):
  - **Success:** `emerald-50` bg / `emerald-700` text / `emerald-600` border, check icon.
  - **Warning / advisory:** `amber-50` bg / `amber-900` text / `amber-500` border, alert-triangle. (Or solid `amber-500` + dark text for strong attention.)
  - **Error:** `red-50` bg / `red-700` text / `red-600` border (or solid crimson + white for critical), alert-octagon.
  - **Info:** `sky-50` bg / `sky-800` text / `sky-500` border, info icon.
- Use the existing `Alert`/`AlertTitle`/`AlertDescription` primitives; extend the variant map so all four exist rather than ad-hoc classes.

### Status indicators / badges
- Consistent semantic set (reuse `Badge` variants): **New/Positive** = green, **In progress/Info** = sky, **Warning/Pending** = amber, **Error/Critical** = crimson, **Muted/Inactive** = neutral (gray, `border`, not colored).
- Chips: `text-xs font-semibold`, filled at a contrast-safe step (dark text on amber; white on green/red/blue/emerald-700). Pair an icon or the label so color is never the only signal.

### Data tables
- Header row `font-semibold` on `fmca-mist`/`slate-50`; row dividers `divide-y divide-slate-200`; align numbers right with `tabular-nums`; zebra or hover `bg-fmca-mist` to aid scanning; status cells use the §5 status chips.

---

## 6. Interaction-state matrix (every interactive element)

Before shipping, confirm each control can reach **all** of these, in this order of importance:

| State | How | Requirement |
|---|---|---|
| **default** | base fill/border | meets §2 contrast |
| **hover** | `hover:` | visible change (darken fill ~10%, or tint + border) — no element "dead" on hover |
| **active/pressed** | `active:` | tactile step: `active:translate-y-px` or `active:scale-[0.98]` |
| **focus-visible** | `focus-visible:` | ring `[3px]` in `fmca-sky`/green, `ring-offset-2`, ≥3:1 against bg, offset from content |
| **disabled** | `disabled:` | `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed`, label still legible |
| **success** | on submit/validate | green confirmation (text + icon, or toast) |
| **warning** | advisory/partial | amber, with text + icon |
| **error** | on invalid/danger | crimson border/`aria-invalid` + inline message + icon; focus lands on the field |

The global `:focus-visible` rule in `app.css` (`outline-2 outline-offset-2 outline-fmca-sky`) is the floor — a control with **no** visible focus state is a bug.

---

## 7. Anti-patterns → fixes (the "avoid" list, made concrete)

| Avoid | Fix |
|---|---|
| **Low-contrast text** (light gray on white, colored small text) | Ink / `slate-700` for text; colored text only at large size or on a dark fill. Audit with §2. |
| **Overly thin fonts** | Enforce `font-medium`+ for UI, `font-semibold/bold` for headings; drop `font-light/thin` for anything read. |
| **Muddy colors** (desaturated grays for interactive elements, gray-on-gray) | Interactive = brand hue at full saturation. Neutrals only for structure/backgrounds. |
| **Excessive gradients** | No gradient backgrounds or gradient text. Brand is clinical; use solid fills + tinted shadows. A subtle single-hue scrim on a photo is the only exception. |
| **Visual clutter** (stacked borders + shadows + tints + heavy padding; dense with no whitespace) | One grouping mechanism per level (§4). Add whitespace; cut a divider/shadow/tint. |
| **Unnecessary decoration** (ornamental shapes, emoji-as-icons, busy patterns) | Plain surfaces; icon-library glyphs only (lucide); decoration only when it conveys meaning. |
| **One giant washed-out card sea** | Vary: tint a band, one elevated featured card, type scale that steps clearly. |
| **Color-only status** | Every status carries a word or icon (§8). |

---

## 8. Accessibility floor (non-negotiable)

- **Keyboard-operable** everything; logical tab order; visible focus (§6).
- **Semantic landmarks** (`<main>`, `<nav>`, skip link — the public `SiteShell` already ships a skip link; keep it).
- **Never color as the only signal:** status, validation, and alerts always pair color with **text and/or an icon**.
- **48px targets** including icon buttons.
- **Meaningful alt text** for informative images; decorative = `alt=""` / `aria-hidden`.
- **Reduced motion:** honor `prefers-reduced-motion` (global rule already in `app.css`). Any motion you add must collapse to instant under it.
- **Form errors** announced (`role="alert"` / `aria-live`), focus moved to the first invalid field.

---

## 9. Pre-flight audit (run before "done")

Check the changed screens against this list; fix any "no":

1. **Contrast** — every text pair and UI outline clears §2 (use the measured numbers, not vibes). Body text ≥ 4.5:1.
2. **One accent locked** per view; primary CTA is the single loudest element; crimson only where critical.
3. **Hierarchy** — one H1, steps of size/weight are clear, no two headings the same size.
4. **All states present** — hover, active, focus-visible, disabled, plus success/warning/error where relevant (§6).
5. **Targets** ≥ 48px; **spacing** on the 8-grid with generous whitespace; grouping uses one mechanism per level.
6. **Grouping & consistency** — cards/nav/alerts/badges are distinguishable and match §5; numbers are `tabular-nums`.
7. **Accessibility floor** met (§8), including non-color-only status.
8. **No anti-pattern** from §7 is present.
9. **Both themes** checked where the surface supports `dark:` (CMS/admin): contrast holds in dark mode, not just light.
10. Frontend rebuilt/reflected (`npm run build` / user runs `npm run dev` if UI didn't update).

---

## Appendix A. Wiring the semantic tokens to the brand (recommended)

The shadcn primitives (`Button`, `Input`, `Badge`, `Alert`, sidebar) read the **semantic** `:root`/`.dark` tokens, which currently default to near-black/white shadcn values — so CMS/admin UI does not yet carry the vibrant FMCA brand. To make the whole app consistent, patch `resources/css/app.css`:

```css
:root {
    --primary: #0B5D39;            /* fmca-green: 7.96:1 with white */
    --primary-foreground: #FFFFFF;
    --secondary: #F4F8F6;          /* fmca-mist */
    --secondary-foreground: #0B5D39;
    --accent: #0D9488;            /* fmca-teal (large/UI); pair with dark text if used for small */
    --accent-foreground: #FFFFFF;
    --destructive: #DC2626;      /* fmca-crimson: 4.83:1 with white */
    --destructive-foreground: #FFFFFF;
    --muted-foreground: #475569;  /* slate-600 (not the default 400, for AA) */
    --ring: #0284C7;              /* fmca-sky: visible focus */
}
```

Then the shadcn components inherit green primary, mist secondary, teal accent, crimson destructive, and a sky focus ring automatically — one source of truth for "vibrant FMCA" across public and CMS. Confirm any override with the user before committing, and re-run a contrast pass on affected admin screens. (Dark-mode mirror: keep `--primary` saturated, use off-white foreground, and verify 4.5:1 on the dark surface.)

> This skill is a **convention**, not a hard constraint — user instructions and a later `PROJECT_PLAN` amendment take precedence. When in doubt: **more contrast and whitespace over more decoration.**
