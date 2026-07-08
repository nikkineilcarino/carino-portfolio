# Deployment Notes

This portfolio is prepared for Vercel deployment from the repository root.

## Current Deployment Status

- Framework: Next.js
- Repository root: `C:\Cariño_Portfolio`
- Git branch: `main`
- Remote: `https://github.com/nikkineilcarino/carino-portfolio.git`
- Package manager lockfile: `package-lock.json`
- Environment variables required: none
- Production build command: `npm run build`
- Local production start command: `npm run start`

Vercel supports Next.js projects directly and automatically configures sensible
defaults for framework builds and routing. Vercel also checks the `build` script
in `package.json` for Next.js projects, which is already set to `next build`.

Sources:

- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/deployments

## Vercel Project Settings

Use these settings when importing the GitHub repository into Vercel:

- Framework Preset: `Next.js`
- Root Directory: `./`
- Install Command: default Vercel npm install behavior
- Build Command: `npm run build`
- Output Directory: default Next.js/Vercel output
- Production Branch: `main`

No `vercel.json` file is required for the current setup.

## Pre-Deployment Checklist

Run these checks before deploying:

```bash
npm install
npm run lint
npm run build
```

Optional local production smoke test:

```bash
npm run start
```

Then verify:

- `/` loads successfully.
- `/resume/Nikki_Neil_Carino_CV.pdf` returns the resume PDF.
- `/images/profile/nikki-neil-carino-profile.jpg` returns the approved profile image.
- The browser icon loads from the approved profile image asset.
- No private project screenshots, fake certificate images, fake live demos, or
  fake GitHub links are added.

## Known Deployment Notes

- The browser icon currently uses the approved profile photo asset to avoid a
  missing favicon request. Replace it only if a dedicated approved logo or icon
  is provided.
- A social preview image is not configured because no approved social preview
  asset has been provided.
- Project screenshots and certificate images are intentionally not rendered
  because no approved assets were provided.
- Missing live demo, GitHub, LinkedIn, location, screenshot, and certificate
  assets remain documented as unavailable or TODO.
- `npm audit --audit-level=moderate` currently reports two moderate
  Next/PostCSS advisories where the suggested `npm audit fix --force` would
  perform a breaking forced downgrade. Do not apply that forced change unless
  explicitly approved after reviewing the tradeoff.
