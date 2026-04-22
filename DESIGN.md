# Design system

The canonical reference for visual language on Leuven Coworking Cafes. Keep this doc in sync when palette, type, or component-level conventions change.

Brand mood: _neighbourhood cafe directory_, not tech product. Warm paper-cream backgrounds, navy for authority, orange for action. Serif body type for the "printed-guide" feel; emoji prefixes on interactive controls for a handmade voice.

---

## Palette

All values are currently inlined as hex literals in Tailwind bracket classes (e.g. `bg-[#1a365d]`). Named CSS custom properties exist in `src/style.css` but are unused by components. See **Design debt** at the bottom.

### Brand

| Role           | Hex       | Used as                                                   |
| -------------- | --------- | --------------------------------------------------------- |
| Navy (primary) | `#1a365d` | Header bg, active controls, body headings, borders        |
| Navy hover     | `#15284a` | Hover state on active navy buttons (OpenNowChip only)     |
| Navy track     | `#2d4a7c` | Progress bar track behind the orange fill (VisitProgress) |
| Orange         | `#ed8936` | CTA buttons, active-state accent, badges, focus rings     |
| Orange hover   | `#dd7826` | Hover state on orange CTAs                                |

### Surfaces

| Role            | Hex       | Used as                                                          |
| --------------- | --------- | ---------------------------------------------------------------- |
| Cream (default) | `#fffaf0` | Page background                                                  |
| Cream surface   | `#f5f0e6` | FilterBar panel, footer bg, card hover bg, map empty-state veil  |
| Cream deep      | `#faf5eb` | Card quote-block bg (SpaceSummary description)                   |
| Warm border     | `#e2d9c8` | SpaceCard border, footer top border, tag borders                 |
| Cool border     | `#cbd5e0` | Form control borders, dashed empty-state border, header subtitle |

### Text

| Role           | Hex       | Used as                                              |
| -------------- | --------- | ---------------------------------------------------- |
| Ink            | `#1a202c` | Form control value text (default body is inherited)  |
| Body muted     | `#4a5568` | SpaceCard body copy, description italic              |
| UI muted       | `#718096` | Secondary metadata, labels, footnotes                |
| Placeholder    | `#a0aec0` | Empty-state secondary line                           |
| Inverse muted  | `#cbd5e0` | Muted text on navy bg (header subtitle, VisitProgress) |
| White          | `#ffffff` | Text on navy/orange fills                            |

### Semantic (SpaceSummary trust indicators)

| Role           | Hex       | Signal                      |
| -------------- | --------- | --------------------------- |
| Success        | `#22c55e` | Verified / fast / good      |
| Warning        | `#eab308` | Medium / tentative          |
| Danger         | `#ef4444` | Slow / missing / bad        |
| Unknown        | `#9ca3af` | Not-yet-rated gray          |

These match Tailwind 3 defaults (`green-500`, `yellow-500`, `red-500`, `gray-400`). Keep them — they read as "standard status colour" to anyone who's seen Tailwind.

---

## Typography

Loaded via Google Fonts link in `index.html`; declared in `src/style.css`.

| Token        | Family                          | Weight | Where                                      |
| ------------ | ------------------------------- | ------ | ------------------------------------------ |
| Display      | `Playfair Display`, Georgia     | 700    | `.font-display` utility on `<h1>`, `<h2>`  |
| Body (base)  | `Crimson Pro`, Georgia          | 400    | Applied globally via `body` rule           |

Scale is pure Tailwind (`text-xs`/`sm`/`base`/`lg`/`xl`/`2xl`/`4xl`/`5xl`). No custom type ramp. H1 in header scales `text-2xl sm:text-4xl md:text-5xl`.

---

## Component conventions

**Emoji prefix on buttons.** Interactive controls in the toolbar lead with a single emoji to signal function at a glance:

| Control         | Glyph  |
| --------------- | ------ |
| Filters toggle  | 🎛️     |
| List view       | 📋     |
| Map view        | 🗺️     |
| Open now chip   | ☀️ / ⛅ / 🌧️ / ❄️ / 🌫️ / ⏳ / ⏰ (weather-driven) |

Keep this convention for any new toolbar control — it's the main visual personality of the header.

**Touch targets.** Controls that can be tapped on mobile use `min-h-[44px]` (Apple HIG). Toolbar buttons currently inherit enough padding; OpenNowChip enforces it explicitly — do the same for any new chip.

**Focus.** Active focus ring is orange: `focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:ring-offset-2 focus-visible:outline-none`. Use this pattern on all new interactive elements, not the browser default.

**Button shape.** `rounded-lg border-2` for primary action chips, `rounded` (4px) for smaller tertiary buttons and tags. Don't introduce a third radius without a reason.

**Card shape.** `rounded-lg border-2 border-[#e2d9c8]` + white bg + hover-orange border + hover-lg shadow. Any new card-like surface should follow this pattern.

---

## Accessibility baseline

- Contrast: navy-on-white, white-on-navy, orange-on-white all pass WCAG AA at the sizes used. Orange-on-cream (`#ed8936` on `#f5f0e6`) is borderline — keep it for accents only, never for body copy.
- `aria-pressed` for toggle buttons (OpenNowChip pattern).
- `aria-label` where the visible text is emoji-heavy or ambiguous.
- Keyboard nav: every interactive element is tab-reachable, focus ring must remain visible.

---

## Design debt

- **CSS custom properties in `style.css` are unused.** Components inline the same hex values in Tailwind bracket classes. Consequence: renaming a brand colour today requires editing ~7 component files instead of one variable.
  - Options:
    1. Migrate components to `bg-[var(--color-primary)]` — works but keeps the dual source of truth.
    2. Move to Tailwind 4 `@theme` block in `style.css` — registers real design tokens so classes like `bg-primary` / `text-accent` work natively. Recommended.
  - Scope: ~30 min, touches every component but only via find-and-replace.
- **Hues outside the seven named vars** (navy-hover, navy-track, cream-deep, warm-border, cool-border, cream-surface, orange-hover, ink, body-muted, placeholder) need names before we can promote to tokens — hence this doc.
- **No dark mode.** Cream-first palette doesn't currently map to a dark counterpart. Defer until there's a user ask.
