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

### Colors

```css
/* Dark / Neutral */
--dark:      #1b2733
--dark-90:   rgba(27,39,51,0.9)
--dark-70:   rgba(27,39,51,0.7)
--dark-40:   rgba(27,39,51,0.4)
--dark-26:   rgba(27,39,51,0.26)
--dark-20:   rgba(27,39,51,0.2)
--dark-15:   rgba(27,39,51,0.15)
--dark-10:   rgba(27,39,51,0.1)
--dark-05:   rgba(27,39,51,0.05)

/* Blue / Interactive */
--blue:      #2a8aea
--blue-85:   rgba(42,138,234,0.85)
--blue-80:   rgba(42,138,234,0.8)
--blue-61:   rgba(42,138,234,0.61)
--blue-20:   rgba(42,138,234,0.2)
--blue-10:   rgba(42,138,234,0.1)
--blue-alt:  #2188ed

/* Surface */
--white:        #ffffff
--near-black:   #17171e
--gray-light:   #f4f4f5
--off-white:    #f3f4f5

/* Status */
--error:    #fd5666
--warning:  #ff9f00
--success:  #33c100
```

### Typography

```css
--font-sans: 'IBM Plex Sans', 'Roboto', sans-serif   /* all UI text */
--font-mono: 'IBM Plex Mono', monospace               /* terminal, data, prices */
```

Font weights in use: 400, 500, 600, 700, 900.

Key font sizes:
- 31px — major section headings (`h2`, `.section-h2`)
- 27px — section headings on mobile
- 21px — FAQ question text
- 16px — feature headings
- 15px — body text (advantages, benefits)
- 14px — section descriptions
- 13px — button labels (uppercase, `letter-spacing: 0.6px`)
- 12px — tab labels, small text
- 11px — footer text, airline badge text
- 10px — field labels

### Layout

```css
--container:  1010px   /* max content width */
--header-h:   60px     /* sticky header height */
```

### Shadows

```css
--shadow-image:  0 25px 30px rgba(27,39,51,0.2), 0 0 20px rgba(27,39,51,0.1)
--shadow-card:   0 8px 40px rgba(27,39,51,0.2)
--shadow-header: 0 4px 8px rgba(27,39,51,0.1)
--shadow-pop:    0 6px 12px rgba(27,39,51,0.2)
```

### Responsive Breakpoints

| Breakpoint | Context |
|---|---|
| 1024px | Tablet landscape — adjust widths |
| 767px | Tablet/mobile — toggle desktop↔mobile layouts |
| 413px | Small mobile — smaller fonts and padding |
| 320px | Extra small — minimal padding |

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
