# twinbit.net — Landing page UX audit
Audited 11 Nov 2026 · 1440×900 desktop + 390×844 mobile · page height 5,310 px desktop / 6,115 px mobile

## Summary
The site is clean, honest and on-brand: "No client work. Just products." is a strong position. The problems are **sameness and weak hierarchy**, not broken UI. Five of nine sections use the same bordered card grid on the same background, so the page reads as one long template. Proof is shown three times in three formats, the two audiences (App Store users vs. job seekers) compete in every CTA, and almost nothing reacts to the user.

Score: **6.2 / 10**. Content is good; composition, rhythm and interaction are below the standard of a studio whose apps reach millions.

## What works (keep)
| | Finding |
|---|---|
| ✅ | Clear value prop in the H1 ("We build iOS apps used by millions.") and an honest subline. |
| ✅ | Real product imagery (app icons, screenshot, team photos) instead of stock. |
| ✅ | "Only verified figures shown." Restraint builds trust. Keep it. |
| ✅ | Skip link, alt text on team photos, semantic H1→H2→H3 order. |
| ✅ | Direct App Store deep links for every app. |

## Issues, by severity
### High
1. **Two audiences, one funnel.** The header has "Explore Apps" *and* "View Open Roles", the hero has "Explore Our Apps" *and* "View Careers", and the closing CTA is careers only. A visitor can't tell if this is a product site or a hiring site. **Fix:** say up front that the site serves both, with one primary action per section. Hero = products; the final third = careers.
2. **Repeated proof, diluted.** 5 / 40K+ / 4.6★ appears in the hero and again as four "monument stat" cards (adding "Global", which is not a number). **Fix:** show proof once, larger, next to the user reviews that back it up. The old site had six real review quotes; the new one dropped all of them.
3. **Card-grid monotony.** Technologies (6 cards), Apps (5 cards), How we work (6 cards) and Benefits (6 tiles) are identical bordered rounded boxes. Nothing stands out because everything has the same weight. **Fix:** give each section its own composition (console, horizontal rail, dial, index list, mosaic).
4. **Apps are the product, but they sit below a tech-capabilities grid.** Generic capability copy ("Scalable API Systems") comes before the actual apps. **Fix:** put apps directly after the hero and make them the most interactive section.

### Medium
5. **Odd grid.** 5 apps in a 3-column grid leaves an empty slot at 1440 px, so the layout looks unfinished.
6. **Icon-topper tiles.** Rounded-square icons above every tech card and benefit are template filler. They don't help scanning.
7. **Hero phone mockup is cramped.** The "Live Wallpaper Maker 4K" overlay sits on top of the in-app UI text, making both unreadable (`Lifestyle · 4.6★` collides with list items).
8. **Pipeline is static.** Research → Design → Build → Publish → Analyze → Improve is the company's real differentiator, but it's shown as six inert pills.
9. **Gradient CTA panel** (orange→peach with a glow) clashes with the dark system. It's the loudest element on the page and has the least information.
10. **Low-contrast body text.** Grey 14–15 px body copy on near-black cards (~#8a8f99 on #14161b ≈ 5.4:1) passes AA but feels faint at length. Some captions (11 px, "Only verified figures shown") are below a comfortable size.

### Low
11. **Mobile.** Hero icons stack under the copy; 24 links/buttons are smaller than 44 px tall; footer turns into a long centered list.
12. **No motion language.** Hover effects are just colour changes; no entrance choreography, no scroll feedback, no loading moment.
13. **Typography.** Space Grotesk + Manrope are both neutral geometric sans. The pairing has no contrast and no personality.
14. **Footer** repeats nav links but misses local time / office context and has no final brand moment.

## Redesign strategy
| Section | Before | After |
|---|---|---|
| Hero | split copy + icon cluster | editorial headline + live phone + giant `twin`*bit* wordmark on a bit-stripe band |
| About | — | word-by-word scroll statement: "No client work…" |
| Apps | 3-col card grid (gap) | pinned horizontal rail, 5 notched cards, App Store CTAs |
| Technology | 6 icon cards | interactive console: list + live detail panel, auto-advancing |
| Operating model | 6 static pills | scroll-driven dial that rotates through the loop |
| Proof | repeated stats | one notched staggered stat row + real review marquee |
| Values | 6 cards | index list with hover reveal |
| Careers | gradient card + icon tiles | split: roles as magnetic chips, benefits as a bit list |
| Life | 3 photos | clip-reveal mosaic with parallax + lightbox |
| CTA / Footer | gradient box | statement CTA + giant wordmark footer, Dhaka local time |
