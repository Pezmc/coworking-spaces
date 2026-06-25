# TODOs

## Weekend 1: Open Now + Weather-aware filter chip ✅ Shipped

- [x] Vitest installed, `"test": "vitest"` script, `tests/` dir
- [x] `src/utils/hoursBasic.ts` — parses `openingHours`, normalizes Unicode dashes (`[–—−] → -`), exports `parseOpeningHours()` + `isOpen(schedule, date)`
- [x] `tests/hoursBasic.test.ts` — 18 tests: hyphen/en-dash/mixed, empty, closed days, overnight, week-wrap, real spaces.json samples
- [x] `src/utils/weather.ts` — open-meteo fetch for Leuven, sessionStorage 30-min cache, `useWeather()` singleton composable, never throws
- [x] `src/utils/weatherEmoji.ts` — condition + temp → ☀️/⛅/🌧️/❄️/🌫️/⏳/⏰
- [x] `src/components/OpenNowChip.vue` — `<button aria-pressed>` with loading/failed/active/focus states, `min-h-[44px]` touch target
- [x] `IFilterState` extended with `openNow: boolean`
- [x] App.vue: chip mounted in toolbar next to Filters/View toggle, URL syncs `?openNow=1`, wraps on mobile
- [x] Empty state: context-aware copy when `openNow` active with 0 matches (generic "nothing open" vs "nothing open + other filters")

## Weekend 2: Today's Picks (flip cards) ✅ Shipped

- [x] `src/utils/featuredSpaces.ts` — date-seeded picker, three spaces per day, deterministic across reloads, prefers verified spaces
- [x] `tests/featuredSpaces.test.ts` — 13 tests: determinism, verified bias, fallback when too few verified, edge cases
- [x] `src/components/FeaturedCard.vue` — CSS flip card, `[backface-visibility:hidden]` so screen readers don't double-read, `motion-reduce:transition-none` honored
- [x] `src/components/TodayView.vue` — three-card grid, refresh button to re-roll seed, hidden in map view
- [x] App.vue: TodayView mounted above the toolbar in list view only

## Weekend 3: Smart search AskBar ✅ Shipped

- [x] `src/utils/askParser.ts` — phrase dictionary (~140 phrases), longest-wins overlap, per-filter later-position-wins, chips in query order
- [x] `tests/askParser.test.ts` — 28 tests covering matching, overlap, punctuation, case, length guard
- [x] `src/components/AskBar.vue` — debounced "Thinking…" UI (550–850ms), removable chips, rotating placeholder examples
- [x] App.vue: AskBar mounted above the toolbar, emits `apply` patches into the filter ref
- [x] `lastAppliedKeys` mechanism resets filters when matching phrases leave the input
- [x] Pathological-input guard: `parseAsk` truncates queries to 1000 chars before scanning

## Descoped from original plan

