# Tanvi & Nishant — Wedding Invitation

Static React + Vite site. Requires Node.js `>=22.12.0`.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
npm run preview  # serve the built dist/ locally
```

Page content lives in `app/page.tsx`, styles in `app/globals.css`, images and
music in `public/assets/`.

## Deploying

`npm run build` produces a plain static `dist/` folder. Upload it to any static
host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.) with build
command `npm run build` and output directory `dist`.

Set the environment variable `VITE_SITE_URL` to the site's public address
(e.g. `https://tanvi-nishant.com`, no trailing slash) in the host's build
settings. WhatsApp and other apps use it to show the preview card
(`public/og-image.jpg`) when the link is shared.
