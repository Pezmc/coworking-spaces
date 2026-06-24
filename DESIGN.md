# Design system

The canonical reference for visual language on Leuven Coworking Cafes. Keep this doc in sync when palette, type, or component-level conventions change.

Brand mood: _neighbourhood cafe directory_, not tech product. Warm paper-cream backgrounds, navy for editorial display, **rust** for action and active state. Fraunces for display, Source Serif 4 italic for entry descriptions, IBM Plex Sans for UI chrome, IBM Plex Mono for date stamps and small data. Lucide icons replace emoji on UI metadata; emoji is reserved for the weather chip (where the glyph carries weather meaning).

Page structure is two distinct sections. **Today's picks** is a discovery aid (3 daily-rotating cards that flip to reveal). **All spots** is the main content (filterable list, switchable to map). The List/Map toggle is a prominent segmented control attached to the All-spots header, not buried in the filter row. The footer ends with a single asymmetric marketing callout for the Leuven coworking group (the conversion CTA), plus a quiet inline contribution link.

## How to use this doc

- **Adding a new colour?** Check **Palette** first. If it's not there, either it maps to an existing hue (use that) or it's a new token — add a row here before you ship.
- **Building a new component?** Read **Component conventions** — button shape, focus ring, touch-target minimum, and emoji-prefix rule are all prescriptive.
- **Auditing contrast or keyboard nav?** See **Accessibility baseline**.
- **Reaching for a hex code in a class?** Don't. The palette lives as `@theme` tokens in `src/style.css`. Use `bg-primary`, `text-accent`, `border-warm`, etc. New hexes need a token row above before they ship.

Rules in this doc are **prescriptive** unless marked otherwise. Anything under "Design debt" is a known gap with a plan.

## Contents

