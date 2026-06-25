# DRCT Landing Page — Permanent Project Rules

## Ground Rules

- Treat the existing implementation as the **design system source of truth**.
- Reuse existing components, classes, spacing, typography, colors, buttons, cards, layout patterns, and responsive behavior.
- Do not invent new styles unless explicitly asked.
- Do not redesign sections from scratch.
- Do not change content or messaging unless explicitly asked.
- When a change is requested, apply it within the existing DRCT visual system.
- If a requested change conflicts with the existing system, explain the conflict before implementing.
- Always preserve DRCT identity and production-like quality.
- Prefer spacing, hierarchy, and alignment over decorative styling.
- Avoid: glassmorphism, random gradients, heavy shadows, clipart-style icons, unnecessary dividers, trendy SaaS patterns.
- Work incrementally: one change at a time.
- After every visual change, run the page locally and provide fresh desktop and mobile screenshots.

---

## Repository Structure

```
/
├── index.html     # Single landing page (619 lines)
├── styles.css     # Complete design system (2064 lines)
├── main.js        # Interaction handlers (370 lines)
└── CLAUDE.md
```

Vanilla HTML/CSS/JS — no build step, no framework.

---

## Design Tokens

### CSS Custom Properties

All tokens are defined in `:root` in `styles.css`. Always use the variable name, not the raw value.

```css
/* ─── Dark / Neutral ─────────────────────────────── */
--dark:      #1b2733
--dark-90:   rgba(27,39,51,0.9)
--dark-70:   rgba(27,39,51,0.7)
--dark-40:   rgba(27,39,51,0.4)
--dark-26:   rgba(27,39,51,0.26)
--dark-20:   rgba(27,39,51,0.2)
--dark-15:   rgba(27,39,51,0.15)
--dark-10:   rgba(27,39,51,0.1)
--dark-05:   rgba(27,39,51,0.05)

/* ─── Blue / Interactive ──────────────────────────── */
--blue:      #2a8aea
--blue-85:   rgba(42,138,234,0.85)
--blue-80:   rgba(42,138,234,0.8)
--blue-61:   rgba(42,138,234,0.61)
--blue-20:   rgba(42,138,234,0.2)
--blue-10:   rgba(42,138,234,0.1)
--blue-alt:  #2188ed

/* ─── Surface ─────────────────────────────────────── */
--white:        #ffffff
--near-black:   #17171e
--gray-light:   #f4f4f5
--off-white:    #f3f4f5

/* ─── Status ──────────────────────────────────────── */
--error:    #fd5666
--warning:  #ff9f00
--success:  #33c100

/* ─── Typography ──────────────────────────────────── */
--font-sans: 'IBM Plex Sans', 'Roboto', sans-serif
--font-mono: 'IBM Plex Mono', monospace

/* ─── Layout ──────────────────────────────────────── */
--container:  1010px
--header-h:   60px

/* ─── Shadows ─────────────────────────────────────── */
--shadow-image:  0 25px 30px rgba(27,39,51,0.2), 0 0 20px rgba(27,39,51,0.1)
--shadow-card:   0 8px 40px rgba(27,39,51,0.2)
--shadow-header: 0 4px 8px rgba(27,39,51,0.1)
--shadow-pop:    0 6px 12px rgba(27,39,51,0.2)
```

---

### Colors

#### Named palette (use variables above)

