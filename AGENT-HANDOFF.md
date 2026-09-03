# Agent handoff: Yousef Turk portfolio

Read this before touching the site. Then read `content/VOICE.md`. If a new request conflicts with the locks below, the locks win unless Yousef explicitly says to change them.

Public site: `C:\Users\youse\OneDrive\Desktop\design-library\site`
Workspace root is often Desktop. Do not treat Desktop as the app.
Dev: `npm run dev` in `site`. Next 16.3.2, React 19, Tailwind v4, Motion, Three. `http://localhost:3000`
Public share surface is `/lab`. He does not send GitHub.

Who: Grade 12, Liwa International School Al Mushrif, Abu Dhabi. Applying to MBZUAI. Loves Marvel, identifies with Tony Stark (said so himself, 2 Sep 2026). One paragraph on home covers it. Do not turn the site into a Marvel theme.

---

## Hard locks

- First person, contractions, sentence case. Interview test: if you would not say it in an interview, rewrite it.
- No em dashes in user-facing copy.
- Accent `#43ab92` (`--green-500`, `--glow-accent` in `app/globals.css`).
- Matter 300/400 via `next/font/local`. Geist Mono for mono. Do not switch the site to Inter.
- `html.dark` + `localStorage` key `appearance`. Boot script is `APPEARANCE_BOOT` in `lib/appearance.ts`. Wire through `AppearanceSync` and `ThemeToggle`.
- Motion ≤300ms except the one slow Dia floor reveal.
- Press scale `0.96`. Hover gated with `@media (hover: hover)`. `:focus-visible` rings. No `transition: all`.
- CoolerScrollbar on desktop only (already in root layout).
- Lenis smooth scroll (`components/SmoothScroll.tsx`) on desktop only, same `(hover: hover) and (min-width: 768px)` gate. `lerp: 0.14`, wheel only, no `syncTouch`. It drives `window.scrollTo`, so anything reading `window.scrollY` keeps working. Programmatic scrolls go through `scrollPageTo` in `lib/smooth-scroll.ts`, never raw `window.scrollTo`. Do not turn it on for touch. Do not float the lerp below 0.12.
- `html.js` is added by a one-line head script in `app/layout.tsx`. `RevealList` rows are hidden by CSS only under `html.js`, so no-JS still reads the page.
- Photo in the home orb: hard circle, `/yousef.jpg`, no Ghosty, no dotted overlay. `OrbMark` with `portrait` on home. Lab/writing orbs are the Jakub thinking orb, not the photo.
- MetalFx is not on home. ShareBar on `/lab` and `/writing` may keep metal.
- Do not name Arlan or Bakai on the public site. Folder names stay internal. Public credit: Taste Labs, Jakub, Lucas Jin, Dia (`diabrowser.com`) when that is the actual source.
- No fake internships, ID photos, ID numbers, lettermarks.
- No phone number.
- Honest dates only.
- Campus mailto: `hello@yousefturk.com`. Personal mail icon: `yousefturk.info@gmail.com` in `content/social.ts`.
- Socials: X `yousefturkk`, Kaggle `yousefturk`, LinkedIn `/in/yousefturk`. Kaggle icon is the official k from vectorlogo.zone, not a fake connected-K.
- Public copy must not mention GitHub bans. Interview-safe: he does not send GitHub; the writeup is the URL.
- Writing is a subpage + button, not a home section.
- No components shelf on `/lab`. `TOC_SHELVES` is `writeups`, `papers`, `designs`, `research`.
- School notes removed from `/lab`. Empty School shelf stays empty. Do not put DT / intro-programming / “this lab” on Experiences.
- Writeups shelf: `reflow-is-low-dimensional` is live. Linear ridge lost to a one-line CSS rule. Histogram gradient boosting on the same leave-one-page-out split cuts median error from 26.7px to 7.3px (`research/reflow-dynamics/train_stronger.py`). Do not revert the page to the old "negative result" blurb.
- Marvel stills: Yousef overrode this on 2 Sep 2026 for one image only. `/stark.png` (Iron Man 2008, Jericho demo frame) sits above the home quote as a `<figure class="still">`. Do not add more stills. Do not add Marvel anywhere else. If he asks to go back, the Bourdain list is still in `content/home.ts`, swap `stark` for `bourdain` in `app/page.tsx` and drop the `<img>`.
- Never treat a new requirement as a pivot that deletes old work unless he explicitly asks to remove something.

---

## Skills that built this site

Two layers. Do not reinstall the library packs. They already exist as workflows / copies.

### Voice and writing (must use)

Named in `content/VOICE.md`:

- `unslop`
- `letter-landing`
- `better-writing`

### Motion, type, UI craft (used on the live site)

From `design-library/design-library/CATALOG.md`. Do not reinstall.

Always-on motion / taste gates:

- `twelve-principles-of-animation`
- `gsap-foundations-checklist` (taste pass: no Inter-only, no `#000` default, no AI purple fills)
- `arknow-motion-skills`
- `make-interfaces-feel-better`
- `fixing-motion-performance`

Jakub / better-* (the live chrome is Jakub-derived):

