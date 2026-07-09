# AI Portfolio Assistant QA

This document is the QA checklist for the planned AI assistant feature in
Nikki Neil P. Carino's portfolio website.

The AI assistant must be built phase by phase. After each phase, complete the
matching QA section, report the result, and stop until the user types
`continue`.

## QA Workflow Rule

Every AI feature phase must follow this workflow:

1. Complete only the current phase.
2. Review the matching QA section in this file.
3. Report completed work, files changed, checks performed, issues, and next
   phase.
4. Stop and wait for the user's `continue` command.

Do not continue automatically.

## QA Status System

Use only these statuses:

```text
Pending
Passed
Needs Fixes
Blocked
```

Definitions:

```text
Pending = The phase has not been completed or reviewed yet.
Passed = The phase was completed and no blocking QA issues remain.
Needs Fixes = The phase was completed but has issues that should be corrected before moving forward.
Blocked = The phase cannot continue because required information, files, setup, or approval is missing.
```

## Required End-of-Phase Report

Use this structure at the end of every AI feature phase:

```markdown
## AI Phase Completed: [Phase Number and Phase Name]

### Completed
- List what was completed.

### Files Created or Modified
- List each file created or modified.

### QA Review
Status: Pending / Passed / Needs Fixes / Blocked

### QA Checks Performed
- List the checks performed for this phase.

### Issues or TODOs
- List issues, missing files, incomplete content, or TODOs.
- If none, write: None.

### Next Phase
The next phase is: [Next Phase Name]

Type `continue` to proceed to the next phase.
```

## General AI QA Rules

Apply these rules to every phase:

- [x] Work is limited to the current AI feature phase.
- [x] No future phase is started without permission.
- [x] No fake portfolio facts are added.
- [x] No fake screenshots, certificates, links, metrics, or achievements are
  added.
- [x] No confidential company or client details are invented.
- [x] No API keys or secrets are committed.
- [x] Missing information is stated honestly.
- [x] The assistant is described as a portfolio helper, not as Nikki.
- [x] The feature remains recruiter-friendly, professional, and safe.

General Status:

```text
Passed
```

## Phase 0 QA: Documentation and QA Setup

Check that Phase 0 has:

- [x] Polished `AI_PORTFOLIO_README.md`.
- [x] Created `AI_PORTFOLIO_QA.md`.
- [x] Defined the AI assistant goal.
- [x] Defined the trusted portfolio knowledge sources.
- [x] Defined answer rules.
- [x] Defined loading behavior with `Thinking...`.
- [x] Defined missing-information and confidentiality behavior.
- [x] Defined no-silent-learning behavior.
- [x] Defined the phase-by-phase workflow.
- [x] Did not implement AI code yet.
- [x] Did not add dependencies.
- [x] Did not add API keys.
- [x] Did not deploy.

Status:

```text
Passed
```

Notes:

```text
Phase 0 is documentation-only. It defines the AI feature scope, safety rules, implementation roadmap, and QA gates.
```

## Phase 1 QA: Portfolio Knowledge Layer

Check that Phase 1 has:

- [x] Created a typed portfolio knowledge source.
- [x] Used approved portfolio constants as source material.
- [x] Included identity, contact, resume, projects, skills, experience,
  education, certifications, and leadership where available.
- [x] Avoided hardcoded unsupported claims.
- [x] Avoided confidential or invented project details.
- [x] Added tests or manual checks for expected knowledge output.
- [x] Passed lint and build checks if source code changed.

Status:

```text
Passed
```

Notes:

```text
Phase 1 created lib/ai/portfolio-context.ts with a typed portfolioKnowledge object and formatPortfolioContextForPrompt helper built from approved portfolio constants. The helper uses public resume/profile paths only and avoids exposing local asset source paths.
```

## Phase 2 QA: Prompt and API Route

Check that Phase 2 has:

- [x] Created a system prompt builder.
- [x] Created a server-side API route.
- [x] Kept provider keys server-side only.
- [x] Added safe fallback behavior when no API key is configured.
- [x] Validated empty and malformed requests.
- [x] Avoided exposing secrets in client code.
- [x] Passed lint and build checks.

