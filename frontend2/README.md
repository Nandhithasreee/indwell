# InDwell — Frontend

React + Tailwind + A-Frame frontend, now connected to the real Django
backend (see `../backend/README.md`). Run both together — see the root
`../README.md` for the two-terminal quick start.

## Run it

```bash
cd frontend
npm install
cp .env.example .env   # points to http://127.0.0.1:8000/api by default
npm run dev
```

Open `http://localhost:5173`. The backend must be running (see
`../backend/README.md`) for signup, login, and design generation to work.

## What changed to connect the real backend

Only the service layer changed — no page, component, layout, or route:
- `src/services/api.js` — new file, axios instance + JWT refresh
- `src/services/authService.js` / `src/services/designService.js` — mock
  `localStorage` calls replaced with real requests, same function names
  and return shapes throughout
- `src/pages/Settings.jsx` — one line, so change-password actually sends
  the password fields it already collects

## Design direction

Built around the reference video you shared: a cinematic full-bleed hero
with mouse-parallax, curtain-reveal headline text, large rounded
photographic panels per room category, and match-score furniture cards.
All photography is real (not illustrations), sourced from Unsplash under
the free Unsplash License (unsplash.com/license) — see
`src/constants/images.js` for the full credit list and swap points.

## Pages included

Landing, About, Login, Signup, Forgot Password, Dashboard, Generate Design,
3D Room Viewer, Saved Designs, History, Settings, Feedback, 404 — all
sharing the same brass/charcoal design system, dark/light mode, and motion
language (Framer Motion + GSAP + Anime.js).

