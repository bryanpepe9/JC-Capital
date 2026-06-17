# JC Capital — Website

A premium, single-page corporate site for **JC Capital** — strategic advisory for
real estate, hospitality and branded living. Dark luxury aesthetic, editorial
typography, GSAP scroll animations and a Three.js global-network hero.

## Tech stack
- **Vite** — build tooling / dev server (no framework, vanilla JS modules)
- **GSAP + ScrollTrigger** — scroll-driven reveals, counters, hero intro
- **Three.js** — the rotating global-network globe in the hero
- Plain semantic HTML + CSS custom properties (no UI framework)

## Getting started
```bash
npm install      # install dependencies
npm run dev      # local dev server → http://localhost:5180
npm run build    # production build → /dist
npm run preview  # preview the production build
```

## Deploying
Run `npm run build` and deploy the contents of **`/dist`** to any static host
(Netlify, Vercel, Cloudflare Pages, S3, traditional hosting, etc.). It is a fully
static site — no server required.

## Project structure
```
index.html              # all markup + section content (edit copy here)
src/
  styles/
    base.css            # design tokens (colors, type, spacing), reset
    components.css       # header, nav, buttons, cursor, form, footer
    sections.css         # per-section layout (hero, cards, stats, etc.)
    responsive.css       # tablet & mobile breakpoints
  js/
    main.js             # app entry — preloader, boot, hero intro
    hero.js             # Three.js global-network globe
    network.js          # 2D canvas constellation (Global Network section)
    animations.js       # GSAP reveals, headline splits, stat counters
    nav.js              # header behaviour, mobile menu, smooth scroll
    cursor.js           # custom cursor (desktop only)
    form.js             # contact form validation + success state
public/
  images/               # drop real images here (see images/README.md)
  favicon.svg           # replace with the official mark
```

## What to replace (all marked with comments in the code)
1. **Images** — see [`public/images/README.md`](public/images/README.md).
   Add `jennifer-chen.jpg` (founder portrait) and `og-image.jpg` (social share).
   Until then, a labeled placeholder block is shown for the portrait.
2. **Logo** — the header/footer use a text logo (`JC Capital`). Swap for an
   `<img>` of the real logo in `index.html` if available.
3. **Contact form** — currently shows a success message but does **not** send.
   Wire it to a backend or service (Formspree, Netlify Forms, an API) in
   `src/js/form.js` (instructions are in the file header).
4. **Copy & contact details** — edit directly in `index.html`. Current contact
   details (email, phone, WhatsApp, address, socials) are taken from the existing
   site and can be updated in the Contact section + footer.
5. **SEO / meta** — title, description and Open Graph tags are at the top of
   `index.html`.

## Accessibility & performance notes
- Respects `prefers-reduced-motion` (animations + WebGL loop are disabled/static).
- Semantic landmarks (`header`, `main`, `nav`, `footer`), labelled form fields,
  keyboard-dismissable mobile menu, `aria` attributes on interactive chrome.
- The Three.js globe pauses when scrolled off-screen to save battery, caps
  device-pixel-ratio at 2, and uses a lighter point count on mobile.
- The largest dependency is Three.js (~170 KB gzip). If the hero globe is ever
  removed, drop `three` from `package.json` and `src/js/hero.js` to shrink the
  bundle substantially.
