# Dwayne Pugh — Operational Profile v2.0

Personal brand site built with an SRE dashboard aesthetic.

---

## Project Structure

```
dpugh-profile/
├── index.html          # Single-page layout — all sections
├── css/
│   ├── tokens.css      # Design tokens (colors, type, spacing) — edit here first
│   └── main.css        # Component & layout styles
├── js/
│   └── main.js         # Nav, clock, uptime, scroll reveal
└── assets/
    └── dwayne_pugh_resume_2026.02.13.pdf   # (copy from existing repo)
```

---

## Design Decisions

### Palette
Draws quietly from the South African flag — intentional, not overt.

| Token | Hex | Role |
|---|---|---|
| Gold | `#C8860A` | Primary accent, headers, CTAs |
| Green | `#2D6A4F` | Hover states, interactive elements |
| Red | `#8B2020` | Visited links, secondary accents |
| Near-black | `#0A0A0A` | Base background |

### Typography
- **JetBrains Mono** — terminal/SRE feel for labels, status, eyebrows
- **Inter** — clean body reading for prose and headings

### Signature element
The hero grid overlay — horizontal and vertical hairlines at 48px intervals,
masked to fade at top and bottom. References real SRE dashboards and monitoring
consoles. Costs nothing in performance (pure CSS background-image).

---

## Deployment to GitHub Pages

This repo is designed to drop directly into your existing GitHub Pages setup.

### Option A — Replace existing repo files

```bash
# In your local clone of dpugh143.github.io/demo-profile
cp -r /path/to/dpugh-profile/* .

# Copy your resume into assets/ if not already there
cp assets/dwayne_pugh_resume_2026.02.13.pdf assets/

git add .
git commit -m "feat: operational profile v2.0 — SRE dashboard aesthetic"
git push origin main
```

### Option B — Fresh repo

```bash
git init dpugh-profile
cd dpugh-profile
# copy files in
git add .
git commit -m "feat: initial operational profile"
git remote add origin https://github.com/dpugh143/demo-profile.git
git push -u origin main
```

Then enable GitHub Pages in repo Settings → Pages → Branch: main / root.

---

## Customization Guide

### Update launch date (uptime counter)
In `js/main.js`, line ~30:
```js
const LAUNCH_DATE = new Date('2026-01-01T00:00:00Z');
```
Change to your actual relaunch date.

### Add a testimonial
In `index.html`, find `<!-- Testimonials placeholder -->` and replace
the `.testimonial-card--empty` div with:

```html
<div class="testimonial-card">
  <p class="testimonial-card__quote">
    "Dwayne didn't just teach the tools — he taught me how to think about the system."
  </p>
  <p class="testimonial-card__source mono">// Name · Role · Company · 2026</p>
</div>
```

### Add a color or token
All colors live in `css/tokens.css`. Add new variables there and reference
them in `main.css`. Never hardcode hex values in component styles.

### Add a new section
1. Add a `<section>` block in `index.html` with a unique `id`
2. Add a matching `<li><a href="#your-id">` in the nav
3. Add styles to `main.css`

---

## Performance Notes

- Zero JavaScript dependencies — vanilla JS only
- Fonts loaded via Google Fonts with `display=swap` for performance
- Scroll reveal respects `prefers-reduced-motion`
- IntersectionObserver used instead of scroll listeners
- Intervals cleaned up on page hide to prevent background CPU use

---

## Future Iterations (backlog)

- [ ] Add profile photo to hero or about section
- [ ] Wire up a real contact form (Formspree or similar — no backend needed)
- [ ] Populate testimonials after first cohort
- [ ] Add LinkedIn recommendations embed or screenshot cards
- [ ] Create `sankofa-systems/` subdirectory for STI brand site
- [ ] Add Open Graph image (1200×630 screenshot of hero section)

---

*Built for Dwayne Pugh | Sankofa Systems | Ubuntu Equity Group, LLC*
