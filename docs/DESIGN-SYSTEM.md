# Twinbit design system

The source of truth is the token block at the top of `styles.css` (`:root` and `[data-theme=light]`). This document explains the rules behind it.

## 1. Pattern — "twin bits on a grid"

The brand pattern combines two ideas from the logo:
- **Twin dots** `●○` (`.twin`): one filled bit, one empty one. They mark labels, the loader, the hiring perks and live states. When active, the two swap.
- **The grid**: hairline vertical lines (`.gridlines`) run the full page height. Every content block starts on one of them, so the grid itself becomes the visual pattern across all sections.

Supporting motifs: concentric rings with an orbiting dot (hero halo, office map, operating-model dial), and mono numerals such as `[01]` and `01 / 06`.

## 2. Colour

| Token | Dark (default) | White mode | Use |
|---|---|---|---|
| `--ink` | `#0B0A09` | `#F3EEE6` | Page background |
| `--card` / `--card-h` | `#171513` / `#1C1A17` | `#EBE4D9` / `#E4DCCF` | Cards and form panels (borderless, flat fill) |
| `--bone` | `#F1EBE1` | `#16130F` | Primary text |
| `--bone-2` | `#D9D2C6` | `#3B362F` | Lead text |
| `--mute` | `#9A9288` | `#665E54` | Secondary text |
| `--dim` | `#5F5952` | `#80786D` | Tertiary text and placeholders |
| `--signal` | `#FF4F1F` | `#F2481A` | The only accent: hook words, primary buttons, active states |
| `--line` / `--line-2` / `--line-3` | bone at 10 / 18 / 32 % | ink at 11 / 18 / 32 % | Rules, outlines, rings |
| `--grid` | bone at 5.5 % | ink at 7.5 % | Page grid lines |

Rules:
- Orange is used only for hook words and actions; never for decoration.
- No italics in headings.
- Cards have sharp corners and no borders.

## 3. Type

| Role | Family | Token |
|---|---|---|
| Display, UI, body | **Bricolage Grotesque** (variable: opsz, wdth, wght) | `--f-sans` |
| Quotes | **Instrument Serif** | `--f-serif` |
| Labels, numbers, metadata | **JetBrains Mono** | `--f-mono` |

Scale (fluid `clamp`):

| Token | Size |
|---|---|
| `--t-d1` | 48 → 148 px |
| `--t-d2` | 38 → 96 px |
| `--t-h3` | 24 → 38 px |
| `--t-lead` | 18 → 24 px |
| body | 16 px |
| `--t-label` | 11 px mono, uppercase, +0.08em tracking |

Headings use negative tracking, between −0.024 and −0.034em.

## 4. Grid and spacing

- **Desktop:** 12 columns. Page margin `--mx` is 20–72 px and the gutter `--gut` is 12–24 px.
  - Grid lines are drawn at columns 1, 4, 7 and 10, plus the right edge.
- **820 px and below:** two visible lines, the left edge and the centre.
- **Alignment rules:**
  - Every block starts on a grid line.
  - Section headings never cross the centre line; on tablet and desktop (561 px and up) they stay in the left half.
  - A title on the left with a subtitle on the right are vertically centred on each other.
- **Section rhythm:** `--sec` (96–180 px) of padding at the top and bottom of every section.
- **Covering lines:** where a grid line must not run through content (the roles list, a quote, a form panel), the element gets the page or card background and `margin-inline: 1px`. This keeps the outer lines intact.

## 5. Components

| Component | Notes |
|---|---|
| `.btn` | 52 px pill (`--sm` is 42 px), label plus 14 px icon, 7 px gap. Title-case labels. |
| Button variants | `--signal` is orange (primary), `--ghost` is a stroke button, the default is bone. |
| Button hover | The fill wipes up from the bottom and the label rolls. |
| Button icons | Optically centred on the cap height. Diagonal arrows rotate 45° on hover; down arrows loop out of the bottom and back in from the top. Both end centred. |
| `.ic-o` | Round icon-only button. |
| `.chip` / `.fchip` | Pill filters and tags. |
| `.card` | Flat fill, sharp corners, no border. |
| Form field (`.fld`) | Underline input. An orange line draws in on focus. Errors expand in place, so they never overlap the next field. |
| `.ccopy` | Copy chip: subtle fill, and the label rolls to "Copied". |

## 6. Motion

| Token | Curve | Use |
|---|---|---|
| `--e-out` | `cubic-bezier(.16,1,.3,1)` | Reveals and transforms |
| `--e-ui` | `cubic-bezier(.2,.6,.35,1)` | Colour and opacity |
| `--e-wipe` | `cubic-bezier(.77,0,.175,1)` | Curtains, the menu and the theme reveal |

- Every hover has an eased transition in **and** out, with no snapping.
- Headings reveal word by word through masks. Blocks fade up 28 px.
- Page changes use a grid-lined ink curtain (`assets/pt.js`).
- `prefers-reduced-motion` turns off the loader, the trail, scroll scenes and smooth scroll.
