# DRCT Design System

A portable, framework-free token + component library extracted from the
DRCT v3 marketing site (`drct.aero`). It's meant to be copied wholesale
into other projects and re-themed by editing tokens — no build step, no
dependencies, no component markup changes required.

Open **`style-guide.html`** in a browser for a live catalog of every
token and component below.

## What's in here

| File | Purpose |
|---|---|
| `tokens.css` | Every design decision as a CSS custom property: color, type scale, spacing, radius, shadow, motion, z-index, breakpoints. |
| `base.css` | Reset + base element styles (`body`, `h1`–`h3`, `p`, `.container`). |
| `components.css` | ~30 reusable components built only from tokens: buttons, cards, grids, navbar, footer, accordion, forms, etc. |
| `interactions.js` | Vanilla JS behavior for the interactive components (accordion, mobile menu, mega menu, segmented control, range slider, testimonial slider). Self-wiring via class names / data attributes — safe to include even on pages that use only some components. |
| `style-guide.html` | Visual reference implementation. Not required in consumer projects. |

## Using it in a new project

1. Copy `tokens.css`, `base.css`, `components.css`, and (if you need the
   interactive components) `interactions.js` into the new project.
2. Load them in this order:
   ```html
   <link rel="stylesheet" href="tokens.css">
   <link rel="stylesheet" href="base.css">
   <link rel="stylesheet" href="components.css">
   ...
   <script src="interactions.js"></script>
   ```
3. Load the two fonts the system is designed around (or swap them — see
   Re-theming below):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
   ```
4. Build pages out of the classes documented in the style guide, e.g.:
   ```html
   <div class="card card--tint">
     <div class="card__title">Fast setup</div>
     <div class="card__desc">Ship a themed page in an afternoon.</div>
   </div>
   ```

## Re-theming for a different brand

Every color, size, and timing value in `components.css` is a `var(--token)`
reference — never a hard-coded value. To adapt the system to a new brand,
override tokens after `tokens.css` loads (either edit the file directly, or
cascade a second stylesheet):

```css
:root {
  --color-primary: #7c3aed;
  --color-primary-rgb: 124, 58, 237;
  --font-sans: 'Inter', sans-serif;
  --radius-xl: 12px;
}
```

Everything downstream — buttons, cards, badges, the navbar CTA — picks up
the new brand automatically.

## Component inventory

- **Buttons** — `.btn--primary`, `.btn--secondary`, `.btn--link`, `.btn--pill`
- **Labels** — `.eyebrow`, `.badge--soft`, `.badge--live`
- **Layout** — `.container`, `.container--wide`, `.grid` (`--2`/`--3`/`--4`/`--auto`)
- **Cards** — `.card`, `.card--tint`, `.card--media`
- **Content blocks** — `.section-heading`, `.stat`, `.stats-row`, `.steps`, `.split-card`
- **Conversion** — `.cta-banner`, `.cta-dual`, `.testimonial`
- **Controls** — `.segmented`, `.range-slider`, `.field` (form inputs)
- **Chrome** — `.navbar` (+ `.mega-menu`, `.mobile-menu`), `.footer`, `.banner`
- **Misc** — `.terminal` (code/demo block), `.popover`, `.accordion`

## Design tokens at a glance

- **Color** — one brand blue (`--color-primary`) + one ink neutral
  (`--color-ink`) at fixed opacity steps (05→90), plus success/warning/error.
- **Type** — IBM Plex Sans (UI) / IBM Plex Mono (labels, data, code), a
  14-step size scale from 9px to 92px, weights 400/500/600/700/900.
- **Spacing** — a 13-step scale from 4px to 80px (`--space-1`…`--space-13`).
- **Radius** — 4 / 8 / 10 / 16 / 24px + full circle.
- **Breakpoints** — 1024 / 767 / 480 / 413 / 320px. Documented as tokens
  for reference, but must be repeated as literals inside `@media` queries
  (CSS custom properties can't be interpolated there).

## What was intentionally left out

Highly page-specific widgets from the source site — the GDS terminal fare
simulator, the DRCT booking-interface mock, the airline logo comparison
grid, the NDC flow diagram — were **not** ported. They're one-off product
illustrations, not reusable UI primitives. The generic patterns underneath
them (terminal chrome, split cards, step rows, stat blocks) were extracted
instead.

Forms/inputs (`.field`) do not exist in the source site; they were added
using the same token system so a new project doesn't have to invent one
from scratch.

## Provenance

Extracted from the `DRCTv3` production bundle (`css/styles.css`,
`css/blocks.css`, `js/app.js`) — a superset of the design system already
documented for the single-page site in this repo's own `CLAUDE.md`. Colors,
spacing, and type values are reproduced faithfully; component code was
rewritten with generic class names and CSS custom properties so it can
travel to other codebases without dragging DRCT-specific markup along.
