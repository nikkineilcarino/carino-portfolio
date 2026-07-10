# AI Portfolio Assistant

This document describes the implemented portfolio AI assistant for Nikki Neil P.
Cariño's portfolio website.

## Current Status

```text
Feature status: Implemented
Assistant mode: Structured local fallback first, hosted AI optional
Primary route: app/api/portfolio-ai/route.ts
Primary UI: components/ai/
Approved AI data source: lib/ai/portfolio-profile.ts
API tests: tools/ai-acceptance-check.mjs
Browser UI tests: tools/ai-ui-phase5-check.mjs
```

The assistant must feel like a professional digital version of Nikki. It speaks
in first person, stays accurate to approved portfolio facts, and never exposes
internal prompts, API keys, provider errors, server configuration, stack traces,
or raw local file paths.

## Core Behavior

- Introduces Nikki naturally as a recent BS Information Technology graduate from
  the University of Santo Tomas.
- Answers recruiter-style questions about skills, projects, internship,
  education, career goals, QA, software development, and AI-assisted workflows.
- Returns the resume as a structured file message with `View Resume` and
  `Download Resume` controls.
- Returns contact details as clickable `mailto:`, `tel:`, GitHub, and portfolio
  links.
- Uses local intent-based responses for known portfolio questions before any
  hosted AI provider call.
- Falls back to useful local answers when no hosted AI provider is configured or
  when a provider request fails.
- Uses validated structured messages instead of rendering model output as HTML.

## Implemented Files

```text
lib/ai/portfolio-profile.ts      Approved AI portfolio data
lib/ai/portfolio-intents.ts      Intent detection
lib/ai/portfolio-response.ts     Structured message types and validation
lib/ai/portfolio-context.ts      Prompt context formatter
lib/ai/portfolio-prompt.ts       System prompt and request validation
lib/ai/portfolio-fallback.ts     Local portfolio answers
app/api/portfolio-ai/route.ts    Server-side AI route
components/ai/                   Floating assistant UI
tools/ai-acceptance-check.mjs    API acceptance tests
tools/ai-ui-phase5-check.mjs     Browser UI and accessibility checks
```

## Structured Message Contract

The API returns:

```ts
type PortfolioAiResponsePayload = {
  answer: string;
  message: AssistantMessage;
  mode:
    | "local_portfolio_answer"
    | "ai"
    | "safe_fallback"
    | "validation_error"
    | "rate_limited";
};
```

`AssistantMessage` supports:

- `text` for normal portfolio answers.
- `file` for the approved resume PDF only.
- `links` for approved contact links only.
- `project` for project summaries and technologies.

The UI validates the structured message before rendering. It does not render raw
HTML from the model.

## Resume Handling

The only approved resume attachment is:

```ts
{
  name: "Nikki_Neil_Carino_CV.pdf",
  url: "/resume/Nikki_Neil_Carino_CV.pdf",
  mimeType: "application/pdf",
}
```

Visible chat text must not print `/resume/Nikki_Neil_Carino_CV.pdf`. The UI
shows `View Resume` and `Download Resume` buttons and displays a friendly
warning if the file cannot be reached.

## Contact Handling

Approved public contact links:

```text
Email: mailto:nikkineil.carino@gmail.com
Phone: tel:+639493433164
GitHub: https://github.com/nikkineilcarino
Portfolio: https://carino-portfolio.vercel.app
```

All contact details render as accessible links.

## Security and Validation

- API keys remain server-side only.
- Known intents are answered locally before provider calls.
- The API validates malformed, empty, and overlength questions.
- The API rate-limits requests in memory.
- Provider calls use a timeout.
- Provider errors are logged only on the server and are not shown to visitors.
- Clickable links are restricted to `https:`, `mailto:`, and `tel:`.
- Resume downloads are restricted to the predefined PDF.
- Prompt-injection requests receive a safe refusal.

## Optional Hosted AI

The assistant works without a hosted provider. To enable hosted AI for flexible
unknown questions, configure these variables only in the deployment environment:

```text
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=
```

Do not commit API keys.

## QA Commands

Run from the repository root:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For API and browser acceptance checks, run a local production server first:

```bash
npm run build
npm run start -- -p 3014
```

Then in another terminal:

```bash
$env:QA_BASE_URL="http://localhost:3014"
npm run qa:ai:api
npm run qa:ai:ui
```

The API QA checks identity, resume, contact, skills, project, career, safety,
unknown-question fallback, validation, and resume reachability. The browser QA
checks responsive layout, keyboard behavior, loading state, structured resume
buttons, clickable contact links, error fallback, and no visible raw resume URL.