1. [Palette](#palette) — brand / surfaces / text / semantic hues, with why each exists
2. [Typography](#typography) — four families: Fraunces / Source Serif 4 / IBM Plex Sans / IBM Plex Mono
3. [Layout & responsive](#layout--responsive) — breakpoints, container, grids, spacing
4. [Component conventions](#component-conventions) — extending the system, Lucide iconography, variants, states, motion, card shapes, toolbar layout
5. [Accessibility baseline](#accessibility-baseline) — contrast pairs, aria patterns, keyboard, reduced motion
6. [AskBar pattern](#askbar-pattern) — natural-language filter input
7. [VisitProgress pattern](#visitprogress-pattern) — bottom bar, neutral count, share link
8. [Marketing callout pattern](#marketing-callout-pattern) — coworking group conversion CTA
9. [Map markers pattern](#map-markers-pattern) — custom rust pins, popup, mobile fullscreen
10. [Open questions](#open-questions) — design forks we haven't picked yet
11. [Design debt](#design-debt) — known gaps with a plan to close them

---

## Palette

Scope is deliberately narrow: **two brand hues** (navy for editorial display, rust for action), **warm neutrals** for surfaces (paper cream + warm rules), **cool greys** for text, **moss** as a single tertiary for the "verified recently" dot, and **Tailwind defaults** for status. Any new hex outside these groups is a red flag — first ask whether an existing token covers it.

### Brand

_Why these two:_ navy reads as "editorial press / guide," rust is the only true accent and is reserved for active state, focus rings, calls-to-action, and the marketing callout border. The rust shift from `#ed8936` to `#c75f1c` was made to read less "Halloween candy / SaaS dashboard" and more "Leuven roof tiles / printed brick." Don't introduce a secondary accent.

| Role           | Hex       | Used as                                                   |
| -------------- | --------- | --------------------------------------------------------- |
| Navy (primary) | `#1a365d` | Page title, entry names, segmented-toggle active fill, popup borders, body headings |
| Navy hover     | `#15284a` | Hover on filled navy controls (segmented toggle, OpenNowChip) |
| Navy track     | `#2d4a7c` | Progress bar track behind the rust fill (legacy; VisitProgress now uses rule-soft) |
| Rust (accent)  | `#c75f1c` | Active filter underlines, focus rings, marketing callout border + button, "Tip" label, slot labels on picks, tab/list active state, map pin |
| Rust hover     | `#a64f10` | Hover on rust CTAs                                        |
| Moss           | `#5C6B3C` | "Verified recently" dot next to entry names. Tertiary only — never on chrome. |

### Surfaces

_Why warm neutrals:_ cream evokes printed-guide / book paper and separates us from the flat-white tech-product default. Never substitute a cool grey.

| Role             | Hex       | Used as                                                                  |
| ---------------- | --------- | ------------------------------------------------------------------------ |
| Paper            | `#fffaf0` | Page background, VisitProgress bar bg, map popup bg, segmented toggle inactive bg |
| Paper deep       | `#faf5eb` | Marketing callout background, list-row hover tint, FilterBar panel       |
| Rule             | `#d8c9ad` | Section dividers, today's-picks card border, masthead bottom rule, marketing callout border (when not rust), VisitProgress top border |
| Rule soft        | `#ede2cc` | Hairline between list entries, hairline above pills/flip-hint inside pick cards, `<hr>` decoration |

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

Four families, four roles. Loaded via Google Fonts link in `index.html`; declared as CSS custom properties in `src/style.css`. Each role is prescriptive — don't reach for a different family without running the "extending the system" test below.

| Token   | Family                                     | Weights        | Role                                                                                   |
| ------- | ------------------------------------------ | -------------- | -------------------------------------------------------------------------------------- |
| Display | `Fraunces`, Georgia, serif                 | 600, 700       | Page title, today's-pick names, list entry names, section headers (`<h2>`/`<h3>`)      |
| Body    | `Source Serif 4`, Georgia, serif           | 400, italic 400 | Entry descriptions (italic), pick-card hooks (italic), empty-state title (italic), the `.num` in VisitProgress (italic). Default `<body>` font. |
| UI      | `IBM Plex Sans`, system-ui, sans-serif     | 400, 500       | Filter tab labels, pill metadata, segmented toggle, button labels, footer copy, marketing CTA, AskBar prefix label, slot labels (small caps via `text-transform: uppercase` + `letter-spacing: 0.16em`). Picks the visual chrome of the directory. |
| Mono    | `IBM Plex Mono`, ui-monospace, monospace   | 400, 500       | Last-visited stamps, footer data line ("47 cafés · last updated …"), "Leuven · centrum" map label, map list-item numbers, AskBar `or describe what you want` caption, color-swatch hex labels. Anything that should read as "data, not prose." |

Scale is pure Tailwind (`text-xs`/`sm`/`base`/`lg`/`xl`/`2xl`/`4xl`/`5xl`). No custom type ramp. Page title scales `text-2xl sm:text-4xl md:text-5xl`. Today's-pick name is `text-2xl` (Fraunces 700). List entry name is `text-xl` (Fraunces 600).

**Why these specifically.** Fraunces over Playfair Display: Playfair has converged on AI-design output as the default literary serif; Fraunces has more character (variable axes, optical sizing, soft-vs-sharp toggle) and reads less templated. Source Serif 4 over Crimson Pro for descriptions: Source Serif's italic carries the "field-guide footnote" voice; Crimson Pro's body felt magazine-y on a dense list. IBM Plex Sans for UI: the visual feel is "Belgian rail timetable / printed-guide caption" — utilitarian without being Inter-default. IBM Plex Mono for data: same family as the UI sans, so the visual rhythm carries.

**Banned: `system-ui`/`-apple-system` as the primary display or body font.** It's the AI-design "I gave up on typography" signal.

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

**Iconography.** Lucide is the chosen library. All UI metadata icons (pills, filter tabs, segmented toggle, map marker references) use Lucide via inline SVG `<symbol>` definitions in `App.vue` (or a dedicated `IconSet.vue`), referenced by `<svg class="icon"><use href="#i-name"/></svg>`. Stroke width 1.6, `fill: none`, `stroke: currentColor` so icons inherit the surrounding text color. Default size 14×14 (`.icon`); 12×12 inside pills (`.icon-sm`).

Why Lucide over emoji on UI chrome: emoji rendered platform-by-platform vary in weight, color and metaphor (Apple's 🎛️ is not Google's 🎛️). Mixing eight emoji prefixes is the loudest "AI-built" visual signal we ship. Lucide gives one consistent stroke, one consistent metaphor, one consistent color.

Inventory (codify before adding new):

| Symbol id        | Where                                                        |
| ---------------- | ------------------------------------------------------------ |
| `i-sun`          | "Open now" filter tab                                        |
| `i-moon`         | "Late" filter tab                                            |
| `i-volume-quiet` | Quiet noise level (filter tab + entry meta + pick pill)      |
| `i-volume-mid`   | Moderate noise level                                         |
| `i-volume-loud`  | Buzzy noise level                                            |
| `i-wifi`         | Wifi speed (filter tab + entry meta + pick pill)             |
| `i-plug`         | Outlets (filter tab + entry meta + pick pill)                |
| `i-snowflake`    | AC (in entry meta where present)                             |
| `i-utensils`     | Food / drinks (entry meta + pick pill)                       |
| `i-armchair`     | Seating type (entry meta where used)                         |
| `i-clock`        | Open / closed status text in entry meta                      |
| `i-list`         | List view in segmented toggle                                |
| `i-map-pin`      | Map view in segmented toggle, map markers (in CSS), Today's-pick city label |
| `i-check`        | VisitProgress count icon                                     |

**Emoji is reserved for the weather chip only.** ☀️/⛅/🌧️/❄️/🌫️/⏳/⏰ on `OpenNowChip` are weather-driven UI state — the glyph carries the meaning. Everywhere else, use Lucide. If no Lucide icon fits, ship the label alone rather than reach for an emoji.

**Touch targets.** Controls that can be tapped on mobile use `min-h-[44px]` (Apple HIG). Toolbar buttons currently inherit enough padding; OpenNowChip enforces it explicitly — do the same for any new chip.

**Button & control shapes.** The system is now sharp-cornered. **Default radius is 0.** The previous `rounded-lg border-2` everywhere was the loudest "AI-bubbly" shape signal in the old design. Recipes now in use:

| Role                                  | Shape                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Filter tab (text + Lucide icon)       | No box — text only, with a 2px rust underline on `aria-selected="true"`. Padding `px-3 py-2`. Hairline `1px` rule on either side via flexbox dividers. |
| Segmented toggle (List / Map)         | Sharp-cornered inflex container, 1px navy border. Inner segments share a 1px navy left-divider. Active segment fills navy with paper text. Inactive is white bg. Padding `px-4 py-2`. |
| Marketing CTA button (rust)           | Sharp-cornered, 1px rust border, rust fill, paper text. Padding `px-4 py-2.5`. Hover darkens to `--rust-hover`. Inline-flex with arrow icon at 16px. |
| AskBar input                          | No box. 1.5px rule underline (turns rust on focus-within). No padding-x. Padding `pt-1 pb-2.5`. |
| List entry (in `<SpaceList>`)         | No box. Hairline `1px` `--rule-soft` border-bottom between rows. `py-5`. Hover tints background `rgba(199,95,28,0.025)`. |
| Today's-pick card                     | 1px `--rule` border (no `rounded-lg`). Hover swaps border to rust. Photo on top (desktop) or left (mobile). |
| Marketing callout                     | 1px rust border. Asymmetric grid (photo + body). "A Note" tag in rust ribbon at top-right. |
| OpenNowChip / VisitProgress share link | Quiet text with rust underline. Sharp corners on any container. |

The only places radius appears at all: the moss/rust circles for "verified" dots and map pins (`border-radius: 50%`). Otherwise the page is rules-and-rectangles.

**Button variants.** Four variants — keep to these:

| Variant            | Default                                         | Active / pressed                                  | Hover                                |
| ------------------ | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| Filter tab         | `text-muted bg-transparent`, no border          | `text-ink border-b-2 border-rust font-medium`     | `text-ink`                           |
| Segmented seg      | `bg-white text-ink border-l border-navy` (or `border-y`/`border-r` for endcaps) | `bg-navy text-paper`                              | `bg-paper-deep` (when not active)    |
| Rust CTA (marketing) | `bg-rust border-rust text-paper`              | n/a                                               | `bg-rust-hover border-rust-hover`    |
| Quiet text link    | `text-ink border-b border-rust`                 | n/a                                               | `text-rust`                          |

**Interactive states.** All clickable elements handle these five states (not all apply to every control):

- **Default** — resting look, documented above.
- **Hover** — always a bg swap, never transform/scale. Keep the footprint stable.
- **Active / pressed** — use `aria-pressed` on toggles; flip to the filled variant.
- **Focus** — orange ring (see below). Mandatory, never `outline-none` without replacement.
- **Disabled / loading** — `disabled:opacity-60 disabled:cursor-not-allowed` and/or a loading label prefix (see OpenNowChip's `⏳` state). Spinners are not in the system — use an emoji or text cue.

**Focus.** Active focus ring is rust: `focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:outline-none`. Use this pattern on all new interactive elements, not the browser default. Tab targets that already use a rust underline as their active state still get a focus ring (offset keeps the ring legible against the underline).

**Motion.** Three tokens, and no more:

| Token                                   | Where                                       |
| --------------------------------------- | ------------------------------------------- |
| `transition-colors` (Tailwind default ~150ms) | Toolbar buttons, links, form controls — bg/border swaps on hover/active |
| `transition-all duration-200`           | Card hover (border + shadow together) — `SpaceCard`, `SpaceSummary` |
| `transition-all duration-500 ease-out`  | `VisitProgress` bar fill only — slow, deliberate progress signal |

No `transform` transitions, no `scale`/`translate` on hover, no new easing curves. The paper-guide mood means motion is subtle and functional — never decorative.

**Card shape.** Three card shapes, prescriptive:

1. **List entry** (`<SpaceCard>` in the All-spots list). NOT a card — a row. No border, no rounded corners, no shadow. `border-bottom: 1px solid var(--color-rule-soft)`. Padding `py-5`. Two-column grid on desktop (88px photo + content + right-aligned mono date stamp); two-column on mobile (64px photo + content; date stamp moves to a third row with a dashed-rule top).
2. **Today's-pick card** (`<FeaturedCard>`). 1px `--color-rule` solid border. Sharp corners. Photo strip on top (130px desktop) → `<body>` with slot label / name / hook / description / pills / flip-hint. Hover swaps border to rust. Mobile: grid-cols-`92px 1fr`, photo on left, body shrinks (description + hook hidden).
3. **Marketing callout** (`<CoworkingGroupCallout>`). 1px rust border, `--color-paper-deep` bg. Asymmetric grid: photo (280px desktop) + body. "A Note" rust ribbon at top-right. Body has eyebrow / Fraunces headline (700 + italic em on a phrase) / Source Serif description / rust CTA button row. Mobile stacks photo on top.

No focus state on the cards themselves — interactive elements *inside* cards carry the focus ring instead.

**Toolbar layout.** The header is now a multi-row composition:

- **Section header row** for "All spots": `flex items-baseline justify-between` with the `<h2>All spots <span class="count">47</span></h2>` on the left and the `<view-segmented>` toggle on the right. On mobile (≤700px), `flex-direction: column-reverse` so the segmented toggle sits full-width above the heading.
- **Filter tabs row**: `flex flex-wrap items-center gap-0` with text-tab buttons separated by hairline divider spans. No `flex-nowrap`.
- **AskBar row**: stacked. `<label class="ask-label">` on top in mono; underlined `<input>` below; matched-chips row below the input when there are matches.

The Today's-picks header is a separate, subordinate composition: italic Fraunces 600 `<h2>Today's picks</h2>` + mono `picks-meta` ("3 of 47 · rotates daily") on the right. Visually distinct from the main section header so users don't conflate the daily picks with the filterable list.

---

## Accessibility baseline

**Contrast.** WCAG AA at the sizes used (16px+ body, 14px small). Specifically confirmed safe:

| Pair                             | Use                                | Status                                           |
| -------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Navy `#1a365d` on paper          | Page title, entry names, popup borders | AA / AAA                                       |
| Paper on navy `#1a365d`          | Filled segmented-toggle, OpenNowChip active | AA / AAA                                  |
| Rust `#c75f1c` on paper          | CTA bg fill, focus ring, "Tip" label, slot labels | AA at 14px+ regular and all 16px+ (the rust shift from #ed8936 improved contrast — paper text on rust now passes at body sizes) |
| Paper on rust                    | Marketing CTA button text          | AA / AAA                                         |
| Body muted `#4a5568` on paper    | Card body copy, list-entry desc    | AA                                               |
| Moss `#5C6B3C` 7px dot on paper  | Verified-recently dot              | Decoration only, not text. AA equivalent N/A.    |

**Screen reader patterns.**

- Toggle buttons: `aria-pressed="true/false"` (see `OpenNowChip.vue`).
- Emoji-prefixed labels: the emoji itself is decoration — wrap in `<span aria-hidden="true">` so it doesn't get announced as "sun with face" before the actual label.
- Ambiguous or loading-state text: add `aria-label` with the full plain-English meaning.
- Live updates (filter counts, loaded states): today there are none — if you add any, use `aria-live="polite"`.

**Keyboard.** Every interactive element is tab-reachable in source order. Focus-visible ring (orange, see Component conventions) must remain visible — no `outline: none` without a replacement ring. Space/Enter toggles any `<button>`; keep semantic elements rather than `div`-with-click.

**Touch targets.** 44×44 CSS px minimum (Apple HIG). See `min-h-[44px]` rule in Component conventions.

**Reduced motion.** Honored. Every `transition-*` utility in components is paired with `motion-reduce:transition-none`, and the bouncing thinking dots in `AskBar` use `motion-reduce:animate-none`. Add the same pairing to any new transition or animation you introduce.

---

## AskBar pattern

Natural-language input that maps phrases to filter state via the regex parser in `src/utils/askParser.ts`. Visual contract:

- Small mono caption above the input: `or describe what you want` (lowercase, `IBM Plex Mono` 10px, letter-spacing `0.08em`, `text-faint`). Caption sits on its own line so it can never wrap into the input.
- Input is borderless except for a 1.5px `--rule` underline that turns rust on `:focus-within`.
- Placeholder is **rotating** through the existing `EXAMPLES` array every 4s (preserved from the old AskBar). Cycle stops while the input has a value.
- Empty input shows just the underline. As the parser matches, a `Matched` row appears below in `IBM Plex Sans` 12px with rust-underlined text-buttons (each is removable; click → strips the matched phrase from the input).
- **No sparkle, no bouncing dots, no "Thinking..." animation.** The parser is fast enough that you don't need to dramatize the wait. If a future parse is genuinely slow, replace with a single quiet mono caption (`Checking the guide…`), not a dots-bounce.

## VisitProgress pattern

Sticky bottom bar that appears once a user has marked any space visited. Visual contract:

- Background `--paper`, 1px `--rule` top border (NOT navy — the navy bar from the old design read as dashboard chrome).
- Layout: rust `i-check` icon → `<span class="vp-text">` (Fraunces italic 600 16px count + Plex Sans "of 47 visited" muted) → 3px tall `--rule-soft` progress rule with rust fill → mono percentage right-aligned → rust-underlined "copy progress link" share action.
- **Copy is neutral.** No "True coworking champion!", no "🎉 You're a Leuven coworking pro! 🌟", no trophy/checkmark emoji. Just the count and the share. Gamification copy was the loudest AI tell on the old VisitProgress; resist re-adding.
- Mobile: `flex-wrap`, the progress rule moves to its own row below the count + percentage + share link.

## Marketing callout pattern

The Leuven coworking group invitation. **Site-wide single instance.** Renders between the All-spots list and the footer, NOT in the footer itself. Visual contract:

- Asymmetric grid: 280px photo on the left, body on the right (mobile stacks photo on top).
- 1px rust border. `--paper-deep` background to differentiate from the page paper.
- "A Note" tag in a rust ribbon at top-right (Plex Sans 9.5px tracked uppercase paper text on rust fill, 4px×10px padding).
- Eyebrow: Plex Sans 10px tracked uppercase rust ("Leuven coworking group").
- Headline: Fraunces 700 28px navy, with one italicized phrase (e.g. *"Working with people is better."*) for emphasis without using bold or a second color.
- Body: Source Serif 4 15px on `--ink`, max 460px wide.
- CTA row: rust-filled button (`Join the group →` with Lucide arrow at 16px / stroke 2) + mono URL caption to its right.

The ribbon + asymmetric layout makes this visually distinct from list rows and from the footer, which is the point — the site is a marketing funnel for the coworking group, and the conversion CTA needs to be findable. Symmetric dual-card footers are the AI-default and bury the conversion next to the contribution.

## Map markers pattern

Custom Leaflet markers (replacing the default blue droplets). Implementation: `L.divIcon` with HTML, or SVG marker classes, styled with these tokens.

| Marker          | Treatment                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Default pin     | 22×22 circle. `bg-rust`, 2px `--paper` border, 6×6 paper dot center, soft drop shadow `0 1px 3px rgba(0,0,0,0.25)`. |
| Active pin      | 28×28 same circle + 3px outer rust ring `box-shadow: 0 0 0 3px rgba(199,95,28,0.25)`. |
| Cluster pin     | 34×34 same shape, count rendered inside in Plex Sans 600 11px paper. No center dot. |
| Popup           | 1px navy hairline border, paper bg, navy diamond pointer at the bottom. Inside: mono "NN · Name" (rust caption), Fraunces 600 17px navy name, mono small-caps meta strip, rust-underlined "Show details →" link. |
| Tile layer      | Light grayscale OSM via CARTO Positron (`light_all`). Avoid color-saturated default OSM tiles — they fight the cream paper feel. |

Mobile: list panel hidden (`display: none`), the map takes `min-height: 460px` and `height: 70vh`. Spec also: a bottom sheet pattern for the selected pin's details on mobile (defer until building).

## Open questions

Design forks the project hasn't resolved. Not debt (debt has a plan) — these are genuine choices waiting for the situation that forces them.

- **Photos per space.** The new design includes photo placeholders on Today's-pick cards and entry rows. Real photos require either (a) adding an `imageUrl` field to `ICoworkingSpace` and sourcing photos manually, (b) generating deterministic gradient placeholders from the space name (current preview behavior), or (c) using a single hand-photo per neighbourhood as a fallback. Decide before shipping the new card layout.
- **Map mobile bottom-sheet.** When a user taps a map pin on mobile, do we open a full-screen popup, a bottom sheet (~40% height), or transition to the entry's section in the list view? Bottom sheet feels right; defer until building.
- **Copy voice rubric.** The brand mood implies a "field-guide" voice but there's still no rubric (sentence length, you-vs-we, oxford comma, capitalization of meta strips). The new design depersonalizes (`I → no first person`, `Pez's note → Tip`, neutral footer stamp). Codify the rubric before the surface area grows further.
- **Dark mode.** Open question: is cream-first identity still recognisable in dark mode, or does it need a full re-skin? Defer until user demand.

---

## Design debt

- ~~**CSS custom properties in `style.css` are unused.**~~ Resolved. `style.css` now declares Tailwind 4 `@theme` tokens. Components use `bg-paper`, `text-rust`, `border-rule`, etc. No more `[#hex]` bracket classes anywhere in `src/`.
- ~~**No `prefers-reduced-motion` handling.**~~ Resolved. Every `transition-(colors|all|transform|opacity)` utility is paired with `motion-reduce:transition-none`. The bouncing dots in `AskBar` are gone (replaced with rotating placeholder); placeholder rotation respects `prefers-reduced-motion: reduce` by pausing the cycle.
- ~~**Focus-ring rule not universally applied.**~~ Resolved. The prescribed `focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:outline-none` pattern is applied to every interactive element. Two known exceptions, both deliberate: (a) `seg` buttons inside the segmented View toggle use `focus-visible:ring-inset`; (b) the rust-underline tab style relies on the underline + offset for focus visibility (the ring offset keeps both legible).
- **Tailwind token rename migration.** This redesign renames `accent → rust`, `primary → navy`, `warm → rule`, `cream → paper`, etc. After implementation, audit `src/` for any remaining `bg-accent`, `text-primary`, `border-warm` classes and update. Bracket classes (`[#ed8936]`, `[#1a365d]`) are forbidden by the existing rule and should already be absent — verify.
- **Photos.** The new layout reserves space for cafe photos on Today's-pick cards and (optionally) entry rows. Until photos are sourced, both fall back to a deterministic neutral gradient. Track the gap.
- **Map markers in MapView.vue still use Leaflet defaults.** Migration to custom rust pins (per the Map markers pattern above) is part of this redesign rollout.
- **No dark mode.** Cream-first palette doesn't currently map to a dark counterpart. Defer until there's a user ask.
