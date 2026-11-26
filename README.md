# FSudoLab — scrollytelling site

Next.js 16 site told as six chapters. The FSudoLab signature violet blob, styled like the hero blob (soft, matte, rounded lobes), follows the reader from chapter to chapter.

> **Brand rule:** the violet/purple blob is the company signature. Never remove it from any page or redesign.

## Run locally

```bash
corepack pnpm install
corepack pnpm dev        # http://localhost:3000  (phone on same Wi-Fi: http://<your-PC-IP>:3000)
```

## How the story works

| Chapter | Section | What happens as you scroll |
|---|---|---|
| Intro | `#intro` | **Step-by-step brand intro**, a full-screen layer over the site (the page doesn't move while it plays). Each scroll / swipe up / ↓ plays the next beat as a smooth animation; scrolling up goes back one beat: (1) the F logo shines, (2) it becomes the name FSudoLab, (3) folds back into the F, (4) the circuit dots fly in and it melts into a glowing blob that stays alive while it waits — flowing outline, breathing, floating, and every few seconds easing into a new form (three lobes, egg, four lobes, five-petal ripple, a droplet that buds out and pulls back; `FORMS` in `intro-section.tsx`), (5) the blob swallows the screen, then a hole with a glowing rim opens and the hero comes into focus through it. The navbar is hidden while it plays; "Skip intro" plays the ending straight away. Plays once per page load (a refresh brings it back); links to a section and reduced-motion users skip it. Beat timings: `STOPS` / `BEAT_MS` at the top of `intro-section.tsx`. |
| Hero | `#top` | The original 120-frame hero blob animation plays. On laptops/desktops it fades out over the first part of the scroll and reveals the moving blob in the same spot, which travels down. On phones/tablets the artwork stays and the moving blob appears just below. |
| 01 The spark | `#story` | **Pinned.** The headline writes itself word by word; the blob grows from a small lump into its full shape. |
| 02 The method | `#about-us` | **Pinned.** Discover → Design → Deliver light up in turn and the blob **turns into each word's shape**: a sparkle (Discover), a cut gem (Design), a package box that hops (Deliver). It melts back into the blob when you leave. A progress line fills. |
| 03 Selected work | `#projects` (`#work` = finished state) | **Deliver → project handoff** (all screen sizes): the section holds for ~1.2 screens and plays one reversible timeline — the Deliver box turns its face to you (0–20%), widens onto the code window's measured bounds while navy turns warm white (20–40%), the real window takes over at the same outline (38–45%), code types in (40–52%), a close-up of the chapter indicator pulls back to the homepage screenshot (55–80%), and "FSudoLab website / Studio project" settles in (80–100%). 3D side: `readHandoff()` in `BlobScene.tsx` + `uFace`/`uInk` in `shaders.ts`; HTML side: `components/projects-section.tsx`. Featured project content and image: `story.work` in `lib/story-content.ts`, `public/work/`. It runs on every screen size (on phones the title sits above a full-width frame); only reduced motion shows the finished project directly. |
| What we offer | `#services` | Pinned film strip (`components/services-section.tsx`): the section holds still and the four service cards glide sideways as you scroll; the middle card is lit, the others dimmed; a counter and line show progress. Blob away. |
| The film | `#film` | The team video in its own scene, like the chapter films on thefinestpour.com (`components/video-section.tsx`): the section holds while the video grows from a rounded window to full screen and a short caption settles in bottom-left. Plays muted while on screen (sound and play/pause buttons), pauses when you scroll away. Copy in `story.film`. |
| 04 The people | `#insights` | **Meet our team** carousel (`components/team-section.tsx`): one card per member (the video now has its own scene just before). Active card centred and in colour, neighbours smaller and grey; arrows, dots, swipe, ← → keys, or click a side card. Blob away. |
| Our story | `#our-story` | Pinned paragraph that lights up word by word as you scroll, with blob shapes and glass words drifting past at different depths (`components/story-section.tsx`, copy in `story.ourStory`). |
| 05 The circle | `#partners` | **Dark navy** pinned partner strip (`components/partners-section.tsx`): the section holds still while the strip glides sideways; the partner in the middle lights up on a bright liquid-glass tile with a violet glow behind it. Each partner opens a glass pop-up. The blob's partners anchor is at the end of the section, so it beams back in only as Contact arrives. |
| In their words | `#testimonials` | Dark section with one quote at a time on a liquid-glass card (soft blobs behind it), changing every 7 s (paused on hover/focus) or via the partner chips (`components/testimonials-section.tsx`). **The quotes are placeholders** — edit `story.testimonials` in `lib/story-content.ts`, and get permission before publishing real ones. |
| 06 Your turn | `#contact` | The blob beams back in and untwists, large behind the closing headline. |

- **Scene-by-scene scrolling** (`components/story/scene-stepper.tsx`): in the story part, one scroll / swipe / ↓ glides the page to the next scene and its animations play out during the glide — hero → Chapter 01 (headline written) → Discover → Design → Deliver → lands on Selected work. **From Selected work down (Insights, Partners, Contact, footer) the page scrolls freely**; scrolling back up from the top of Selected work glides into the story again. A fast fling moves one scene; scrolling up goes back one. Navbar links, the scrollbar and find-in-page still work. Off for reduced motion. Where free scrolling starts: `freeFrom()`; glide speed: `dur` in `glide()`.
- **Chapter rail** (desktop, right edge) shows the current chapter; click a dot to jump. On phones/tablets a thin progress line runs along the top.
- **Srut-style feel (from Selected work down)**: slow, eased wheel/trackpad scrolling (`components/story/smooth-scroll.tsx`, `EASE`; touch swipes keep the phone's own momentum; off for reduced motion); pinned sideways strips share `components/story/use-pinned-track.ts` (`pace` = how slow); Contact and the footer have a soft light that follows the mouse — or your finger on touch screens, drifting on its own otherwise (`components/spotlight.tsx`); the footer has a link row and a huge FSudoLab wordmark. The intro's hint reads "Flow through FSudoLab with a slow scroll".
- **Liquid glass** (`.lg` in `app/globals.css`, `components/liquid-glass.tsx`): the navbar, the phone menu (and its rows and button) and the cookie card are clear tinted glass with a bright rim and a soft blur, so the page shows through as it scrolls. In Chrome / Edge (phones included) they also bend the background at their rounded edges like a lens (an SVG displacement map drawn per element; strength: `BEZEL` / `STRENGTH`). Safari and Firefox get the same look without the bending. If the reader asks for less transparency, or the browser has no blur, they turn into solid panels.
- **Section reveals** are tied to the scroll in browsers that support scroll-driven animations (they fade in as you scroll in and back out as you scroll up); other browsers play them once.

## Editing team, services and partners

All in `lib/story-content.ts`:
- `story.insights.members`: one entry per member (`name`, `role`, optional `photo` such as `/team/ana.webp` placed in `public/team/`). Without a photo the card shows the person's initials on a violet gradient.
- `story.services.items`: name, short text and an `example`.
- `story.partners.items`: `about` (who they are), `together` (what you built with them) and `link` (their site). Empty fields are left out of the pop-up.

## Where things live

| Part | File |
|---|---|
| Chapter copy | `lib/story-content.ts` |
| Brand intro (timeline, logo, wordmark) | `components/intro-section.tsx`, styles in `app/globals.css` (section "Brand intro") |
| Hero signature blob (120-frame sequence) | `components/hero-section.tsx`, `public/FSudoLabBackground/` |
| **Blob poses per chapter × screen size, motion tuning** | `components/blob/config.ts` |
| Blob renderer + per-frame loop | `components/blob/BlobScene.tsx` |
| Blob look (colours, lighting, lobes) | `components/blob/shaders.ts` |
| Quality tiers + FPS monitor | `components/blob/quality.ts` |
| Background colours, navbar theme, CSS fallback blob | `components/blob/BlobStage.tsx` |
| Pinned chapters | `components/story/spark-chapter.tsx`, `components/story/method-chapter.tsx` |
| Scroll progress hook (`--p` CSS variable) | `components/story/use-scroll-progress.ts` |
| Chapter rail + mobile progress line | `components/story/chapter-rail.tsx` |
| Scene-by-scene scrolling | `components/story/scene-stepper.tsx` |
| Scrub / reveal styles | `app/globals.css` (section "Scrollytelling") |

## Tuning cheat-sheet (`components/blob/config.ts`)

**Chapter poses** — `ANCHORS`. Each chapter (or each step inside a pinned chapter) has `data-blob-anchor="<id>"`; the blob glides to that pose as it reaches the middle of the screen.
- Breakpoints: `sm` < 640 px, `md` 640–1023, `lg` 1024–1599 (base), `xl` ≥ 1600. `md` overrides `lg`, `sm` overrides `md`, `xl` overrides `lg`.
- Pose fields: `x`/`y` position (-1…1 of the viewport), `s` size, `d` how far the lobes push out, `f` lobe count (lower = fewer, bigger lobes), `v` how fast the shape changes, `o` opacity, `h` tone (0 deep violet → 1 lighter orchid), `r` tilt.

**Teleport** — pose field `b` (0 = here, 1 = beamed away). Right after Deliver the blob twists and squeezes into a thin glowing beam and vanishes on the spot; it stays away through Selected work, Insights and Partners (`work` / `insights` / `partners` anchors have `b: 1`), then beams back in and untwists behind the contact headline. Scroll-linked, so scrolling up reverses it. The effect is in `shaders.ts` (search "Teleport").

**Colours** — the blob palette in `shaders.ts` is measured from the hero frames (plum `#2b1b47` → violet `#58357d` → mauve `#b588b7`); the intro's glowing core uses the same colours.

**Chapter colour blends** — long eased gradients that straddle each boundary, built in `BlobStage.tsx` (`SEAM`, about 30% of the screen height).

**Shapes** — pose fields `m1` (sparkle), `m2` (gem), `m3` (box): 0 = blob, 1 = fully the shape. Only the `method-*` anchors use them. Shape outlines are in `shaders.ts` (`sparkleR`, `gemR`, `boxR`).

**Animations** — `TUNING`: `breathe`/`breatheSpeed` (size pulse), `stretchPerSpeed`/`maxStretch` (stretch when scrolling fast), `wobbleKick`/`squashStiffness`/`squashDamping` (jelly wobble when it changes shape), `introFrom` (pop-in on load), `gemSpin`, `follow`.

**Pinned chapter length** — the `height` on the `<section>` in `spark-chapter.tsx` (`220svh`) and `method-chapter.tsx` (100svh per step); Longer = slower story.

## Testing helpers (URL flags)

- `?blobtier=high|medium|low` — force a quality tier (and disable auto-downgrade).
- `?blobfallback` — force the CSS fallback blob.

## Accessibility & devices

- `prefers-reduced-motion`: no breathing, wobble, stretch, hop or pop-in; the blob still changes shape per chapter but holds still; text is shown in full (no scrubbing).
- Data-saver (`Save-Data` / `prefers-reduced-data`) or no WebGL: lightweight CSS blob that still follows the scroll.
- Rendering pauses while the tab is hidden or the video is fullscreen.
- The blob never takes pointer or touch input, so the page always scrolls normally.
- Checked at 320, 382, 768, 1024, 1280 and 1920 px wide: nothing scrolls sideways; the method steps wrap on very narrow phones; on tablets the navbar's Contact button sits next to the menu button.

## Assets & licences

- Hero blob frames, logo, partner logos, team video — FSudoLab's own assets (supplied with the project).
- Moving blob — generated in code (no external model).
- Simplex noise GLSL in `components/blob/shaders.ts` — Ashima Arts / Stefan Gustavson, MIT licence.
- Libraries — three.js (MIT), @react-three/fiber (MIT), Next.js (MIT).
