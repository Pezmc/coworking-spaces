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

## Design debt (not blocking ship)

- [x] Extract implicit palette into `DESIGN.md` — shipped. Doc captures 22 named hues, typography, component conventions, a11y baseline.
- [ ] Migrate components from `bg-[#hex]` to Tailwind 4 `@theme` tokens (`bg-primary`, `text-accent`, etc.) — see DESIGN.md "Design debt" section. ~30 min, touches ~7 files via find-and-replace.

## Explicitly not doing (yet)

- ~~Three flip cards / TodayView~~
- ~~LLM blurbs (Groq / templates)~~
- ~~Ask-a-Friend chat~~
- ~~Fuse.js, SunCalc, novelty cache~~
- ~~`/` vs `/all` routing split~~
- ~~Two separate chips (open + weather)~~ — one compound chip instead

Revisit flip cards only after shipping the chip and seeing whether it feels alive.