- [ ] ~~`weatherFit: boolean` filter + weather-appropriate sort~~ — shipped as **emoji-only aliveness signal in chip label**. Revisit if users ask for it. If you bring it back: add a second boolean to IFilterState, rank spaces by `indoor vs outdoor` metadata (which doesn't exist in spaces.json yet — would require schema extension).

## Manual QA — confirmed on prod (2026-04-23 via /qa)

- [x] Toggle chip on desktop; count changes and URL gains `?openNow=1` — verified, 13 of 28 open at 09:32 Wed
- [x] Reload with `?openNow=1` — chip renders active (`aria-pressed=true`, dark bg)
- [x] 375px mobile: toolbar wraps cleanly, no horizontal scroll (`scrollWidth === clientWidth === 375`)
- [x] Keyboard: focus ring visible on chip and AskBar input
- [x] Screen-reader semantics: chip exposes `aria-label="Open now, currently 10 degrees sunny"` + `aria-pressed`
- [x] Weather cache: only one `api.open-meteo.com` request per session (verified in network log)

Skipped — low ROI without a user-reported issue:

- Empty-state copy when Leuven is quiet (requires mocking `Date` to 03:00 Mon)
- Weather-API failure fallback (requires throttling network to offline)

## Design debt

- [x] Extract implicit palette into `DESIGN.md` — shipped. Doc captures 22 named hues, typography, component conventions, a11y baseline.
- [x] 7-pass design-system review of `DESIGN.md` — shipped. Added TOC + "How to use", Layout & responsive section (breakpoints, container, grids, spacing), iconography policy, deviation rubric, full state/variant tables, three-token motion system, explicit contrast pairs, screen-reader patterns, Open questions section. Final rating: 8.5/10 avg across 7 passes.
- [x] Migrate components from `bg-[#hex]` to Tailwind 4 `@theme` tokens — shipped. `src/style.css` defines 14 named tokens (`primary`, `accent`, `cream`, `cream-panel`, `cream-deep`, `warm`, `cool`, `ink`, `body`, `muted`, `faint`, plus brand hovers and `primary-track`). All 11 components migrated.
- [x] **Apply focus-ring rule uniformly.** Shipped. `FilterBar` selects + sort buttons + Clear-all, App-level Filter/View toggles + footer CTAs + footer text links, `SpaceCard` collapsible toggle, `SpaceSummary` visit-tick + Help-verify links + address link, `VisitProgress` undo button, and the AskBar input all carry `focus-visible:ring-2 focus-visible:ring-accent` (offset-2 except where parent is `overflow-hidden`, which uses `ring-inset`).
- [x] **Add `motion-reduce:transition-none` to motion tokens.** Shipped. Every `transition-(colors|all|transform|opacity)` instance is paired with `motion-reduce:transition-none` so `prefers-reduced-motion` cuts animations to zero.

## Explicitly not doing (yet)

- ~~Three flip cards / TodayView~~ — shipped Weekend 2
- ~~LLM blurbs (Groq / templates)~~ — would require a backend, deferred indefinitely
- ~~Ask-a-Friend chat~~ — backend dependency, deferred
- ~~Fuse.js (fuzzy space-name search)~~ — AskBar covers the need; revisit if exact-name search misses
- ~~SunCalc, novelty cache~~ — deferred
- ~~`/` vs `/all` routing split~~ — current single-page layout is fine
- ~~Two separate chips (open + weather)~~ — one compound chip instead

## Future ideas (not committed)

- **Novelty cache for Today's Picks** — track recently-shown spaces in `localStorage` so the daily roll doesn't repeat last week's picks. Worth building if users mention seeing the same cards every day.
- **AskBar/FilterBar conflict resolver** — currently if a user manually toggles a filter while a matching phrase still sits in the Ask input, the next debounced re-parse silently re-applies the Ask value. Add `AskBar` watching the parent `filters` ref and skip re-emitting filters whose value was externally changed. Only worth it if a user reports confusion.

### Known limitations surfaced shipping the open-at-time filter (all pre-existing)

- **Overnight hours after midnight** — `hoursBasic.ts` clamps a close-after-midnight range (e.g. Café Entrepot `Mon-Sat 09:30-01:00`) to end at midnight, so an `openAt`/`openNow` query for 00:30 wrongly excludes it. Affects "Open now" too. The time chip only offers 06:00–23:00 so the UI path can't reach it, but the URL/`?openAt=` and Ask-bar paths can. Fix needs a day-spillover model in `parseOpeningHours`.
- **Parenthetical notes break hours parsing** — a non-conforming `openingHours` like `"Sat-Sun closed (except occasional Sunday brunch)"` (bar Stan) makes `parseOpeningHours` return `null`, so the venue is silently dropped from every time filter even on its valid weekday hours. Fix: clean the data string, or let the parser tolerate a trailing parenthetical.
- **Reactive clock for time filters** — `matchesFilters` and the list/map computeds capture `new Date()` at evaluation time with no live tick, so a page left open across midnight shows stale "open now"/"open at" results until some other reactive change fires. A shared `useNow()` (vueuse) ticking each minute would fix it.
