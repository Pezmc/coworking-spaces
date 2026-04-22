# Design system

The canonical reference for visual language on Leuven Coworking Cafes. Keep this doc in sync when palette, type, or component-level conventions change.

Brand mood: _neighbourhood cafe directory_, not tech product. Warm paper-cream backgrounds, navy for authority, orange for action. Serif body type for the "printed-guide" feel; emoji prefixes on interactive controls for a handmade voice.

## How to use this doc

- **Adding a new colour?** Check **Palette** first. If it's not there, either it maps to an existing hue (use that) or it's a new token — add a row here before you ship.
- **Building a new component?** Read **Component conventions** — button shape, focus ring, touch-target minimum, and emoji-prefix rule are all prescriptive.
- **Auditing contrast or keyboard nav?** See **Accessibility baseline**.
- **Wondering why palette values aren't `bg-primary`?** That's in **Design debt** — it's known, not accidental.

Rules in this doc are **prescriptive** unless marked otherwise. Anything under "Design debt" is a known gap with a plan.

## Contents

1. [Palette](#palette) — brand / surfaces / text / semantic hues, with why each exists
2. [Typography](#typography) — two faces, Tailwind scale, no custom ramp
3. [Layout & responsive](#layout--responsive) — breakpoints, container, grids, spacing
4. [Component conventions](#component-conventions) — extending the system, iconography, variants, states, motion
5. [Accessibility baseline](#accessibility-baseline) — contrast pairs, aria patterns, keyboard, reduced motion
6. [Open questions](#open-questions) — design forks we haven't picked yet
7. [Design debt](#design-debt) — known gaps with a plan to close them

---

## Palette

Scope is deliberately narrow: **two brand hues** (navy for authority, orange for action), **warm neutrals** for surfaces (cream + warm-grey borders), **cool greys** for text, and **Tailwind defaults** for status. Any new hex outside these four groups is a red flag — first ask whether an existing token covers it.

### Brand

_Why these two:_ navy reads as "editorial / guide," orange is the only true accent and is reserved for calls-to-action and active-state affordance. Don't introduce a secondary accent.

| Role           | Hex       | Used as                                                   |
| -------------- | --------- | --------------------------------------------------------- |
| Navy (primary) | `#1a365d` | Header bg, active controls, body headings, borders        |
| Navy hover     | `#15284a` | Hover state on active navy buttons (OpenNowChip only)     |
| Navy track     | `#2d4a7c` | Progress bar track behind the orange fill (VisitProgress) |
| Orange         | `#ed8936` | CTA buttons, active-state accent, badges, focus rings     |
| Orange hover   | `#dd7826` | Hover state on orange CTAs                                |

### Surfaces

_Why warm neutrals:_ cream evokes printed-guide / book paper and separates us from the flat-white tech-product default. Never substitute a cool grey.

| Role            | Hex       | Used as                                                          |
| --------------- | --------- | ---------------------------------------------------------------- |
| Cream (default) | `#fffaf0` | Page background                                                  |
| Cream surface   | `#f5f0e6` | FilterBar panel, footer bg, card hover bg, map empty-state veil  |
| Cream deep      | `#faf5eb` | Card quote-block bg (SpaceSummary description)                   |
| Warm border     | `#e2d9c8` | SpaceCard border, footer top border, tag borders                 |
| Cool border     | `#cbd5e0` | Form control borders, dashed empty-state border, header subtitle |

### Text

_Why cool greys on warm surfaces:_ a small temperature contrast makes body text feel distinct without losing warmth. Pure black would feel harsh against cream; navy for body would compete with headings.

| Role           | Hex       | Used as                                              |
| -------------- | --------- | ---------------------------------------------------- |
| Ink            | `#1a202c` | Form control value text (default body is inherited)  |
| Body muted     | `#4a5568` | SpaceCard body copy, description italic              |
| UI muted       | `#718096` | Secondary metadata, labels, footnotes                |
| Placeholder    | `#a0aec0` | Empty-state secondary line                           |
| Inverse muted  | `#cbd5e0` | Muted text on navy bg (header subtitle, VisitProgress) |
| White          | `#ffffff` | Text on navy/orange fills                            |

### Semantic (SpaceSummary trust indicators)

_Why Tailwind defaults:_ status colours should look like "standard status colour" to anyone. Re-skinning green/yellow/red for a side project signals arbitrariness and breaks learned expectations.

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

## Layout & responsive

**Breakpoints.** Tailwind defaults, no custom: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px). `2xl` is not used anywhere — don't introduce it without cause.

**Container width.** Every top-level section (header, `<main>`, footer) uses `max-w-6xl` (~72rem / 1152px) with `mx-auto`. Any new top-level surface should use the same — never full-width, never narrower. The only other max is `sm:max-w-md` on the footer CTA cards (constrains the two side-by-side call-outs on desktop).

**Grid conventions.**

| Where                     | Breakpoint stack                                    |
| ------------------------- | --------------------------------------------------- |
| Space card grid           | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`         |
| Filter bar controls       | `grid-cols-2 md:grid-cols-4 lg:grid-cols-7`         |
| Footer CTA row            | `flex-col sm:flex-row`                              |

**Spacing scale.** Pure Tailwind (`p-*`, `gap-*`, `space-*`). No custom tokens. Common patterns:
- Page padding: `px-4 sm:px-6` on the header, `px-6` on `<main>` and footer.
- Toolbar gap: `gap-2 sm:gap-3`.
- Grid gap: `gap-6` on space cards, `gap-4` on filter inputs.

---

## Component conventions

**Extending the system.** Before adding a new shape, variant, or colour, run this test:

1. Does an existing token cover it? If yes, use it.
2. Is the new thing used in _more than one place_? If no, reconsider — one-offs belong in the component file, not the system.
3. Can you name it in brand terms (navy, cream-surface, …) rather than generic ones (blue-500, bg-light)? If no, it probably doesn't belong in the palette.
4. Does it have a clear _why_ you could add to this doc? If no, don't ship it.

These questions replace the bare "don't add a third radius without a reason" rule — they're what counts as a reason.

**Iconography (emoji) policy.** Toolbar controls lead with a single emoji to signal function at a glance. Rules when picking one:

- One glyph per control. No combos.
- **Literal over abstract** — `🗺️` for map, not `🌍`. `📋` for list, not `📝`. Prefer what the button *does*, not a metaphor.
- No flags, no skin-tone modifiers, no gendered glyphs.
- Reserved-meaning glyphs: ☀️/⛅/🌧️/❄️/🌫️ mean "weather-driven UI state" — don't reuse them for non-weather controls.
- If no emoji feels right, don't force one — leave the label alone rather than ship something off-brand.

Current inventory:

| Control         | Glyph  |
| --------------- | ------ |
| Filters toggle  | 🎛️     |
| List view       | 📋     |
| Map view        | 🗺️     |
| Open now chip   | ☀️ / ⛅ / 🌧️ / ❄️ / 🌫️ / ⏳ / ⏰ (weather-driven) |

Keep this convention for any new toolbar control — it's the main visual personality of the header.

**Touch targets.** Controls that can be tapped on mobile use `min-h-[44px]` (Apple HIG). Toolbar buttons currently inherit enough padding; OpenNowChip enforces it explicitly — do the same for any new chip.

**Button shape & padding.** Three recipes in use:

| Role                                 | Classes                                                           |
| ------------------------------------ | ----------------------------------------------------------------- |
| Primary toolbar chip (Filters, OpenNow) | `rounded-lg border-2 px-3 py-2 text-sm font-medium`               |
| Segmented toggle (List / Map)        | `rounded-lg border-2 px-4 py-2 text-sm font-medium` on the wrapper, inner `px-4 py-2` per segment |
| Inline tag / tertiary                | `rounded` (4px radius), padding scales with context               |

Don't introduce a third radius without running the "extending the system" test above.

**Button variants.** Three variants in use — keep to these:

| Variant    | Default                                           | Active / pressed                                  | Hover                          |
| ---------- | ------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| Navy chip  | `border-[#1a365d] bg-white text-[#1a365d]`        | `border-[#1a365d] bg-[#1a365d] text-white`        | `hover:bg-[#f5f0e6]` (inactive) / `hover:bg-[#15284a]` (active) |
| Orange CTA | `bg-[#ed8936] text-white` (no border)             | n/a (CTAs don't toggle)                           | `hover:bg-[#dd7826]`           |
| Ghost      | `bg-white text-[#1a365d]` (no border)             | n/a                                               | `hover:bg-[#f5f0e6]`           |

**Interactive states.** All clickable elements handle these five states (not all apply to every control):

- **Default** — resting look, documented above.
- **Hover** — always a bg swap, never transform/scale. Keep the footprint stable.
- **Active / pressed** — use `aria-pressed` on toggles; flip to the filled variant.
- **Focus** — orange ring (see below). Mandatory, never `outline-none` without replacement.
- **Disabled / loading** — `disabled:opacity-60 disabled:cursor-not-allowed` and/or a loading label prefix (see OpenNowChip's `⏳` state). Spinners are not in the system — use an emoji or text cue.

**Focus.** Active focus ring is orange: `focus-visible:ring-2 focus-visible:ring-[#ed8936] focus-visible:ring-offset-2 focus-visible:outline-none`. Use this pattern on all new interactive elements, not the browser default.

**Motion.** Three tokens, and no more:

| Token                                   | Where                                       |
| --------------------------------------- | ------------------------------------------- |
| `transition-colors` (Tailwind default ~150ms) | Toolbar buttons, links, form controls — bg/border swaps on hover/active |
| `transition-all duration-200`           | Card hover (border + shadow together) — `SpaceCard`, `SpaceSummary` |
| `transition-all duration-500 ease-out`  | `VisitProgress` bar fill only — slow, deliberate progress signal |

No `transform` transitions, no `scale`/`translate` on hover, no new easing curves. The paper-guide mood means motion is subtle and functional — never decorative.

**Card shape.** `rounded-lg border-2 border-[#e2d9c8]` on a white bg.
- **Default** — cream border, no shadow.
- **Hover** — border swaps to `#ed8936` (orange), `shadow-lg` lifts the card. Driven by `transition-all duration-200` (see Motion).
- No focus state on cards themselves — interactive elements *inside* cards carry the focus ring instead.

**Toolbar layout.** Horizontal controls use `flex flex-wrap items-center gap-2 sm:gap-3` so the toolbar wraps cleanly at 375px without horizontal scroll. Any new toolbar control should inherit this — don't add `flex-nowrap`.

---

## Accessibility baseline

**Contrast.** WCAG AA at the sizes used (16px+ body, 14px small). Specifically confirmed safe:

| Pair                             | Use                                | Status                                           |
| -------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Navy `#1a365d` on white          | Headings, body on cards            | AA / AAA                                         |
| White on navy `#1a365d`          | Header, filled toggle buttons      | AA / AAA                                         |
| Orange `#ed8936` on white        | CTA bg fill, focus ring            | AA for 14px+ bold and all 18px+                  |
| Body muted `#4a5568` on cream    | Card body copy                     | AA                                               |
| Orange `#ed8936` on cream `#f5f0e6` | **Accents only**                | Borderline — fails AA for body-sized text. Never for paragraphs. |

**Screen reader patterns.**

- Toggle buttons: `aria-pressed="true/false"` (see `OpenNowChip.vue`).
- Emoji-prefixed labels: the emoji itself is decoration — wrap in `<span aria-hidden="true">` so it doesn't get announced as "sun with face" before the actual label.
- Ambiguous or loading-state text: add `aria-label` with the full plain-English meaning.
- Live updates (filter counts, loaded states): today there are none — if you add any, use `aria-live="polite"`.

**Keyboard.** Every interactive element is tab-reachable in source order. Focus-visible ring (orange, see Component conventions) must remain visible — no `outline: none` without a replacement ring. Space/Enter toggles any `<button>`; keep semantic elements rather than `div`-with-click.

**Touch targets.** 44×44 CSS px minimum (Apple HIG). See `min-h-[44px]` rule in Component conventions.

**Reduced motion.** Not currently implemented. The `duration-200` card hover and `duration-500` progress fill will play for everyone regardless of `prefers-reduced-motion`. Low-priority debt — transitions are subtle — but should be fixed before adding any transform-based animations. See **Design debt**.

---

## Open questions

Design forks the project hasn't resolved. Not debt (debt has a plan) — these are genuine choices waiting for the situation that forces them.

- **Secondary accent colour.** Today orange is the only accent. If we ever need "info" or "neutral emphasis" that isn't a status signal, do we add a third brand hue or push harder on typography/weight? Push on type first.
- **Map marker styling.** `MapView.vue` uses Leaflet default markers. They don't match the palette. Options: (a) custom orange pin, (b) small cafe-emoji marker, (c) leave default until the map becomes a core surface. Currently (c).
- **Metadata icons vs. emoji policy.** `SpaceSummary` shows coloured dots and wifi-speed indicators — these are _semantic indicators_, not the emoji-button iconography. The doc's emoji policy doesn't apply to them. If we ever add true inline icons (Lucide / Heroicons), they'd be a new iconography category. Decide the icon library before shipping the first one.
- **Copy voice.** The brand mood paragraph implies a "printed-guide" voice but there's no rubric (sentence length, formality, Oxford comma, you-vs-we). Empty-state copy in `SpaceList.vue` has one style; the footer has another. Tolerable for now; codify if the surface area grows.
- **Dark mode.** Cross-referenced in Design debt. Open question: is cream-first identity still recognisable in dark mode, or does it need a full re-skin? Defer until user demand.

---

## Design debt

- **CSS custom properties in `style.css` are unused.** Components inline the same hex values in Tailwind bracket classes. Consequence: renaming a brand colour today requires editing ~7 component files instead of one variable.
  - Options:
    1. Migrate components to `bg-[var(--color-primary)]` — works but keeps the dual source of truth.
    2. Move to Tailwind 4 `@theme` block in `style.css` — registers real design tokens so classes like `bg-primary` / `text-accent` work natively. Recommended.
  - Scope: ~30 min, touches every component but only via find-and-replace.
- **Hues outside the seven named vars** (navy-hover, navy-track, cream-deep, warm-border, cool-border, cream-surface, orange-hover, ink, body-muted, placeholder) need names before we can promote to tokens — hence this doc.
- **No `prefers-reduced-motion` handling.** All transitions play regardless of OS setting. Low-priority for current motion set (subtle fades) but will become a real issue if we ever add transform/scale. Fix: add a `motion-reduce:transition-none` variant to the motion tokens in Component conventions. ~10 min.
- **Focus-ring rule not universally applied.** The prescribed `focus-visible:ring-2 focus-visible:ring-[#ed8936]` pattern lives only on `OpenNowChip.vue`. `FilterBar.vue` selects use `focus:border-[#ed8936] focus:outline-none` (no ring — relies on border colour change only); sort buttons have no focus treatment at all. Consequence: keyboard users on the filter panel get a weaker focus cue than on the chip. Fix: audit all interactive elements, apply the prescribed ring pattern. ~15 min.
- **No dark mode.** Cream-first palette doesn't currently map to a dark counterpart. Defer until there's a user ask.
