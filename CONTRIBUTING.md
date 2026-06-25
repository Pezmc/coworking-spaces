# Contributing a Coworking Space

Thanks for helping document work-friendly spots! This guide explains how to submit a new space and what each category means.

## How to Submit

### Option 1: Open an Issue (Easiest)

[**Open a new space suggestion →**](https://github.com/Pezmc/Coworking-Leuven/issues/new?template=suggest-space.yml)

Just fill out the template and we'll add it for you!

### Option 2: Submit a Pull Request

1. Fork this repository
2. Add your space to `src/data/spaces.json`
3. Open a pull request

## Field Reference

### Basic Info

| Field | Description |
|-------|-------------|
| `name` | The venue's name (required, used to generate unique ID) |
| `address` | Full address (required, e.g., "Tiensestraat 38, 3000 Leuven") |
| `googleMapsUrl` | Direct link to Google Maps (required) |
| `coordinates` | GPS coordinates `{ "lat": number, "lng": number }` (required) |
| `description` | General description of the space (shows on card preview) |
| `hours` | Structured opening hours, or `null` if unknown (see below) |
| `hoursNote` | Optional free-text caveat that doesn't fit the grid (e.g. "Occasional Sunday brunch") |

#### Opening hours (`hours`)

An object with all seven weekday keys (`monday`…`sunday`); each is an array of
`{ "open": "HH:MM", "close": "HH:MM" }` intervals in 24-hour time. An empty
array `[]` means closed that day. Use `null` for the whole field when hours are
unknown. The human-readable string shown on the card is generated from this — no
need to write it out. Two rules worth knowing:

- **After midnight:** set `close` to the post-midnight time (e.g. `"01:00"`) and
  it is attributed to the next morning. Use `"24:00"` for "open until midnight".
- **Split shifts:** add more than one interval to a day, e.g.
  `[{ "open": "09:00", "close": "12:00" }, { "open": "14:00", "close": "18:00" }]`.

> **Unknown values:** any standardized field below may be JSON `null` when the
> attribute has not been researched yet — the same convention `hours` uses, and
> the card shows "Unknown". Write `null`, not the string `"unknown"`, or the data
> check rejects it. `foodAndDrinkAvailability` is the exception: it is always one
> of its listed values.

### Noise Level & Atmosphere

| Value | Description |
|-------|-------------|
| `quiet` | Library-like atmosphere – minimal background noise, whispered conversations |
| `medium` | Café ambiance – background chatter and music at moderate volume |
| `loud` | Lively environment – loud music, busy conversations, energetic vibe |
| `null` | Noise level has not been assessed yet |

- **atmosphereNotes**: Describe the vibe/feeling/noise level in more detail

### WiFi Speed

| Value | Description |
|-------|-------------|
| `slow` | Under 25 Mbps – suitable for browsing and email |
| `medium` | 25–100 Mbps – good for video calls and general work |
| `fast` | Over 100 Mbps – great for large uploads and multiple devices |
| `null` | WiFi speed has not been tested yet |

- **wifiNotes**: Actual speed test results if available

**Tip:** Use [fast.com](https://fast.com) or [speedtest.net](https://speedtest.net) to measure.

### Air Conditioning & Climate

| Value | Description |
|-------|-------------|
| `yes` | Air conditioning available – stays cool in summer |
| `no` | No air conditioning – may be warm on hot days |
| `null` | Climate control has not been checked yet |

- **climateNotes**: AC quality, heating, temperature notes

### Food & Drink Availability

| Value | Description |
|-------|-------------|
| `none` | No food available – drinks only |
| `light` | Snacks and light bites – pastries, sandwiches, simple items |
| `full` | Full menu – hot meals, substantial food options |

- **foodNotes**: What food is available and when
- **drinkNotes**: What beverages are available

### Seating Type

| Value | Description |
|-------|-------------|
| `individual` | Mostly 1–2 person tables – best for solo work |
| `mixed` | Variety of table sizes – options for both solo and group work |
| `group` | Primarily large tables (4+ people) – communal seating |
| `null` | Seating layout has not been recorded yet |

- **seatingNotes**: Physical layout, table arrangements

### Outlet Availability

| Value | Description |
|-------|-------------|
| `few` | 1–2 outlets in the space – arrive early to claim one |
| `some` | Several outlets available – most seats have access |
| `many` | Outlets at every table or seat – no worries about power |
| `null` | Outlet availability has not been checked yet |

- **outletNotes**: Details about power outlet locations and availability

## Example Entry

```json
{
  "name": "Example Café",
  "address": "Naamsestraat 49, 3000 Leuven",
  "googleMapsUrl": "https://maps.google.com/?q=Example+Cafe+Leuven",
  "coordinates": { "lat": 50.8798, "lng": 4.7005 },
  "noiseLevel": "medium",
  "wifiSpeed": "fast",
  "hasAC": "yes",
  "foodAndDrinkAvailability": "light",
  "seatingType": "mixed",
  "hasOutlets": "some",
  "description": "Staff are laptop-friendly, no time limits. Great natural light.",
  "hours": {
    "monday": [{ "open": "08:30", "close": "18:00" }],
    "tuesday": [{ "open": "08:30", "close": "18:00" }],
    "wednesday": [{ "open": "08:30", "close": "18:00" }],
    "thursday": [{ "open": "08:30", "close": "18:00" }],
    "friday": [{ "open": "08:30", "close": "18:00" }],
    "saturday": [{ "open": "09:00", "close": "17:00" }],
    "sunday": []
  },
  "atmosphereNotes": "Bright and airy with good natural light. Chill music, gets busier around lunch",
  "wifiNotes": "150 Mbps down, 50 Mbps up",
  "climateNotes": "Good AC, can get chilly near the vents",
  "foodNotes": "Pastries, sandwiches until 2pm",
  "drinkNotes": "Specialty coffee, tea, fresh juices",
  "seatingNotes": "Mix of 2-person and 4-person tables, one long communal table",
  "outletNotes": "Outlets at most tables, some near the windows",
  "verified": true
}
```