| Token | Value | Use |
|---|---|---|
| `--dark` | `#1b2733` | Primary text, headings |
| `--dark-70` | `rgba(27,39,51,0.7)` | Body text, descriptions |
| `--dark-40` | `rgba(27,39,51,0.4)` | Placeholder, muted text |
| `--dark-20` | `rgba(27,39,51,0.2)` | Borders, dividers |
| `--dark-10` | `rgba(27,39,51,0.1)` | Subtle backgrounds |
| `--dark-05` | `rgba(27,39,51,0.05)` | Hover backgrounds |
| `--blue` | `#2a8aea` | CTAs, links, interactive |
| `--blue-20` | `rgba(42,138,234,0.2)` | Button hover tints |
| `--blue-10` | `rgba(42,138,234,0.1)` | Icon backgrounds |
| `--white` | `#ffffff` | Card surfaces, button text |
| `--off-white` | `#f3f4f5` | Page background, cookie banner |
| `--gray-light` | `#f4f4f5` | Section backgrounds |
| `--near-black` | `#17171e` | Terminal, dark UI |
| `--error` | `#fd5666` | Error states |
| `--warning` | `#ff9f00` | Warning states |
| `--success` | `#33c100` | Success / live badge |

#### Non-variable colors (raw values used in CSS)

Only use these for the specific contexts below — do not repurpose.

| Value | Context |
|---|---|
| `#f8f9fa` | `.drct-mock__bar` background |
| `#f6faff` | `.hd-platform` gradient end |
| `#c07000` | `.ps-label--prob` amber label |
| `#5fba2e`, `#3d9c1a` | Live badge gradient (`linear-gradient(145deg, …)`) |
| `rgba(27,39,51,0.55)` | `.bcard__desc`, `.gain-toggle__btn` |
| `rgba(27,39,51,0.45)` | `.certified__airline p`, `.bcard-group__label` |
| `rgba(27,39,51,0.42)` | `.hd-offer__meta`, `.flow-core__note` |
| `rgba(42,138,234,0.15)` | Card/slide gradient highlight |
| `rgba(42,138,234,0.12)` | `.flow-core` badge, `.bcard__icon` |
| `rgba(180,80,0,0.05)` | `.ps-half--prob` gradient (problem state) |
| `rgba(255,159,0,0.12)` | `.ps-icon--prob` icon background |

---

### Typography

#### Fonts

```css
--font-sans: 'IBM Plex Sans', 'Roboto', sans-serif   /* all UI text */
--font-mono: 'IBM Plex Mono', monospace               /* terminal, data, prices */
```

Both fonts are loaded from Google Fonts. Do not add new font families.

#### Font size scale

| Size | Weight(s) | Context |
|---|---|---|
| 92px | 700, 900 | `.metrics__value` — big stat numbers (desktop) |
| 72px | 700, 900 | `.metrics__value` — stat numbers (mobile/tablet) |
| 56px | 900 | `.outcome-metric` |
| 44px | 700 | `.hero-split__title` |
| 40px | 700 | `.hero__title` (desktop) |
| 36px | 700 | `.hero__title` (≤1024px) |
| 32px | 700 | `.hero__title` (≤767px) |
| 31px | 700 | Section `h2`, `.section-h2`, `.metrics__title` — **primary section heading** |
| 27px | 700 | Section `h2` on mobile (≤413px) |
| 21px | 400 | `.questions__body ul li h3` — FAQ question text |
| 20px | 500 | `.testi__quote` |
| 18px | 700 | `.prod-card__title`, `.prod-card__name`, `.mm-intro__title` |
| 17px | 700 | `.certified__iata h3`, carousel slide headings (mobile) |
| 16px | 700 | `.one-place__option h3`, `.feature-card h3`, `.metrics__label`, `.step-col h3`, `.benefit__item h3` — **feature/card headings** |
| 15px | 500–600 | `.info__bold`, `.advantages ul li`, `.benefit__item h3`, `.flow-heading`, `.prod-card__title` |
| 14px | 400–500 | `.how > p`, `.hero__subtitle`, `.section-block__head p`, `.questions > p`, `.testi__name` — **section descriptions** |
| 13px | 700 | `.btn-primary`, `.link-btn`, `.header__nav-link`, `.prod-card__desc`, `.testi__link` — **button labels + body text** |
| 12px | 600–700 | `.drct-mock__tab`, `.terminal-commands li`, `.terminal-popover__command/.result`, `.savings__marks` — **tab labels, small UI** |
| 11px | 700 | `.footer__bottom`, `.testi__eyebrow`, `.certified__iata h3`, `.hero__badge` — **footer, badges** |
| 10px | 600 | `.drct-mock__field span`, `.flow-eyebrow`, `.prod-card__tag`, `.hd-col__label` — **field labels, eyebrows** |
| 9px | — | `.hd-col__label`, `.hd-offer__meta` — internal UI micro-labels |
| 8px | 600 | `.hd-platform__tag`, `.hd-offer__type`, `.hd-offer__pills span`, `.al-badge-impl` — smallest labels |

