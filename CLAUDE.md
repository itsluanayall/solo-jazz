# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A jazz solo practice web app that generates random combinations of jazz and basic dance steps. Users tap a button (or press Space/Enter) to generate new combinations, with configurable options via a slide-up drawer.

**Tech Stack:** Plain HTML, CSS, JavaScript — no build step, no frameworks. Just open `index.html` in a browser to run.

## Running the App

```bash
# Just open the HTML file in a browser
open docs/index.html
# or serve locally (e.g., python)
python -m http.server 8000 --directory dist
```

## File Structure

```
docs/
├── index.html   — Main app structure with stage, display, marquee, hit-zone, and drawer
├── script.js    — All logic: step loading, generation, drawer, steppers, ripple effects, keyboard support
├── style.css    — All styles with CSS custom properties for colors
└── steps.json   — Step data: `jazz.startOn1`, `jazz.startOn8`, and `basic` arrays
```

## Key Architecture Patterns

### Data Flow
1. `loadSteps()` fetches `docs/steps.json` on init, populates `jazzSteps` and `basicSteps`
2. `generate()` creates step combinations based on current mode and counts
3. `renderCombo()` renders jazz and basic steps as cards with staggered animations

### Mode Logic
- **"1 only"**: Picks from `jazzSteps.startOn1` only
- **"8 only"**: Picks from `jazzSteps.startOn8` only
- **"Mixed"**: Requires at least 2 jazz steps; picks 1 from each startOn1/startOn8, then fills remaining from both pools

### Step Marquee
Always-visible scrolling marquee showing all available steps. Uses two cloned content elements with `animation-delay` for seamless looping.

### Settings Drawer
- Slides up from bottom via `.open` class
- Close on click outside (using `contains()` check)
- Handle and gear icon both toggle drawer

### Stepper Controls
Replaced number inputs with +/- buttons. Jazz count: 1-8, Basic count: 0-6.

### Animation Approach
- Cards enter with staggered `animation-delay` based on index
- Exiting cards animate out before new ones render (250ms delay)
- Hit-zone has subtle "breathe" animation that pauses on hover
- Ripple effect on click propagates from click coordinates

### Keyboard Support
Space and Enter trigger generation with centered ripple effect.

## Design Tokens

Colors (defined in `:root`, from coolors.co palette, light theme):
- `--bg: #F5F5F3` — Light background
- `--surface: #DBDBDB` — Surface layers
- `--coral: #F33A15` — Primary accent (hit-zone, active chips)
- `--gold: #E0B508` — Marquee text
- `--mint: #54AEC5` — Basic step cards border/gradient
- `--text: #2C2F2D` — Primary text (derived dark)
- `--text-dim: #737A74` — Secondary text

Typography:
- `Space Grotesk` (500, 700) — Display text, step cards, labels
- `Inter` (400, 600) — UI body

Subtle film grain overlay via SVG noise at 3% opacity.

## Common Changes

Adding steps: Edit `docs/steps.json` arrays.

Styling: All in `docs/style.css` with CSS custom properties for easy color tweaks.

Behavior changes: Most logic in `docs/script.js` is straightforward event handlers and helper functions.

## Documentation Maintenance

**Keep both `CLAUDE.md` and `README.md` current:**
- `README.md` — User-facing, extremely concise: what it is, how to use, how to dev
- `CLAUDE.md` — Claude-facing, detailed architecture and patterns

When making architectural changes, update the relevant section in `CLAUDE.md`. When adding new user-facing features, ensure `README.md` reflects the change.
