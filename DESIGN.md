---
name: William Nakata
description: Incumbent dark console identity for the portfolio and its private editor.
colors:
  carbon: "#18181c"
  linen: "#f3eee3"
  violet: "#723bfa"
  sapphire: "#2f6bff"
  destructive: "#e5484d"
  card: "color-mix(in srgb, #f3eee3 5%, #18181c)"
  secondary: "color-mix(in srgb, #f3eee3 8%, #18181c)"
  muted-foreground: "color-mix(in srgb, #f3eee3 75%, #18181c)"
  subtle-foreground: "color-mix(in srgb, #f3eee3 65%, #18181c)"
  border: "color-mix(in srgb, #f3eee3 16%, #18181c)"
  border-strong: "color-mix(in srgb, #f3eee3 28%, #18181c)"
  accent: "color-mix(in srgb, #723bfa 12%, #18181c)"
typography:
  display:
    fontFamily: "Big Shoulders, Arial Narrow, Roboto Condensed, sans-serif"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.5
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
  code:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
rounded:
  base: "0.125rem"
spacing:
  field-label: "0.5rem"
  field-row: "1.125rem"
  field-column: "1.25rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.linen}"
    rounded: "{rounded.base}"
    padding: "0.625rem 0.875rem"
  button-secondary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.linen}"
    rounded: "{rounded.base}"
    padding: "0.625rem 0.875rem"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.linen}"
    rounded: "{rounded.base}"
    padding: "0.625rem 0.75rem"
  nav-item:
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.base}"
    padding: "0.625rem 0.75rem"
  record:
    rounded: "{rounded.base}"
    padding: "0.875rem 0.75rem"
---

# Design System: William Nakata

## Overview

The incumbent console identity is dark, precise and evidence-led. Carbon ground, linen text and restrained violet/sapphire accents connect the public portfolio to its private tools without making them behave alike. This is documentation of the existing world, not a redesign or a new creative metaphor.

Public portfolio surfaces use expressive display typography and choreographed entrances to foreground the work. The admin uses quiet Geist typography, labeled controls and explicit state feedback to support content editing; it does not inherit public theatrical motion. Surface-specific mode and composition remain in `.impeccable/surfaces/`, not in global tokens.

**Key Characteristics:**
- Dark-only carbon and linen with violet action/selection and sapphire signals.
- Condensed public display; restrained sans-serif admin UI.
- Thin rules, tonal layers and nearly square corners.
- Instant hover changes; reduced-motion support.

Source authority: `src/app/globals.css`, `src/app/[locale]/layout.tsx`, `src/lib/motion.ts`, `src/app/[locale]/admin/admin.css`, and `src/components/admin/`. Frontmatter records reusable observed values; CSS remains the implementation source of truth. Body/title/label/code sizes above describe admin roles, not a universal public type scale.

## Colors

### Primary
- **Ultra Violet:** primary actions, active translation underline and subdued selection fills. `--primary` is the source.

### Secondary
- **Electric Sapphire:** input focus, caret and live/published status dots; `--ring` and `--signal` share it.

### Neutral
- **Carbon Black / Soft Linen:** ground and foreground throughout both surfaces.
- **Card / Secondary:** linen-derived tonal layers, not unrelated gray swatches.
- **Muted / Subtle Foreground:** supporting text hierarchy.
- **Border / Strong Border:** dividers and control boundaries.
- **Accent:** violet-derived selected surface.
- **Destructive:** exceptional functional error/delete treatment, not a decorative accent.

**The Shared Ground Rule.** Both surfaces consume the same root palette; tune the source tokens rather than adding a second admin palette.

## Typography

- **Public display:** Big Shoulders, uppercase, optical sizing enabled. Hero sizing is fluid and viewport-sensitive; preserve the actual formulas in `globals.css`, rather than assigning the admin title scale to it.
- **Admin UI:** Geist, sentence case. Editor title uses the frontmatter title role; topbar title is smaller (1.125rem), section titles are compact (0.9375rem), supporting detail is 0.6875rem. On narrow screens editor title becomes 1.25rem and input text becomes 1rem.
- **Brand exception:** the admin WN monogram retains Big Shoulders (1.625rem, weight 700, line-height 1, tracking -0.04em).
- **Mono:** Geist Mono for code and functional data/readouts, not ordinary admin labels or navigation. Existing public telemetry labels are a data/chrome usage, not an admin heading template.

## Layout

Public shell: centered full-width container, maximum 90rem; horizontal padding 1.5rem, increasing to 2.5rem at `md` and 9rem at `xl` for the side rails.

Admin implementation: sidebar (14.5rem), record list (17rem), flexible editor. At 1600px the list grows to 19rem; at widths up to 1199px sidebar/list become 12.5rem/14rem. At 959px and below the sidebar becomes a top region with wrapping navigation. At 639px and below regions stack, fields become single-column, and the record list becomes horizontally scrollable. This last behavior is observed source, not a claim of authenticated mobile approval.

At desktop widths (960px and above), the topbar is sticky at top 0; the record panel is sticky below it at 6.25rem, with maximum height `calc(100dvh - 6.25rem)` and its own vertical scrolling. These two sticky treatments do not apply on tablet/mobile; the stacked navigation and responsive list/editor retain normal flow.