#### Font weights

| Weight | Role |
|---|---|
| 400 | Normal body text, FAQ question text |
| 500 | Emphasis within body, `.testi__quote`, nav triggers |
| 600 | Eyebrows, tags, secondary labels, mono code |
| 700 | **Default for headings and interactive text** — all buttons, all h2/h3, labels |
| 900 | Oversized metric values only (`.metrics__value`, `.outcome-metric`) |

#### Letter spacing

| Value | Context |
|---|---|
| `-0.6px` | `.hero-split__title` (very large heading) |
| `-0.4px` | `.hero__title` |
| `-0.2px` | `.mm-intro__title` |
| `-0.15px` | `.bcard__title` |
| `0.3px` | `.header__logo`, `.drct-mock__price em` |
| `0.4px` | `.drct-mock__tab`, `.drct-mock__field span` |
| `0.5px` | `.dual-cta__label`, `.prod-card__tag`, `.flow-eyebrow` |
| `0.6px` | `.btn-primary`, `.link-btn`, `.header__try` — **standard button spacing** |
| `0.7px` | `.hd-platform__tag`, `.al-badge-impl` |
| `0.8px` | `.info__eyebrow`, `.menu__group-label`, `.ps-label` |
| `1.2px` | `.testi__airline-name` |
| `1.8px` | `.testi__eyebrow` |
| `2px` | `.footer__bottom i`, footer links |

Buttons always use `text-transform: uppercase` + `letter-spacing: 0.6px`.

#### Line heights

| Value | Context |
|---|---|
| `1` | `body`, `.metrics__value` |
| `1.2` | Headings: `.hero__title`, `.prod-card__title`, `.metrics__label`, `.feature-card h3` |
| `1.23` | `.info__left h2`, `.info__h1` |
| `1.3` | `.bcard__title`, `.benefit__item h3`, `.one-place__option h3`, `.step-col h3` |
| `1.46` | Terminal text, `.terminal-mock__result p`, `.terminal__input` |
| `1.5` | `.info__bold`, `.dual-cta__text` |
| `1.55` | `.feature-card p` |
| `1.57` | Body copy: `.prod-card__desc`, `.benefit__item p`, `.questions__body ul li p`, `.certified__description`, `.step-col p` — **standard body line-height** |
| `1.6` | `.mm-intro__desc`, `.hero__description`, `.testi__quote`, `.section-block__head p` |
| `1.63` | `.info__left p` |
| `1.65` | `.hero-split__desc`, `.bcard__desc` |
| `1.67` | `.savings__tooltip p` |

---

### Layout

```css
--container:  1010px   /* max content width — never exceed */
--header-h:   60px     /* sticky header height */
```

Additional fixed widths in use (do not create new ones):

| Width | Element |
|---|---|
| `1200px` | `.nav-bar__inner` |
| `680px` | `.hero`, `.hero__description`, `.dual-cta` |
| `624px` | `.how__terminal` |
| `550px` | `.one-place__details`, `.hero-split__media` |
| `520px` | `.hero-split__text` |
| `460px` | `.info__left` |
| `420px` | `.one-place__options` |
| `310px` | `.benefit__item` |
| `260px` | `.savings__tooltip` |

---

### Shadows

