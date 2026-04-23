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

## Manual QA — confirm before closing

- [ ] Toggle chip on desktop; verify count changes and URL gains `?openNow=1`
- [ ] Reload with `?openNow=1` — chip renders active
- [ ] 375px mobile (Safari/Chrome devtools): toolbar wraps cleanly, no horizontal scroll
- [ ] Keyboard: Tab to chip, Space/Enter toggles, focus ring visible
- [ ] VoiceOver / TalkBack: chip announces "Open now, pressed/not pressed" with weather context
- [ ] Empty-state copy shown when Leuven is quiet (e.g., open devtools, mock `Date` to 03:00 Mon)
- [ ] Weather failure: throttle network to offline in devtools, hard refresh — chip falls back to plain "Open now" label (no weather)
- [ ] Weather cache: toggle chip multiple times in a session — Network tab shows only one `api.open-meteo.com` request

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
