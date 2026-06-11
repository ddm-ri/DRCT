# Landing pages — DRCT

Static landing pages for [DRCT](https://drct.aero/). **Company name:** DRCT. **Positioning:** Airline Offer Orchestrator. All copy is in **English**.

## Run locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

Or: `make serve`

## Structure

| Path | Page |
|------|------|
| `index.html` | Home — Airline Offer Orchestrator |
| `solutions/for-airlines.html` | For Airlines ✅ |
| `solutions/iata-agencies.html` | IATA Agencies |
| `solutions/non-iata-agencies.html` | Non-IATA Agencies |
| `solutions/tms.html` | For TMS |
| `solutions/ota.html` | For OTA |
| `products/bt.html` | BT |
| `products/bt-for-tms.html` | BT for TMS |
| `products/api.html` | API |
| `products/extension.html` | Extension |
| `supply-network/index.html` | Supply Network overview |
| `supply-network/lufthansa.html` | Lufthansa |
| `supply-network/emirates.html` | Emirates |
| `about.html` | About |

## Assets

- `css/styles.css` — shared design system
- `css/blocks.css` — component styles
- `css/legacy.css` — legacy blocks (quote, KPI, partners)
- `js/app.js` — navigation and interaction handlers