```css
/* Named variables */
--shadow-image:  0 25px 30px rgba(27,39,51,0.2), 0 0 20px rgba(27,39,51,0.1)
--shadow-card:   0 8px 40px rgba(27,39,51,0.2)
--shadow-header: 0 4px 8px rgba(27,39,51,0.1)
--shadow-pop:    0 6px 12px rgba(27,39,51,0.2)

/* Additional non-variable shadows in use */
/* hero video */        0 24px 64px rgba(27,39,51,0.16)
/* mega-menu */         0 24px 64px rgba(27,39,51,0.12), 0 4px 16px rgba(27,39,51,0.05)
/* lang picker */       0 8px 24px rgba(27,39,51,0.11), 0 2px 6px rgba(27,39,51,0.05)
/* platform panel */    0 12px 40px rgba(27,39,51,0.12), 0 2px 8px rgba(27,39,51,0.06)
/* flow core col */     0 12px 40px rgba(42,138,234,0.12), 0 0 0 1px rgba(42,138,234,0.08)
/* cards / features */  0 2px 12px rgba(27,39,51,0.06), 0 6px 32px rgba(27,39,51,0.04)
/* drct-mock--sm */     0 14px 40px rgba(27,39,51,0.26)
/* button hover */      0 4px 14px rgba(42,138,234,0.3)
/* focus ring */        0 0 0 3px rgba(42,138,234,0.15)
```

---

### Border Radius

| Value | Elements |
|---|---|
| `4px` | `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.header__try`, `.hero__badge`, `.hd-offer` — **standard button/badge radius** |
| `8px` | `.info__right`, `.one-place__option`, `.hero-split__video`, navigation items |
| `10px` | `.nav-bar__demo`, `.bcard__icon`, `.gain-toggle`, `.mm-item__icon` |
| `12px` | `.mega-menu`, `.mm-lang` |
| `14px` | `.hd-platform` |
| `16px` | `.bcard`, `.feature-card`, `.dual-cta__item`, `.prod-card`, `.testi__img`, `.cta-final__card` — **standard card radius** |
| `24px` | `.testi__slide`, `.cta-final__card` — **large card radius** |
| `50%` | Circles: range thumbs, dots, control buttons |

---

### Gradients

```css
/* Subtle section fade (mobile scroll cue) */
linear-gradient(0deg, rgba(42,138,234,0), rgba(42,138,234,0.2))

/* Card/slide highlight — DRCT system blue only */
linear-gradient(135deg, rgba(42,138,234,0.15) 0%, rgba(42,138,234,0.04) 100%)

/* Platform panel surface */
linear-gradient(160deg, #fff 0%, #f6faff 100%)

/* Feature card (bcard) */
linear-gradient(180deg, rgba(42,138,234,0.07) 0%, rgba(42,138,234,0.02) 100%)

/* Flow col core highlight */
linear-gradient(160deg, rgba(42,138,234,0.10) 0%, rgba(42,138,234,0.18) 50%, rgba(42,138,234,0.10) 100%)

/* Solution state (green-ish blue) */
linear-gradient(150deg, rgba(42,138,234,0.065) 0%, rgba(42,138,234,0.018) 100%)

/* Problem state (amber) */
linear-gradient(150deg, rgba(180,80,0,0.05) 0%, rgba(180,80,0,0.014) 100%)

/* Live badge */
linear-gradient(145deg, #5fba2e, #3d9c1a)
```

---

### Z-Index Stack

| z-index | Element |
|---|---|
| `-1` | `.terminal-popover` (hidden state), mobile gradient overlays |
| `1–2` | `.hd-platform`, `.flow-col--core`, flow arrows |
| `5` | `.cookie` banner |
| `6` | `.header` (sticky) |
| `9` | `.mobile-menu` |
| `100` | `.nav-bar` |
| `200` | `.mega-menu`, `.mm-lang` |