- `better-accessibility`, `better-colors`, `better-interface`, `better-layout`, `better-typography`, `better-ui`, `better-writing`, `interface-review`

Taste-skill (judgment on redesigns; do not restyle the live site into Awwwards glass):

- `design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`, `full-output-enforcement`, `minimalist-ui`, `industrial-brutalist-ui`

Other packs in the catalog that shaped studies, not the public IA:

- `refined-design-craft`, `maxime-heckel-shaders`, `oa-design`, `oklch-skill`, `impeccable`
- emilkowalski: `animate`, `animation-vocabulary`, `improve-animations`, `review-animations`, …
- ui-skills: `baseline-ui`, `improve-ui`, `fixing-accessibility`, `fixing-metadata`

Companion indexes (library, not the Next app):

- `design-library/design-library/CATALOG.md`
- `design-library/design-library/components/REGISTRY.md`
- Desktop `COMPONENT-INDEX.md` if present (Refero, scrollbar-but-cooler, etc.)

### Agent skills installed later (skills.sh)

Copied to `C:\Users\youse\.agents\skills` and `C:\Users\youse\.cursor\skills`. Use them. Do not use them to restyle home.

Thinking: `brainstorming`, `writing-plans`, `using-superpowers`, `grilling`, `grill-me`, `research`, `prototype`, `domain-modeling`, `wait-what`, `discernment-nudge`

Taste / frontend: `design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects`, `stitch-design-taste`, `full-output-enforcement`, `frontend-design`, `web-design-guidelines`, `writing-guidelines`

Discovery: `find-skills`

Research tooling exists (`ai-research-explore`, `analyze-project`, `paper-context-resolver`). That is not a license to invent papers for `/lab`.

---

## Routes

| URL | File | Job |
| --- | --- | --- |
| `/` | `app/page.tsx` | Home: name typer, photo orb, Stark still + quote, writeups teaser, experiences, campus, learning, research list |
| `/lab` | `app/lab/page.tsx` | Share surface. Shelves from `TOC_SHELVES` |
| `/lab/[slug]` | `app/lab/[slug]/page.tsx` | One vault entry. Playground only if `entry.playground` is set |
| `/writing` | `app/writing/page.tsx` | Writeups + notes (`shelf === "papers"`) |

Redirects in `next.config.ts`: `/vault` and old slugs → `/lab/...`; `/writeups` → `/writing`; school slugs → `/lab`.

---

## Live components (actually mounted)

Root layout (`app/layout.tsx`):

- `ThemeToggle`
- `AppearanceSync`
- `SmoothScroll` (Lenis, desktop only; owns same-page hash links inside `#content` with a `-32px` offset to match `scroll-mt-8`)
- `CoolerScrollbar` (`components/CoolerScrollbar/Scrollbar.tsx`, clicks call `scrollPageTo`)
- `DiaAurora` (single floor glow, DiaGradient inside). After scroll, glow gone until footer. `DiaFooterGlow` is a re-export from `DiaAurora.tsx`
- `#content` wrap
- `SiteFooter` (campus mailto + socials)

Home:

- `TyperLine` (`components/arlan/TyperLine.tsx`) on the name
- `NavLiquid` (Jakub gooey `Liquid` for Lab / campus mail)
- `WritingBtn`
- `SocialLinks`
- `OrbMark` `portrait`

`/lab` and `/writing`:

- `OrbMark` (thinking orb, not photo)
- `CloseMark`
- `ShareBar` (MetalFx silver buttons)

`/lab/[slug]`:

- same chrome + optional `Playground`

Lists on home, `/lab`, `/writing`:

- `RevealList` (`components/RevealList.tsx`). Rows rise 8px / 240ms when they scroll into view, 40ms stagger per batch, capped at 280ms. Replaces the old mount-time `.enter` stagger on those lists. After the design library's `scroll-blur-reveal` recipe, pulled down to the site's motion locks (no blur, no 56px, no 800ms). `.enter` CSS still exists for anything not wrapped.

Content modules (not components, but the next agent will edit these more than JSX):

- `content/VOICE.md`
- `content/home.ts` (Home quote is now `stark`, `starkQuotes[0]`, "run before you can walk", with the `/stark.png` still. Real lines only, indices 0 to 4 in the comment. `bourdain` / `bourdainQuotes` 0 to 7 stay in the file for swapping back. `experiences` is ordered by impact, not date, as of 2 Sep 2026. The rule is in a comment above the array: research output, then wins, then current roles, then builds, then courses. Dates live in `who` so reordering never hides them. New rows go where the rule puts them, not at the top.)
- `content/vault.ts` (catalog. `labPath()`, `writeups`, `writing`, `projects`). `cell-steering` was rewritten 2 Sep 2026 to explain itself line by line: attractor, VAE, neural SDE, PPO, Perturb-seq, and K562 are each glossed in the sentence that uses them. Keep it that way. Do not compress it back into jargon.
- `content/social.ts`
- `content/library.ts` (internal study metadata for playgrounds, not a public shelf)

Theme / appearance:

- `lib/appearance.ts`
- `app/globals.css`

---

## Component libraries on disk (not a public shelf)

