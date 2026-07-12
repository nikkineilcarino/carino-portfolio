# Deployment Notes

This runbook prepares the portfolio for Vercel from the repository root.

## Release State

```text
Repository root: C:\Cariño_Portfolio
Branch: main
Remote: https://github.com/nikkineilcarino/carino-portfolio.git
Framework: Next.js
Package lock: package-lock.json
Production build: npm run build
Production start: npm run start
Current AI changes: Committed, pushed, deployed, and smoke-tested on 2026-07-13
Production URL: https://carino-portfolio.vercel.app
Production AI mode: Portfolio-only
```

Phase 8 completed the production release. Hosted generic answers remain disabled
because no provider environment variables are configured in Vercel.

## Local Setup

Install dependencies and run portfolio-only mode:

```powershell
npm install
npm run dev
```

No environment variables are required. Known portfolio questions, resume,
contact, projects, and safety responses remain available without provider cost.

To test optional hosted generic answers locally:

```powershell
Copy-Item .env.example .env.local
```

Then set all values in the ignored `.env.local` file:

```text
PORTFOLIO_AI_ENABLE_GENERIC=true
OPENAI_API_KEY=[local server-side secret]
OPENAI_MODEL=[deployment-selected supported model ID]
```

Restart the server after changes. Never commit `.env.local`, use a
`NEXT_PUBLIC_` key, or paste a real secret into source, docs, tests, chat, or
deployment logs.

## Vercel Project Settings

Use these settings when the GitHub repository is connected to Vercel:

- Framework Preset: `Next.js`
- Root Directory: `./`
- Install Command: default npm install behavior
- Build Command: `npm run build`
- Output Directory: default Next.js output
- Production Branch: `main`

No `vercel.json` file is required by the current application.

References:

- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/deployments

## AI Environment Modes

### Portfolio-Only Production

Deploy with no AI variables, or explicitly set:

```text
PORTFOLIO_AI_ENABLE_GENERIC=false
```

The assistant answers approved portfolio intents locally. General questions
receive a clear limitation response without revealing configuration details.

### Hosted Generic Answers

Add these values directly in Vercel project environment settings for Production:

```text
PORTFOLIO_AI_ENABLE_GENERIC=true
OPENAI_API_KEY=[set in Vercel only]
OPENAI_MODEL=[deployment-selected supported model ID]
```

`OPENAI_MODEL` is intentionally configuration, not a hardcoded application
default. Select and review a supported model when enabling the environment.

- Keep provider calls server-side through `app/api/portfolio-ai/route.ts`.
- Use a dedicated OpenAI project and key for this portfolio.
- Redeploy after changing environment values.
- Confirm generic mode only after usage controls are configured.

## Production Guardrails

| Guardrail | Limit |
|---|---:|
| JSON request body | 24,576 bytes |
| Question | 1,200 characters |
| Conversation history | 8 messages |
| Each history message | 1,200 characters |
| Provider timeout | 8 seconds |
| Provider automatic retries | 0 |
| Provider output request | 700 tokens |
| Rendered provider output | 8,000 characters |
| Requests per client key | 24 per 60 seconds per runtime instance |

Responses include `X-Request-ID`, `RateLimit-Limit`,
`RateLimit-Remaining`, `RateLimit-Reset`, and `RateLimit-Policy`. HTTP 429
responses also include `Retry-After`. `X-RateLimit-Scope: instance` documents
that the in-memory limiter is not a global quota across regions, cold starts,
or deployments.

Provider calls use `store: false`, no tools, and no automatic retries. The app
does not persist conversations. Provider logs include only request ID and a
minimal error class or status; they exclude visitor prompts, history, keys,
provider payloads, and raw error messages.

Live web search is disabled. Requests for current browsing receive a capability
notice rather than an unsupported claim that sources were checked.

## Cost Controls and Emergency Disable

Before setting `PORTFOLIO_AI_ENABLE_GENERIC=true`:

1. Use a dedicated OpenAI project and API key.
2. Review project rate and usage limits in the
   [OpenAI limits settings](https://platform.openai.com/settings/organization/limits).
3. Review activity in the
   [OpenAI usage dashboard](https://platform.openai.com/settings/organization/usage)
   after deployment and periodically afterward.
4. Keep the application limits above enabled. Provider limits do not replace
   application abuse controls; see the
   [OpenAI rate-limit guide](https://developers.openai.com/api/docs/guides/rate-limits).

For unexpected traffic or spend:

1. Set `PORTFOLIO_AI_ENABLE_GENERIC=false` in Vercel.
2. Redeploy so local portfolio answers remain available without provider calls.
3. Revoke or rotate the project key if exposure is suspected.
4. Investigate with request IDs and provider usage data without logging visitor
   content.

## Pre-Deployment Verification

Use the lockfile for a release-equivalent dependency install when appropriate:

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run qa:ai:guardrails
npm run qa:ai:provider
```

The guardrail and provider suites self-start isolated local servers. For API and
browser acceptance, start the built site:

```powershell
npm run start -- -p 3014
```

Then in another terminal:

```powershell
$env:QA_BASE_URL="http://localhost:3014"
npm run qa:ai:api
npm run qa:ai:ui
```

Also confirm before release:

- `git branch --show-current` returns `main`.
- `git remote -v` points to the approved `nikkineilcarino` repository.
- Local Git author identity matches the required GitHub contributor.
- Secret scans find no tracked credential or environment file.
- `git diff --check` reports no whitespace errors.
- The reviewed diff contains no unrelated change or binary replacement.

## Phase 8 Live Smoke Test

After deploying the exact tested commit, verify the canonical site:

- `/` loads successfully.
- `/resume/Nikki_Neil_Carino_CV.pdf` returns the approved PDF.
- `/images/profile/nikki-neil-carino-profile.jpg` returns the approved image.
- `Ask Nikki AI` opens and shows its processing state.
- Identity, internship, project, resume, and contact answers work.
- Contact details are clickable and the resume actions open/download the PDF.
- If generic mode is enabled, one generic answer succeeds without leaking
  configuration or provider details.
- If generic mode is disabled, a generic question fails closed while local
  portfolio answers continue working.
- Mobile and desktop layouts have no clipping or horizontal overflow.

## Known Deployment Notes

- The browser icon uses the approved profile image until a dedicated approved
  logo is provided.
- No approved social preview image, project screenshots, or certificate images
  are available, so the portfolio does not invent them.
- Missing live demos, repositories, LinkedIn, location, screenshots, and
  certificate assets remain explicitly unavailable or TODO where applicable.
- `npm audit` currently reports two moderate dependency advisories. The proposed
  forced fix would perform a breaking dependency change and must not be applied
  without a separate review and approval.
