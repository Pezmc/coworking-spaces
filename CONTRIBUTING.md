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
| `openingHours` | Operating hours (e.g., "Mon-Fri 08:30-18:00") |

### Noise Level & Atmosphere

| Value | Description |
|-------|-------------|
| `quiet` | Library-like atmosphere – minimal background noise, whispered conversations |
| `medium` | Café ambiance – background chatter and music at moderate volume |
| `loud` | Lively environment – loud music, busy conversations, energetic vibe |

- **atmosphereNotes**: Describe the vibe/feeling/noise level in more detail

### WiFi Speed

| Value | Description |
|-------|-------------|
| `slow` | Under 25 Mbps – suitable for browsing and email |
| `medium` | 25–100 Mbps – good for video calls and general work |
| `fast` | Over 100 Mbps – great for large uploads and multiple devices |
| `unknown` | WiFi speed has not been tested yet |

- **wifiNotes**: Actual speed test results if available

**Tip:** Use [fast.com](https://fast.com) or [speedtest.net](https://speedtest.net) to measure.

### Air Conditioning & Climate

| Value | Description |
|-------|-------------|
| `yes` | Air conditioning available – stays cool in summer |
| `no` | No air conditioning – may be warm on hot days |
| `unknown` | Climate control has not been checked yet |

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

- **seatingNotes**: Physical layout, table arrangements

### Outlet Availability

| Value | Description |
|-------|-------------|
| `few` | 1–2 outlets in the space – arrive early to claim one |
| `some` | Several outlets available – most seats have access |
| `many` | Outlets at every table or seat – no worries about power |
| `unknown` | Outlet availability has not been checked yet |

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
  "openingHours": "Mon-Fri 08:30-18:00, Sat 09:00-17:00",
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