These are vendored studies. Public credit names Jakub / Dia / Taste Labs. Internal folders still say arlan / bakai. Do not print those names on the site. Do not add a Components shelf to `/lab`.

### Jakub (public credit: Jakub)

- `components/jakub/orbs/` — `ThinkingOrb`. Used via `OrbMark` on lab/writing.
- `components/jakub/gooey/` — liquid nav. Used via `NavLiquid`.
- `components/jakub/metal/` — MetalFx. Used via `ShareBar` only on share pages, and inside `Playground`.

### Dia (public credit: Dia / diabrowser.com)

- `components/arlan-vault/code/dia-gradient/DiaGradient.tsx`
- `components/DiaAurora.tsx`

### Typer / geometry (Lucas Jin credit when the page is that work)

- `components/arlan/TyperLine.tsx`, `typer.ts`, `typer.css`
- `components/arlan/Squircle.tsx`, `superellipse.ts`, `GhostReveal.tsx`, `Poster.tsx`
- Duplicate copies under `components/arlan-vault/code/typer` and `squircle`

### CoolerScrollbar

- `components/CoolerScrollbar/` — layout only, not a lab demo on `/lab`.

### Playground switch (`components/Playground.tsx`)

Wired to `PlayKind` in `vault.ts`. None of the current live vault rows set `playground`. Do not add a playground to a notes page to “fill” lab.

Play kinds include: typer, squircle, ghosty, arcade-pixel, holo, pixel-brushes, fade-motion, liquid-ui, kinetic-typography, ransom-note, chroma-glow, emboss, color-depth, sandbox, dia-gradient, vector-editor, amo, midjourney, orb, metal, gooey, scrollbar, glossy, glow, bevel, flat, qr, athlos, loom, fade-grid, warp-grid, ring-letters, acme-login, wave-grid, drag-button, op-grid, island, accounts, pipeline, kanban, list, icons, buttons, charts, pie, bar, line, dropdown, dialog, loader, sidebars, fohe, oymo, spina.

Implementations live under:

- `components/arlan-vault/code/<study>/`
- `components/bakai-lab/` (`canvas.tsx`, `chrome.tsx`, `grids.tsx`, `Buttons.tsx`, `FadeGrid.tsx`)

`content/library.ts` describes those studies. Keep them off `/lab` unless Yousef asks for a specific study page with credit.

---

## Live vault rows

In `content/vault.ts` now:

- `floor-worth-raising` — papers. Taste Labs RFR note. Body now says grade 12 (fixed 2 Sep 2026 during a copy pass).
- `taste-is-the-thing` — papers
- `train-on-taste` — papers
- `cell-steering` — research. GRC paper. PDF at `/research/cell-steering-grc.pdf`

Empty on purpose: `designs`, components (not in TOC).
Writeups: `reflow-is-low-dimensional` (updated 2 Sep 2026 after stronger training).

Home Writeups section shows the empty honest copy when `writeups.length === 0`.

---

## How to add a real writeup

1. Put a page he can stand behind. No fake notebook.
2. Add a `VaultEntry` with `kind: "writeup"`, `shelf: "writeups"`, honest `date` / `when`.
3. It appears on home, `/lab#writeups`, and `/writing`.
4. Optional `playground` only if the page is actually a component study and public credit is correct.

---

## Do not continue from this chat

This conversation also wandered into research pitches. Those are dead. Do not scaffold them from this handoff:

- Residual CLIP / Are.na crawlers
- Page gym / HTML Playwright grader as a paper
- Household-day robot exam, DimOS clones, FetchMan clones
- Stripping licenses or presenting other people’s open source as his

Other research that already exists on disk (`design-library/labs`, `research/subq-cad`, `research/arc-agi-3`) is separate from the public site. Do not dump it onto `/lab` as a writeup until he has a page he will send.

---

## Sensible next work on the site (only if he asks)

- A real writeup row when there is a pipeline or notebook
- Copy pass done 2 Sep 2026 (home intro, Writeups empty state, Campus, Learning, six experience rows, `/lab` intro and shelf empties, grade 11 fix). Home now says "I don't send GitHub" once, in the Writeups block, not twice.
- Research candidates for Taste Labs live in `design-library/research-ideas/tastelabs-projects.md`. That is a planning doc, not a `/lab` page. Do not scaffold from it without him picking one.
- Visual QA in the browser after any UI change: home, `/lab`, `/writing`, one slug, light and dark, 390px width
- Keep ShareBar metal off home

---

## Quick file map

```
site/
  app/layout.tsx, page.tsx, globals.css
  app/lab/page.tsx, [slug]/page.tsx
  app/writing/page.tsx
  content/VOICE.md, home.ts, vault.ts, social.ts, library.ts
  components/   (live chrome at root; jakub/, arlan/, arlan-vault/, bakai-lab/, CoolerScrollbar/)
  components/SmoothScroll.tsx, RevealList.tsx
  lib/appearance.ts, smooth-scroll.ts
  fonts/Matter-*.woff2
  public/yousef.jpg, stark.png
  next.config.ts
  AGENT-HANDOFF.md   ← this file
```