Do not add new z-index values without checking the full stack.

---

### Responsive Breakpoints

| Breakpoint | Context |
|---|---|
| `1024px` | Tablet landscape — width adjustments, fluid type sizes |
| `767px` | **Primary mobile breakpoint** — desktop↔mobile layout toggle |
| `480px` | `.bcard-grid` column collapse |
| `413px` | Small mobile — smaller type, reduced padding |
| `320px` | Extra small — minimal padding only |

Only use these five breakpoints. Do not add new ones.

---

### Key Spacing Values

The codebase uses a loose spacing scale. Most common values:

| Value | Common use |
|---|---|
| `4px` | Tight gaps, icon margins |
| `8px` | Item gaps, small margins |
| `12px` | Inner padding, paragraph spacing |
| `16px` | Standard padding, card inner gap |
| `20px` | Button padding, compact card padding |
| `24px` | Card padding, section sub-spacing |
| `28px` | Card padding (larger), menu padding |
| `32px` | Section padding start |
| `40px` | Section description margin |
| `48px` | Card body padding |
| `52px` | Testimonial body side padding |
| `60px` | Section heading to content gap |
| `80px` | Section-to-section margin |

---

### Transitions

Standard easing used across the system:

```css
/* Page load */
opacity 0.3s

/* Navigation items */
background 0.14s, color 0.14s

/* Hamburger / cross */
opacity 0.25s cubic-bezier(0.19,1,0.22,1) 0.2s,
transform 0.25s cubic-bezier(0.19,1,0.22,1) 0.2s

/* Accordion icons */
all 0.5s cubic-bezier(0.19,1,0.22,1)

/* Carousel */
transform 0.3s ease

/* Mega-menu show */
opacity 0.16s ease, transform 0.16s ease

/* Terminal popover */
all 0.4s ease-in-out 0.5s

/* Toggle buttons */
background 0.18s, color 0.18s, box-shadow 0.18s
```

---

## Reusable Components

### Buttons

**`.btn-primary`** — filled blue CTA
- Background: `var(--blue)` (`#2a8aea`)
- Text: white, uppercase, 13px, `letter-spacing: 0.6px`, weight 700
- Height: 38px, `border-radius: 4px`
- Use for: primary calls-to-action ("Request Demo", "Try DRCT")

**`.link-btn`** — text-only blue link button
- Color: `var(--blue)`, uppercase, no fill
- Use for: secondary actions, inline "learn more" links

### Layout Containers

**`.landing-new__body`** — max-width content wrapper
- `max-width: 1010px`, centered, responsive padding

**`.landing-new`** / **`.landing-new.loaded`** — page fade-in wrapper

### Header

Classes: `.header`, `.header__links`, `.header__links-left`, `.header__links-right`, `.header__logo`, `.header__nav-link` (`.active`), `.header__signin`, `.header__try`

Mobile: `.header__menu-cross`, `.line-1`, `.line-2`, `.mobile-menu` (`.open`), `.menu__links`

### Hero Section

Classes: `.info`, `.info__left`, `.info__right`, `.info__video`, `.info__video-fallback`, `.info__try-mobile`

Layout: flex row on desktop, column on mobile.

### Terminal Mock (fallback / How It Works)

**`.terminal-mock`** — static terminal display
- Classes: `.terminal-mock__header`, `.terminal-mock__controls`, `.terminal-mock__body`, `.terminal-mock__line`, `.terminal-mock__result`
- Font: `var(--font-mono)`

**Interactive terminal** (`.how__terminal`):
- Classes: `.terminal__header`, `.terminal__controls`, `.terminal__drct-icon`, `.terminal__body`, `.terminal-input__main`, `.terminal__input`, `.terminal-commands`, `.terminal-result`
- Popover: `.terminal-popover` (`.active`), `.terminal-popover__header`, `.terminal-popover__body`, `.terminal-popover__command`, `.terminal-popover__result`, `.terminal-popover__btn`