Forms cap at 54rem; desktop fields use two columns with frontmatter row/column gaps. Editor padding is 2rem 2.5rem on desktop and 1.5rem 1rem on phones. Save feedback/actions occupy a sticky bottom bar with safe-area padding on phones. Keep translated labels and long titles able to wrap; keep list/editor widths shrinkable.

## Elevation & Depth

Admin depth is tonal and structural: carbon workspace, slightly lighter sidebar/fields, thin separators and selected violet fills. No floating-card drop-shadow system is established. The selected navigation item's inset 1px violet outline is a state boundary, not ambient elevation. Do not generalize this admin restraint into a ban on the public site's visual effects.

## Shapes

Base corners are nearly square (2px at the default root size). Controls use the base radius; do not infer a rounded-card language from generic library radius aliases. Status/dirty dots are circular functional exceptions. Borders are generally 1px; active translation tabs use a 2px underline. The login panel has a 2px violet top rule.

## Components

- **Buttons:** compact, explicit actions; minimum height 2.625rem, frontmatter padding, strong neutral border. Primary uses violet; hover instantly mixes violet with linen (85% violet). Secondary hover uses the secondary surface and linen border. Disabled controls use half opacity and a not-allowed cursor.
- **Fields:** visible labels, tonal fill, 1px input border, minimum height 2.75rem. Focus is a sapphire 2px outline with 2px offset; invalid fields use destructive borders and errors are also textual. Search places its focus outline on the containing control. Outside these admin overrides, the global focus-visible outline is linen with 3px offset; do not incorrectly claim all focus is sapphire.
- **Navigation / records:** active state combines violet tint, border/outline and semantic current-page state. Record rows carry title, optional detail, and a text-labeled status dot. Hover changes immediately; status is not conveyed by color alone.
- **Translation tabs:** separate from UI-locale links; active underline and semantic tab state. Both language panels remain mounted, preserving unsaved values while the edited language changes. Arrow/Home/End keyboard handling is implemented.
- **Save / errors / deletion:** explicit saves, persistent clean/dirty status, inline saved notice and linked error summary. Validation identifies the language, exact section/block/field and localized reason; summary links reveal the relevant language/editor and focus/scroll to the actual control, with focusable content-container fallbacks. Invalid controls bind `aria-invalid` and `aria-describedby` to summary errors. Article actions distinguish draft/unpublish from publish/update. Existing entry deletion remains behind a disclosure and confirmation checkbox. These are source-observed behaviors, not completed live CRUD verification.
- **Article blocks:** section/block containers are rule-separated; reorder/delete controls use accessible labels. Removing a section or block requires native confirmation before dropping its local state. Code fields alone receive mono typography; preview stays readable and images fit their container.
- **CV upload (source-observed, not live owner-authenticated verification):** native single-PDF picker and drag/drop beside each language's CV URL, maximum 3 MB (3 × 1024 × 1024 bytes); profile editing/save are disabled during upload, with localized progress, error and success feedback. The uploaded URL marks the profile dirty and requires explicit Save. The existing public Supabase `cvs` bucket uses unique paths without overwriting or deleting old objects; abandoned uploads may remain public unattached files.

**The Hard-Cut Rule.** Hover state changes have no fade. Admin adds no decorative motion. Public entrances/exits use `src/lib/motion.ts`, not locally invented timing: expo-out settling, short expo-in cuts, staggered layers; route-curtain withdrawal uses its established in-out curve. Reduced motion means zero duration or no animation/overlay.

## Do's and Don'ts

### Do:
- **Do** inherit the carbon/linen palette and source tokens across both surfaces.
- **Do** keep public display expression separate from task-focused admin typography.
- **Do** preserve bilingual content, explicit saves, visible focus and text-backed status.
- **Do** record blocked verification honestly before approving authenticated behavior.

### Don't:
- **Don't** add decorative admin animation or animated hover fades.
- **Don't** fabricate content, metrics, approval evidence or new brand assets.
- **Don't** treat source inspection as authenticated visual or CRUD approval.

Verification provenance: the parent session previously reported passing build/schema checks and production public-route and EN/PT login screenshots at 1440/390 with no console errors. After the source-only finish-review fixes, the parent reports nine tests, typecheck and lint passing. This documentation recheck inspected the changed admin CSS and editor components only; it did not rerun those checks or capture the UI. The authenticated main workspace has **no captures and no CRUD exercise**; reviewer disposition is **recapture**, not live approval, and verification remains **blocked until the owner signs in**. Back/Forward dirty-state protection is an **open source risk requiring authenticated reproduction before implementation**, not approved behavior. No new shipping raster assets are introduced.

CV extension verification: source inspected in `src/components/admin/cv-upload.tsx`, `src/components/admin/content-editor.tsx`, `src/lib/admin/cv-upload.ts` and `src/app/api/admin/cv/route.ts`. The parent reports build, typecheck, lint and 15 tests passing, plus unauthenticated HTTP checks returning 403 for the same-origin guard and 401 for the auth guard. The UI reviewer approved source only; authenticated captures remain unavailable pending owner login and extension approval. This documentation pass did not rerun checks or exercise upload/save; no live approval is implied.
