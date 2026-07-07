# Baggage Selection — Per-Airline Business Rules

## Context

Baggage as an ancillary service was previously designed for airlines where **every
additional bag costs the same flat price** (reference design already shipped).

This document specifies the **different pricing/quantity logic** required for the
airline channels below, so that UI/UX design and implementation can account for
each carrier's rules. Each section covers: how bag price scales with quantity, the
maximum number of bags that can be added, how an included (fare-bundled) bag
interacts with the limit and pricing, and any passenger-type (adult / child /
infant) or route (e.g. to the US) restrictions.

---

## Lufthansa Group

- **Pricing:** the first bag is priced separately; the second bag and every bag
  after it share one flat price (different from the first). Example: 1st bag = 35
  EUR, 2nd/3rd/... = 65 EUR each.
- **Included bag:** if a fare already includes a bag, every *additional* bag is
  priced at one flat rate (i.e. the "first bag" tier is skipped since it's already
  covered by the fare).
- **Max bags:** 6 total.
  - An included fare bag counts toward this limit (e.g. Classic fare with 1
    included bag → only 5 more can be added).
  - Business class can still add up to 6 bags even when a bag is already
    included in the fare.
  - Routes to the US: limit is 2 bags.
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## Turkish Airlines

- **Pricing/quantity:** any custom amount of baggage can be added, from 3 kg up
  to 230 kg.
  - Routes to the US: 1 to 10 pieces (PC) of baggage instead of a weight range.
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## LOT Polish Airlines

- **Pricing:** first and second bag are priced differently from each other; third
  bag and beyond all share one flat price.
  - Business and Premium: first bag priced separately; second bag and beyond
    share one flat price (i.e. only two price tiers instead of three).
- **Max bags:** 5 total.
- **Passenger types:** same rules for all passenger types (no adult/child/infant
  distinction).

## Air France / KLM

- **Pricing:** every bag is priced individually (no shared tier — each bag can
  have its own price).
- **Max bags:** 1 to 10 bags total.
  - A fare-included bag counts toward this limit (e.g. fare with 1 included bag
    → only 9 more can be added).
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## British Airways

- **Pricing:** first and second bag priced differently from each other; third
  bag and beyond share one flat price.
- **Max bags:** 1 to 10 bags.
  - Fares that already include a bag: still 1 to 10 bags, but the first
    (additional) bag has its own price, and the second and beyond share one flat
    price.
  - Business and Premium: 1 to 10 bags, but all bags share a single flat price
    (no tiering).
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## Finnair

- **Pricing:** first and second bag priced differently from each other; third
  bag and beyond share one flat price.
- **Max bags:** 8 bags maximum.
  - Fares that already include a bag: still up to 8 bags, but the first
    (additional) bag has its own price, and the second and beyond share one flat
    price.
  - Business and Premium: up to 8 bags, all sharing a single flat price (no
    tiering).
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## AJet

- **Pricing/quantity:** baggage is added in 5 kg increments, up to a maximum of
  230 kg.
  - If the fare already includes a bag, its weight is subtracted from the
    available total (e.g. fare with 25 kg included → only 205 kg of additional
    baggage can be added).
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## Air Arabia

- **Options:** a bag can be added as either 20 kg or 30 kg.
  - If a bag is already included in the fare, only the *other* weight option can
    be added (e.g. if 20 kg is included, only the 30 kg option can be selected
    additionally).
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

## Singapore Airlines

- **Pricing/quantity:** baggage is added in 5 kg increments, up to a maximum of
  100 kg.
  - To/from the US: instead of weight increments, up to 2 suitcases can be
    added, each priced the same.
- **Passenger types:**
  - Infant: baggage cannot be added.
  - Child: same rules as adult.

---

## Summary Table

| Airline | Pricing tiers | Max bags/weight | US route exception | Infant | Child |
|---|---|---|---|---|---|
| Lufthansa Group | 1st bag one price; 2nd+ flat | 6 bags (incl. fare bag counts, except Business) | 2 bags | No baggage | Same as adult |
| Turkish | Custom quantity | 3–230 kg | 1–10 PC | No baggage | Same as adult |
| LOT | 1st & 2nd different; 3rd+ flat (Business/Premium: 1st different, 2nd+ flat) | 5 bags | — | Same for all pax | Same for all pax |
| Air France/KLM | Every bag individually priced | 1–10 bags (incl. fare bag counts) | — | No baggage | Same as adult |
| British Airways | 1st & 2nd different; 3rd+ flat (Business/Premium: all flat) | 1–10 bags | — | No baggage | Same as adult |
| Finnair | 1st & 2nd different; 3rd+ flat (Business/Premium: all flat) | 8 bags | — | No baggage | Same as adult |
| AJet | Flat per 5 kg increment | 230 kg (fare bag weight subtracted) | — | No baggage | Same as adult |
| Air Arabia | Choice of 20 kg or 30 kg | Only the non-included weight if a bag is in the fare | — | No baggage | Same as adult |
| Singapore | Flat per 5 kg increment | 100 kg | 2 suitcases, same price each | No baggage | Same as adult |