### DRCT Interface Mock

**`.drct-mock`** / **`.drct-mock--sm`** — simulated booking interface
- Tab bar: `.drct-mock__bar`, `.drct-mock__tabs`, `.drct-mock__tab` (`.active`)
- Search row: `.drct-mock__search`, `.drct-mock__field`
- Results: `.drct-mock__results`, `.drct-mock__result` (`.active-row`), `.drct-mock__airline`, `.drct-mock__flight`, `.drct-mock__time`, `.drct-mock__price` (`.drct-mock__price--ndc`)

### Savings Calculator

Classes: `.savings`, `.savings__body`, `.savings__try`, `.savings__tooltip`, `.savings__amount*`, `.savings__currency`, `.savings__slider-row`, `.savings__track-wrap`, `.savings__range`, `.savings__dot`, `.savings__marks`, `.savings__track-fill`

### One-Place / Feature Accordion + Carousel

Desktop accordion: `.one-place__options`, `.one-place__option` (`.active`)
Mobile carousel: `.one-place__carousel` (`.open`), `.one-place__carousel-track`, `.one-place__carousel-slide`, `.one-place__carousel-nav span`

### Benefits Grid

`.benefits`, `.benefits__container`, `.benefits__body`, `.benefit__item` (`.hidden`)
- Flex wrap, ~310px per item, 6 cards (3 visible by default, 3 togglable)

### FAQ Accordion

`.questions`, `.questions__body ul li` (`.active`), `li h3`, `li h3 span` (toggle icon via `::before`/`::after`), `li p`

### Certified Airlines Grid

`.certified`, `.certified__airlines` — CSS Grid, 5 cols desktop / 4 cols tablet
`.certified__airline`, `.certified__airline--badge` — 85×85px cells
`.certified__iata` — IATA ARM badge

### Footer

`.footer`, `.footer__top`, `.footer__left`, `.footer__right`, `.footer__links`, `.footer__policy`, `.footer__l`, `.footer__f`, `.footer__bottom`

### Cookie Banner

`.cookie`, `.cookie__wrapper` — fixed bottom, `background: var(--off-white)`

---

## Interaction Patterns

| Pattern | Mechanism |
|---|---|
| Accordion open/close | Toggle `.active` class on `li` or `.one-place__option` |
| Mobile menu | Toggle `.open` on `.mobile-menu`, animate `.line-1`/`.line-2` |
| Carousel | `transform: translateX()` on `.one-place__carousel-track` |
| Popover show | Toggle `.active` on `.terminal-popover` |
| Benefits expand | Toggle `.hidden` on `.benefit__item` items 4–6 |
| Page load fade | Add `.loaded` to `.landing-new` |

Standard transitions:
- General: `transition: opacity 0.3s`
- Hamburger: `transform 0.25s cubic-bezier(0.19,1,0.22,1) 0.2s`
- Accordion icons: `all 0.5s cubic-bezier(0.19,1,0.22,1)`
- Carousel: `transform 0.3s ease`
- Popover: `all 0.4s ease-in-out 0.5s`

---

## Naming Convention

BEM throughout: `.block`, `.block__element`, `.block__element--modifier`

Active states: add `.active` class (never inline styles for state).
Hidden states: add `.hidden` class or `display: none` via media query.

---

## What Not To Do

- Do not add new CSS custom properties without a clear reason.
- Do not introduce Tailwind, Bootstrap, or any utility framework.
- Do not add external icon libraries — icons are inline SVG or CSS pseudo-elements.
- Do not add new Google Fonts — IBM Plex Sans and IBM Plex Mono are already loaded.
- Do not create new layout containers outside the `1010px` system.
- Do not add new breakpoints beyond the four already defined.
- Do not use `!important` except to override a third-party style.
- Do not change `z-index` values arbitrarily — the stacking context is deliberate.