Status:

```text
Passed
```

Notes:

```text
Phase 2 created lib/ai/portfolio-prompt.ts and app/api/portfolio-ai/route.ts. The route validates questions, normalizes optional chat history, returns a safe missing-configuration response when AI_API_KEY or AI_MODEL is unavailable, and keeps provider calls server-side only. Local route checks confirmed valid no-key fallback and invalid body rejection.
```

## Phase 3 QA: Assistant UI

Check that Phase 3 has:

- [x] Created the assistant entry button.
- [x] Created the assistant panel.
- [x] Added greeting text.
- [x] Added message history.
- [x] Added input and send behavior.
- [x] Added the `Thinking...` loading state.
- [x] Added empty input handling.
- [x] Added error handling.
- [x] Kept the UI responsive.
- [x] Passed lint and build checks.

Status:

```text
Passed
```

Notes:

```text
Phase 3 created a floating assistant button, responsive chat panel, message bubbles, input form, visible Thinking... state, empty-input handling, API error handling, and page integration through app/page.tsx. Local production smoke checks confirmed the closed assistant renders on the homepage and /api/portfolio-ai returns the expected no-key fallback.
```

## Phase 4 QA: Safety and Answer Testing

Check that Phase 4 has tested:

- [x] CV questions.
- [x] Skills questions.
- [x] Project questions.
- [x] QA experience questions.
- [x] Software development experience questions.
- [x] Prompt engineering questions.
- [x] Contact questions.
- [x] Missing-information questions.
- [x] Confidential-project questions.
- [x] General questions not about Nikki.
- [x] Hallucination prevention.
- [x] Fallback behavior.

Status:

```text
Passed
```

Notes:

```text
Phase 4 added lib/ai/portfolio-fallback.ts so approved portfolio questions receive deterministic, source-backed answers when no hosted AI provider is configured. Route tests passed for CV, skills, projects, QA, development, prompt engineering, contact, missing-information, confidential-project, general-question, hallucination-prevention, and fallback cases.
```

## Phase 5 QA: UI, Accessibility, and Responsive Testing

Check that Phase 5 has tested:

- [x] Desktop layout.
- [x] Tablet layout.
- [x] Mobile layout.
- [x] Keyboard navigation.
- [x] Focus states.
- [x] Screen-reader labels where needed.
- [x] Empty input state.
- [x] Long input state.
- [x] Long answer state.
- [x] Loading state.
- [x] Error state.
- [x] Reduced-motion compatibility if animation is added.
- [x] No text overlap.
- [x] No horizontal scrolling.

Status:

```text
Passed
```

Notes:

```text
Phase 5 added tools/ai-ui-phase5-check.mjs and ran Edge headless browser checks against a local production server. Mobile, tablet, and desktop checks passed for the assistant button, panel bounds, greeting, input, empty-input error, Thinking... loading state, answer state, long-input handling, forced fetch error state, keyboard focus visibility, Escape close behavior, reduced-motion emulation, and horizontal overflow.
```

## Phase 6 QA: Deployment Preparation

Check that Phase 6 has:

- [x] Documented required environment variables.
- [x] Confirmed no API keys are committed.
- [x] Confirmed local build passes.
- [x] Confirmed production behavior locally where possible.
- [x] Prepared Vercel environment variable notes.
- [x] Deployed only after explicit user approval.
- [x] Verified the live assistant if deployed.

Status:

```text
Passed
```

Notes:

```text
Phase 6 updated DEPLOYMENT.md with AI assistant deployment notes. No hosted AI provider key is required for local safe fallback mode. Optional hosted AI variables must be set only in Vercel. Lint, production build, env-ignore checks, secret scan, and Edge headless local production QA passed. The AI feature was not deployed in this phase because deployment requires explicit user approval.
```

## Final AI QA Principle

The assistant should be useful, but it must stay truthful.

When the answer is about Nikki, approved portfolio content is the source of
truth. When the answer is general, the assistant may use AI knowledge but must
not present general information as a confirmed fact about Nikki.
