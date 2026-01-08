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

## Category Definitions

When filling out a space entry, use the following guidelines to pick the right category values.

### WiFi Speed

| Value | Description |
|-------|-------------|
| `slow` | Under 25 Mbps – suitable for browsing and email |
| `medium` | 25–100 Mbps – good for video calls and general work |
| `fast` | Over 100 Mbps – great for large uploads and multiple devices |
| `unknown` | WiFi speed has not been tested yet |

**Tip:** Use [fast.com](https://fast.com) or [speedtest.net](https://speedtest.net) to measure.

### Noise Level

| Value | Description |
|-------|-------------|
| `quiet` | Library-like atmosphere – minimal background noise, whispered conversations |
| `medium` | Café ambiance – background chatter and music at moderate volume |
| `loud` | Lively environment – loud music, busy conversations, energetic vibe |

### Food Availability

| Value | Description |
|-------|-------------|
| `none` | No food available – drinks only |
| `light` | Snacks and light bites – pastries, sandwiches, simple items |
| `full` | Full menu – hot meals, substantial food options |

### Seating Type

| Value | Description |
|-------|-------------|
| `individual` | Mostly 1–2 person tables – best for solo work |
| `mixed` | Variety of table sizes – options for both solo and group work |
| `group` | Primarily large tables (4+ people) – communal seating |

### Outlet Availability

| Value | Description |
|-------|-------------|
| `few` | 1–2 outlets in the space – arrive early to claim one |
| `some` | Several outlets available – most seats have access |
| `many` | Outlets at every table or seat – no worries about power |
| `unknown` | Outlet availability has not been checked yet |

### Air Conditioning

| Value | Description |
|-------|-------------|
| `yes` | Air conditioning available – stays cool in summer |
| `no` | No air conditioning – may be warm on hot days |
| `unknown` | Climate control has not been checked yet |

## Example Entry

```json
{
  "id": "cafe-example",
  "name": "Example Café",
  "address": "123 Main Street, City",
  "googleMapsUrl": "https://maps.google.com/?q=Example+Cafe+City",
  "noiseLevel": "medium",
  "wifiSpeed": "fast",
  "hasAC": "yes",
  "foodAvailability": "light",
  "seatingType": "mixed",
  "hasOutlets": "some",
  "atmosphere": "Bright and airy with good natural light",
  "spaceDescription": "Mix of 2-person and 4-person tables, one long communal table",
  "wifiDetails": "150 Mbps down, 50 Mbps up",
  "noiseNotes": "Chill music, gets busier around lunch",
  "climateNotes": "Good AC, can get chilly near the vents",
  "drinks": "Specialty coffee, tea, fresh juices",
  "foodNotes": "Pastries, sandwiches until 2pm",
  "openingHours": "Mon-Fri 8am-6pm, Sat-Sun 9am-5pm",
  "notes": "Staff are laptop-friendly, no time limits"
}
```

## Field Descriptions

- **id**: Unique identifier (lowercase, hyphens, e.g., `cafe-name`)
- **name**: The venue's name
- **address**: Street address or general location
- **googleMapsUrl**: Direct link to Google Maps
- **atmosphere**: Brief description of the vibe/feeling
- **spaceDescription**: Physical layout, table arrangements
- **wifiDetails**: Actual speed test results if available
- **noiseNotes**: Details about music, conversation levels
- **climateNotes**: AC quality, temperature notes
- **drinks**: What beverages are available
- **foodNotes**: What food is available and when
- **openingHours**: Operating hours
- **notes**: Any other useful information for remote workers

