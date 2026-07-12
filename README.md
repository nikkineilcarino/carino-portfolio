# Nikki Neil Cariño Portfolio

Professional developer portfolio website for Nikki Neil P. Cariño.

This repository is being built through a controlled SDLC workflow. Each phase
must pass the matching QA gate in `QA_CHECKLIST.md` before the next phase starts.

## Current Status

- Phase 0: Completed
- Phase 1: Completed
- Phase 2: Completed
- Phase 3: Completed
- Phase 4: Completed
- Phase 5: Completed
- Phase 6: Completed
- Phase 7: Completed
- Phase 8: Completed
- Phase 9: Completed
- Phase 10: Completed
- Phase 11: Completed
- Phase 12: Completed
- Phase 13: Completed
- Phase 14: Completed
- SDLC portfolio build phases complete

## Tech Foundation

The project foundation uses:

- Next.js
- React
- TypeScript
- Tailwind CSS
- ESLint
- Lucide React
- OpenAI JavaScript SDK
- React Markdown with GitHub Flavored Markdown

No extra animation or component libraries are currently required.

## Nikki AI

The floating `Nikki AI` assistant answers approved portfolio questions locally
and returns validated resume, contact, and project messages. Optional generic
answers use the server-side OpenAI Responses API only when explicitly enabled.

- Portfolio-only mode requires no environment variables.
- Hosted generic mode uses the ignored `.env.example` template locally and
  Vercel project environment settings in production.
- Provider model selection is environment configuration, not a hardcoded
  application default.
- Provider requests use bounded history and output, `store: false`, no tools,
  an eight-second timeout, and no automatic retries.

Architecture, configuration, limits, privacy behavior, and QA instructions are
documented in `AI_PORTFOLIO_README.md`. Final acceptance results and residual
risks are in `AI_PORTFOLIO_QA.md`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run qa:ai:guardrails
npm run qa:ai:provider
```

The production API and browser suites require a running built server. See
`AI_PORTFOLIO_README.md` for the two-terminal commands.

## Deployment

Deployment preparation is documented in `DEPLOYMENT.md`.

Current Vercel-ready settings:

- Framework Preset: `Next.js`
- Root Directory: `./`
- Build Command: `npm run build`
- Environment variables: none required for portfolio-only mode

Optional hosted AI variables and safe Vercel setup are documented in
`DEPLOYMENT.md`. The portfolio-only AI release is live at
https://carino-portfolio.vercel.app; hosted generic answers remain disabled until
the documented server-side environment values are configured.

## SDLC Rule

Do not skip phases.

When a phase is completed:

1. Review the matching section in `QA_CHECKLIST.md`.
2. Update the phase status.
3. Report completed work, files changed, QA checks, issues, and next phase.
4. Stop until the user types `continue`.

## Asset Rule

Only real approved assets may be used. Do not create fake profile photos,
screenshots, certificates, resume files, links, metrics, or project proof.

Approved assets currently used:

- CV PDF: `public/resume/Nikki_Neil_Carino_CV.pdf`
- Profile photo: `public/images/profile/nikki-neil-carino-profile.jpg`
- Browser icon: uses the approved profile photo until a dedicated approved
  icon or logo is provided.

Project screenshots and certificate images have not been provided yet.
