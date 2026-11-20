# Twinbit — website redesign

A dark-first (with white mode), grid-driven redesign of [twinbit.net](https://twinbit.net) — the site of Twinbit Limited, an in-house iOS app production house in Mirpur DOHS, Dhaka.

**Live preview:** https://twinbit-redesign.vercel.app

| Page | File | What's on it |
|---|---|---|
| Home | `index.html` | Loader, WebGL hero, app showcase, stack, operating model, proof & reviews, values, careers, life gallery, CTA |
| Open positions | `careers.html` | Roles list with team filters, hiring process, application form with CV upload |
| Contact | `contact.html` | Contact routes, message form, office / map block |

It is a **static site**: plain HTML, CSS and vanilla JS. No build step, no framework, no package install.

---

## Run locally

Any static server works. Open the site over `http://` (not `file://`) so fonts, `localStorage` and WebGL behave normally.

```bash
cd twinbit-redesign
python3 -m http.server 8877
# → http://localhost:8877
```

## Deploy

The live preview is hosted on Vercel as a static project (no framework preset, no build command, output = repository root).

```bash
npx vercel deploy --prod
```

`.vercelignore` keeps `docs/`, `tools/` and this README out of the deployed site. Any static host (Netlify, Cloudflare Pages, GitHub Pages, S3) works the same way — upload the repository root.

---

## Project structure

```
index.html            Home page
careers.html          Open positions + application form
contact.html          Contact routes + message form
styles.css            Design tokens, base components, home page (shared by all pages)
pages.css             Inner-page components (careers, contact, forms)
app.js                Home page behaviour (loader, hero, scroll scenes, sliders, gallery…)
page.js               Inner-page behaviour (roles, filters, forms, copy buttons…)
hero-trail.js         WebGL2 cursor trail on the hero title + mockup
assets/
  pt.js               Page-to-page curtain transition (all pages)
  roles.js            ← EDIT: open positions data
  life/gallery.js     ← EDIT: "Life at Twinbit" photo list
  logo-letters.js     Loader logo glyphs (generated — see tools/)
  logo.png            Logo for dark mode   ·  logo-dark.png  Logo for white mode
  hero-phone.webp     Hero mockup
  apps/*.webp         App icons
  life/*.webp         Gallery photos
docs/
  DESIGN-SYSTEM.md    Tokens, grid, type, motion, component rules
  AUDIT.md            UX audit of the original twinbit.net
tools/
  build-logo-letters.py  Rebuilds assets/logo-letters.js from the logo SVG
```

External libraries are loaded from jsDelivr (pinned versions): GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13. Fonts come from Google Fonts. See `THIRD-PARTY-NOTICES.md`.

---

## Before going live — checklist

These items are **intentionally unfinished** and need a decision from the Twinbit team:

1. **Open roles are example content.** `assets/roles.js` contains six sample roles written for the design (twinbit.net listed 0 open roles when this was built). Replace them with real openings, or set `window.TB_ROLES = []` — the page then shows *"No open roles right now — send us your resume"* automatically.
2. **Forms do not send anywhere yet.** Both forms validate and show the success state in *demo mode*. To deliver submissions, set the endpoints at the top of `page.js`:
   ```js
   const FORM_ENDPOINTS = { contact: 'https://…', apply: 'https://…' };
   ```
   Any service that accepts a `multipart/form-data` POST works (Formspree, Web3Forms, Basin, or your own API). The apply form includes a file field named `cv` (PDF/DOC/DOCX, max 5 MB, checked client-side) — make sure the chosen service accepts attachments.
3. **Footer links** for *About / Values / Operating model / All apps / Privacy / Terms* still point to pages on twinbit.net.
4. **Analytics / cookie consent / Open Graph images** are not included.

---

## Editing content

### Open positions — `assets/roles.js`
```js
{
  id: 'ios-senior',              // unique, used for deep links: careers.html?role=ios-senior
  title: 'Senior iOS Engineer',
  dept: 'Engineering',           // creates/filters the team chips automatically
  type: 'Full-time',             // Full-time | Part-time | Contract | Internship
  level: 'Senior',               // Entry | Junior | Mid | Senior | Lead
  summary: 'One-paragraph pitch.',
  does:  ['Responsibility', '…'],
  needs: ['Requirement', '…'],
}
```
Team chips, counts, the "Position" dropdown in the form and the hero figure all update from this list.

### Gallery — `assets/life/gallery.js`
Add one line per photo (`src`, `alt`, optional `caption` and `tag`). The mosaic re-flows in groups of three and every photo opens in the full-screen viewer. Use `.webp`, ~1600 px on the long edge.

### Reviews — `app.js` → `const quotes`
Real App Store quotes from twinbit.net: `[quote, app name]`.

### Ratings & figures
Hard-coded in `index.html` (Proof section) and the app cards. They reflect US App Store values from Nov 2026 — update them when they change. Only verified figures should be shown.

### Hero mockup
Replace `assets/hero-phone.webp` (a device image *with* its frame, transparent background, ~900 px wide). If the aspect ratio changes, update `900/1863` in `styles.css` (`.phone` and `.hero` rules).

### Loader logo
The loader draws the logo letter by letter from `assets/logo-letters.js`. If the logo changes, regenerate it:
```bash
python3 tools/build-logo-letters.py path/to/Twinbit_logo.svg > assets/logo-letters.js
```

---

## Behaviour notes

- **Theme:** dark by default; the header toggle (or the **T** key) switches to white mode with a circular reveal. The choice is saved in `localStorage` (`tb-theme`) and applied before first paint, so there's no flash.
- **Grid:** a 12-column grid with page margin `--mx` and gutter `--gut`. Four hairlines (one every 3 columns) are drawn on desktop; two (left + centre) on ≤ 820 px. Content blocks start on those lines and section headings never cross the centre line (≥ 561 px).
- **Motion:** Lenis smooth scroll + GSAP ScrollTrigger. Everything respects `prefers-reduced-motion` (no loader, no trail, no scroll scenes, instant transitions).
- **Hero trail:** needs WebGL2 with float render targets. Without it (or with reduced motion) the regular DOM hero is shown. The animation loop sleeps when idle or off-screen.
- **Page transitions:** internal `.html` links are intercepted by `assets/pt.js`; a flag in `sessionStorage` tells the next page to cover itself before first paint and reveal once ready. Arriving on the home page this way skips the long loader.

## Browser support

Latest two versions of Chrome, Edge, Safari (macOS + iOS) and Firefox. Uses CSS `color-mix()`, `subgrid`, `:has()`, View Transitions (progressive — falls back to an instant theme swap).

Responsive checks were done at 360, 390, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920 and 2560 px wide.

## License & credits

- **Code** (HTML, CSS, JS, tools) is released under the MIT License — see `LICENSE`.
- **Brand assets are not covered by the MIT License:** the Twinbit name and logo, app icons, app screenshots, team photos and written content are © Twinbit Limited.
- Third-party code and fonts keep their own licenses — see `THIRD-PARTY-NOTICES.md`.
