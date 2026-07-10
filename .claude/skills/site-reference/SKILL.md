---
name: site-reference
description: Reference for haydencscott.com — a single-page static site with a live Stripe payment flow, GitHub-to-Netlify deploy pipeline, and a Cinzel/Inter typography system. Use before making any change to files in this website folder (index.html, pay.html, thank-you.html, netlify/functions, visuals/, netlify.toml, package.json).
---

# haydencscott.com — Site Reference

Personal site for Hayden C Scott (touring Music Director / drummer / composer). Plain static HTML/CSS/JS — no build step, no framework, no bundler.

## File structure

- `index.html` — the whole one-page site (hero, Music, Video, Visuals, Credits, Services, Contact, payment modal, lightbox)
- `pay.html` — standalone Stripe Checkout entry form (amount + note), linked from the payment modal's "Pay by Card (Stripe)" option
- `thank-you.html` — Stripe success redirect page
- `netlify/functions/create-checkout-session.js` — serverless function that creates the Stripe Checkout Session. Must stay at this path (`netlify/functions/`) because `netlify.toml` points there.
- `netlify.toml` — `publish = "."`, `functions = "netlify/functions"`
- `package.json` — declares the `stripe` npm dependency (Netlify installs it automatically on build since the repo is Git-connected; no local `node_modules` needed)
- `visuals/` — photo gallery source images for the Visuals section (lowercase, no trailing space — the folder was originally named `Visuals ` with a trailing space and got renamed)
- `profile2.jpg` — hero image. Must stay **lowercase** — it was originally `Profile2.jpg`, which worked on macOS (case-insensitive filesystem) but 404'd on Netlify's case-sensitive Linux servers. Any new image reference must match the actual on-disk filename case exactly.

## Deployment pipeline

- GitHub repo: `haydencscott84-star/haydencscott` (public)
- Netlify project: `sage-profiterole-922b4b`, custom domain `haydencscott.com`, **Git-connected** (not drag-and-drop) with auto-publish on `main`
- This machine has a GitHub Personal Access Token cached in macOS Keychain (`credential.helper = osxkeychain`, set locally on this repo), so `git push origin main` works directly from here with no manual auth step
- Standard flow for any change: edit → verify locally (Python static server via the `website` preview launch config, or ask the user to review) → `git add -A && git commit && git push origin main` → Netlify auto-deploys in under a minute
- The user has said they want to review changes locally before they go live — hold off on pushing until they explicitly confirm, unless told otherwise for a given session

## Stripe payment integration

- `STRIPE_SECRET_KEY` is set as a Netlify environment variable (Project configuration → Environment variables), **not** in any committed file
- Currently using the **live** key (`sk_live_...`) — a test key was used earlier during setup and validation
- Flow: `pay.html` form → POST to `/.netlify/functions/create-checkout-session` → creates a Stripe Checkout Session for the user-entered amount (min $5) → redirects to Stripe-hosted checkout → success goes to `thank-you.html`, cancel returns to `pay.html?canceled=true`
- Stripe fee is 2.9% + $0.30 per US card charge (+1% for international cards, +1% for currency conversion). This is deducted automatically before funds hit the Stripe balance — payouts to the bank are separate and free (standard payout) or ~1% for Instant Payout
- **Never** put a live or test secret key value directly in code, commit it, or paste it into chat — only ever into the Netlify environment variable field. If a live key is ever exposed, roll it immediately in Stripe Dashboard → Developers → API keys, then update the Netlify env var and redeploy
- The site also offers Venmo, Zelle, and PayPal as no-Stripe-fee alternatives in the same payment modal — worth suggesting for large invoices to avoid the ~3% Stripe cut

## Design system

- Palette: `--black: #0a0a0a`, `--dark: #111111`, `--card: #1a1a1a`, `--accent: #c8a96e` (gold), `--text: #e8e8e8`, `--muted: #888`
- Fonts: **Cinzel** (Google Font, weights 400/500/600/700) for the hero name, section eyebrow labels, and card/group headings — this is the "branded" display face. **Inter** (weights 400/500/600) for all UI text: nav, buttons, meta text, footer, credits detail. Body copy paragraphs use system **Georgia** serif. Don't reintroduce plain `Arial` — both the CSS rules and any new inline `style="font-family:..."` attributes should use `'Inter', Arial, sans-serif` as the stack (inline styles use a different string pattern than CSS rules, so a global find/replace on one won't catch the other — check both when changing fonts).
- Section pattern: every `<section>` starts with a small uppercase `.section-label` (Cinzel), no `<h2>` elements are used anywhere on the page currently
- Modal pattern (used for both the payment modal and the image lightbox): `position:fixed; inset:0` dark overlay, closes via a visible ✕ button, clicking the overlay background (`e.target === this`), and Escape key. Follow this same pattern for any future modal/overlay UI.

## Content sections (in page order)

1. Hero — name, tagline ("Music Director · Composer · Playback Systems" — "Lessons" was deliberately removed), Hear My Work / Get In Touch / Pay buttons
2. Music — SoundCloud embed
3. Video — YouTube embed grid
4. Visuals — photo gallery from `visuals/`, opens in the lightbox on click
5. Credits — three groups, in this priority order: **Touring/MD/Drums** (Ghost 2017–Current, Brody Dalle 2013–2014, Paramore 2012, Awolnation 2010–2013, The New Regime 2008–2016) with a "+ select others available on request" note, **Composition** (The Hired Man 2026, Right Here Right Now 2024, Maw 2023), **Engineer** (Rancho De La Luna Studio 2015–2017). This is a deliberately curated highlight list, not exhaustive — don't add every credit without being asked.
6. Services ("Work With Me") — Music Director, Composer cards. The "Lessons" service card was intentionally removed.
7. Contact — email, YouTube, SoundCloud, Make a Payment

## Known gotchas

- Large source photos (camera originals up to ~26MB) will tank page load — resize before adding to `visuals/` or anywhere referenced by the site. Use macOS's built-in `sips`: `sips -Z 1800 --setProperty formatOptions 78 file.jpg` (resizes to max 1800px on the long edge, JPEG quality 78). This took the Visuals folder from ~52MB to ~1.8MB total with no visible quality loss.
- `DANCER3_2.0.jpg`, `_MG_2654.jpg`, `_MG_2748.jpg`, and root-level `profile.jpg` were unused full-resolution originals sitting in the repo root — some were later moved into `visuals/` and resized; check before assuming an image in the repo root is actually referenced anywhere.
- `.claude/` (including this skill file) is committed to the repo and, since `netlify.toml` publishes the whole repo root (`publish = "."`), technically ends up deployed as static files alongside the real site. Nothing secret lives in it, so this is low-risk, but it's not excluded from the deploy — worth knowing if that ever needs tightening up.
