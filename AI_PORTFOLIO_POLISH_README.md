# Portfolio AI Polish Roadmap

This document is the implementation checklist for upgrading the portfolio AI.
It is intentionally separate from `AI_PORTFOLIO_README.md`, which documents the
currently implemented assistant.

Each future `continue` prompt advances one unchecked phase only. After finishing
that phase, Codex must run the listed checks, update this file, report the exact
result, and stop for the next instruction.

## Goal

Build a polished portfolio assistant that:

- gives authoritative answers about Nikki's resume, experience, projects,
  skills, education, and contact details;
- answers reasonable general questions with an OpenAI model;
- feels as responsive and readable as a modern AI chat interface without
  copying OpenAI branding or pretending to be ChatGPT;
- streams generic answers and shows a clear `Thinking...` state without
  exposing hidden reasoning;
- keeps resume, project, and contact responses structured and interactive;
- remains useful when the hosted AI provider is unavailable;
- protects credentials, portfolio facts, visitors, and API spending; and
- is fully validated on desktop and mobile before release.

## Important Integration Decision

The portfolio will not sign in to, embed, or reuse Nikki's personal ChatGPT
session. A ChatGPT subscription and the OpenAI API are separate products with
separate billing. Personal ChatGPT cookies, passwords, access tokens, and API
keys must never be placed in this repository or sent to the browser.

The supported architecture is:

```text
Visitor browser
    |
    v
Next.js portfolio AI route
    |
    +--> Known portfolio intent --> validated local structured response
    |
    +--> General question -------> OpenAI Responses API --> streamed text
    |
    +--> Provider unavailable ---> safe local fallback
```

The OpenAI API key will exist only as `OPENAI_API_KEY` in local/Vercel server
environment variables. The implementation will use the official OpenAI
JavaScript SDK and the Responses API. OpenAI recommends the Responses API for
new text-generation applications.

## Current Audit

### Working foundation to preserve

- The Next.js server route keeps provider credentials away from the browser.
- Known portfolio intents are answered locally before a hosted model call.
- Resume, contact, and project answers use validated structured messages.
- Resume controls and contact links are clickable and accessibility-aware.
- Empty and oversized questions are rejected.
- Provider timeouts, safe fallbacks, and prompt-injection handling exist.
- API and browser acceptance scripts already cover the core portfolio flows.

### Gaps this roadmap will address

- The provider path currently calls the older Chat Completions endpoint with a
  manual `fetch` request.
- Generic answers are not enabled unless legacy `AI_*` variables are supplied.
- Responses arrive all at once instead of streaming.
- The assistant is a compact utility widget rather than a polished chat
  workspace, especially on mobile.
- Generic text cannot safely render headings, lists, links, or code blocks.
- Portfolio voice and general-assistant voice are not separated.
- The in-memory rate limiter is per server instance and is not a complete
  distributed production limit.
- No explicit output-token budget, generic-answer eval set, or streaming failure
  test exists yet.

## Behavior Contract

### Portfolio questions

- Answer as Nikki in first person.
- Use only facts from `lib/ai/portfolio-profile.ts`.
- Preserve structured resume, contact, and project cards.
- Never invent experience, ownership, metrics, credentials, or personal data.
- Clearly distinguish internship work from academic and personal projects.

### General questions

- Answer as a neutral AI assistant, not as Nikki claiming personal expertise.
- Prefer direct, useful answers with concise explanations.
- Support normal writing, explanations, brainstorming, basic coding, and general
  knowledge questions.
- State limitations for requests that require unavailable live data, private
  systems, professional judgment, or unsupported tools.
- Do not silently treat general model output as an approved fact about Nikki.

### Learning and memory

- Do not automatically train on or permanently learn from visitor messages.
- Do not write visitor statements into the portfolio profile.
- Conversation context is limited to the current browser session.
- Portfolio knowledge changes only through reviewed edits to the approved
  profile source and its tests.

## Target Environment Contract

```text
OPENAI_API_KEY=server-side secret, never committed
OPENAI_MODEL=deployment-selected model ID
PORTFOLIO_AI_ENABLE_GENERIC=true|false
```

Rules:

- Do not use `NEXT_PUBLIC_` for any secret.
- Do not print, inspect, echo, or log the API key.
- Use `store: false` for provider responses.
- Cap input history, output tokens, request duration, and request frequency.
- Keep the local portfolio assistant functional when generic AI is disabled.
- Add `.env.example` placeholders only; never add a real key.
- Nikki should create the API key directly in the OpenAI Platform and add it to
  Vercel without pasting it into chat or source files.

## Phase Tracker

| Phase | Work | Status |
|---|---|---|
| 0 | Audit and implementation roadmap | Complete |
| 1 | OpenAI provider foundation and dual-mode routing | Complete |
| 2 | Streaming response protocol and cancellation | Complete |
| 3 | Chat interface visual and responsive polish | Complete |
| 4 | Safe rich-text rendering and structured message polish | Complete |
| 5 | Safety, privacy, rate limits, and cost controls | Complete |
| 6 | Automated QA, browser review, and regression fixes | Complete |
| 7 | Documentation and deployment readiness | Completed |
| 8 | Commit, push, and production deployment | Requires explicit release instruction |

## Phase 1: Provider Foundation

Objective: replace the legacy provider call with a clean OpenAI Responses API
integration while preserving all current local portfolio behavior.

Tasks:

- Add the official `openai` JavaScript package.
- Create a small server-only OpenAI client/config module.
- Replace legacy `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` handling with the
  target environment contract.
- Keep known portfolio intents local and deterministic.
- Route unknown/general questions to the Responses API.
- Split portfolio instructions from neutral general-assistant instructions.
- Send only validated, length-limited conversation history.
- Set `store: false` and a bounded output-token limit.
- Preserve safe fallback behavior for missing credentials, timeouts, invalid
  provider output, and provider errors.
- Add provider tests with a mocked upstream response; a live secret must not be
  required for automated local QA.

Exit criteria:

- Existing portfolio acceptance tests still pass.
- A mocked generic question returns a useful neutral answer.
- No key, provider payload, or server error appears in client responses.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.

## Phase 2: Streaming and Cancellation

Objective: make generic responses appear progressively while keeping structured
portfolio messages reliable.

Tasks:

- Define a typed streaming event contract for metadata, text deltas, structured
  messages, completion, and safe errors.
- Stream OpenAI response text through the Next.js route.
- Keep local resume/contact/project responses as immediate structured events.
- Incrementally append text in the client without duplicate content.
- Add a `Stop generating` icon button backed by `AbortController`.
- Replace the fixed delay with a real request lifecycle.
- Keep `Thinking...` visible until the first usable event arrives.
- Preserve a partial answer when a stream is intentionally stopped.
- Convert interrupted or failed streams into a clear retryable state.

Exit criteria:

- First content appears before the full generic answer completes.
- Stop, retry, timeout, and malformed-stream cases do not break the chat.
- Screen readers receive useful status updates without every token being
  announced.

## Phase 3: Chat Interface Polish

Objective: create a calm, professional, ChatGPT-inspired interaction model that
still belongs to Nikki's portfolio.

Tasks:

- Rename the visible assistant to `Nikki AI` or another portfolio-owned label.
- Use a cleaner header with status, reset, and close controls.
- Increase desktop reading width while keeping it visually subordinate to the
  portfolio page.
- Use a near-full-screen bottom sheet on small mobile viewports.
- Render assistant prose in an open reading column; reserve framed cards for
  files, contacts, projects, and errors.
- Keep user messages compact and visually distinct.
- Replace the large suggestion cloud with a concise starter list or rotating
  examples.
- Improve the composer with auto-growing input, send/stop state, character
  handling, and stable dimensions.
- Add subtle open/close and loading motion with reduced-motion support.
- Keep focus management, Escape behavior, labels, contrast, and touch targets.
- Verify that the assistant never overlaps navigation or important portfolio
  content at tested viewport sizes.

Exit criteria:

- No clipping, overlap, layout shift, or horizontal overflow at mobile, tablet,
  laptop, and wide-desktop sizes.
- The interface is clearly portfolio-owned and does not use OpenAI logos or
  claim to be ChatGPT.
- Keyboard-only operation covers open, type, send, stop, reset, and close.

## Phase 4: Rich Answers and Structured Cards

Objective: make generic answers easy to scan without allowing unsafe HTML.

Tasks:

- Add a safe Markdown renderer that does not enable raw HTML.
- Support paragraphs, headings, lists, inline code, fenced code, blockquotes,
  and safe links.
- Restrict rendered links to approved protocols and add secure external-link
  attributes.
- Add copy controls for answers and code blocks with accessible feedback.
- Refine resume, contact, and project cards to match the polished chat style.
- Keep raw resume paths, provider JSON, and internal metadata hidden.
- Ensure very long words and code wrap or scroll inside their own container.

Exit criteria:

- Common Markdown renders correctly.
- Script tags, raw HTML, unsafe links, and malformed structured messages cannot
  execute or escape the message container.
- Resume and contact regression tests still pass.

## Phase 5: Production Guardrails

Objective: control abuse, privacy risk, and unexpected API cost.

Tasks:

- Centralize input, history, and output limits.
- Add request IDs for server diagnostics without exposing secrets.
- Improve rate-limit headers and document the per-instance limitation.
- Evaluate a distributed limiter only if a supported production store is
  available; do not add an external service silently.
- Add a deployment kill switch through `PORTFOLIO_AI_ENABLE_GENERIC`.
- Keep provider logs minimal and redact visitor content where practical.
- Add spend-limit setup and usage-monitoring steps to deployment documentation.
- Add high-risk prompt and prompt-injection cases to the test set.
- Do not expose hidden chain-of-thought or internal model reasoning. Only show a
  simple processing status.
- Treat live web search as a separate optional capability. Do not enable it
  until its source-display, safety, latency, and cost behavior is tested.

Exit criteria:

- Missing key, disabled generic mode, timeout, provider 4xx/5xx, rate limiting,
  and prompt injection all fail safely.
- A visitor cannot cause the API to reveal environment values or internal
  instructions.

## Phase 6: QA and Regression Review

Objective: prove both portfolio-specific and generic behavior before release.

Automated scenarios:

- Portfolio introduction, skills, internship, education, career goals, and
  project ownership.
- Resume file card and reachable PDF.
- Clickable email, phone, GitHub, and portfolio links.
- Generic explanation, writing, simple coding, and calculation prompts.
- Multi-turn follow-up context without cross-session persistence.
- Empty, oversized, malformed, abusive, and prompt-injection requests.
- Provider timeout, invalid response, interrupted stream, and disabled mode.
- Safe Markdown, links, code blocks, and structured-message validation.
- Mobile and desktop layout, focus order, Escape, reduced motion, and screen
  reader status behavior.

Required verification:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run qa:ai:api
npm run qa:ai:ui
```

The QA scripts may be expanded or replaced with clearer commands, but all
existing acceptance coverage must remain represented.

Visual verification must include browser screenshots at representative mobile
and desktop viewports. Any discovered overlap, overflow, unreadable content, or
broken interaction must be fixed and retested in this phase.

## Phase 7: Documentation and Deployment Readiness

Objective: leave the feature understandable, configurable, and ready to release.

Tasks:

- Update `AI_PORTFOLIO_README.md` to describe the final architecture and usage.
- Update `AI_PORTFOLIO_QA.md` with the final acceptance matrix and results.
- Add safe local and Vercel environment setup instructions.
- Document model selection as configuration rather than a permanent code
  assumption.
- Document fallback behavior, limits, privacy choices, and cost controls.
- Run a secret scan and confirm no credential is tracked.
- Run the complete verification suite one final time.
- Review the diff for unrelated changes and attribution mistakes.

Exit criteria:

- A new developer can run the assistant locally without guessing configuration.
- Production can run portfolio-only mode before the API key is configured.
- The repository is clean except for the reviewed implementation changes.

## Phase 8: Release

This phase starts only after the user explicitly asks to commit, push, and
deploy.

Before release:

- Confirm branch `main`.
- Confirm remote `https://github.com/nikkineilcarino/carino-portfolio.git`.
- Confirm local Git identity:

```text
user.name  = nikkineilcarino
user.email = 261335732+nikkineilcarino@users.noreply.github.com
```

- Do not modify the global Git identity.
- Commit with the required local attribution.
- Push the exact tested commit.
- Configure Vercel secrets directly in Vercel, never in Git.
- Deploy production and verify the canonical website.
- Smoke-test portfolio answers, one generic answer, resume access, contact
  links, mobile layout, and safe fallback behavior on the live deployment.

## Continue Protocol

For every future `continue` prompt:

1. Read this file and identify the first incomplete phase.
2. Recheck Git branch, remote, local identity, and working-tree changes.
3. Implement only that phase and any fixes required by its tests.
4. Run the phase exit checks.
5. Review for accidental regressions or unsupported claims.
6. Update the phase status and record a concise result below.
7. Stop and clearly state which phase is next.

Do not skip ahead, commit, push, deploy, enable paid tools, or add an external
service unless the relevant phase and user instruction authorize it.

## Progress Log

### Phase 0

- Audited the current AI route, prompts, local intent routing, structured
  messages, UI, documentation, and QA commands.
- Selected a server-side OpenAI Responses API integration instead of attempting
  to embed a personal ChatGPT account.
- Preserved the current local portfolio-first architecture as the reliable
  fallback and source of truth.
- Created this phased roadmap. No runtime portfolio code was changed in Phase 0.

### Phase 1

- Added the official OpenAI JavaScript SDK and a server-only provider adapter.
- Replaced the legacy Chat Completions request with a non-streaming Responses
  API request using `store: false`, an eight-message history cap, a 700-token
  output cap, an eight-second timeout, and no automatic retries.
- Added explicit `PORTFOLIO_AI_ENABLE_GENERIC`, `OPENAI_API_KEY`, and
  `OPENAI_MODEL` configuration while keeping portfolio-only mode as the default.
- Split portfolio voice from neutral general-assistant voice while retaining the
  approved portfolio profile as the only source for Nikki-specific facts.
- Preserved local structured resume, contact, and project responses before any
  provider call.
- Added `npm run qa:ai:provider`, which uses a localhost-only mock Responses API
  and requires no live credential.
- Verified lint, TypeScript, production build, provider integration, existing
  API acceptance checks, and browser acceptance checks with zero failures.
- `npm audit` still reports two moderate findings through Next.js's nested
  PostCSS dependency. The suggested automatic fix is an unsafe Next.js major
  downgrade, so no forced dependency change was made in this phase.
- Next phase: Phase 2, streaming response protocol and cancellation.

### Phase 2

- Added a validated NDJSON event contract for `metadata`, `text_delta`,
  structured `message`, retryable `error`, and `done` events.
- Preserved the existing JSON API contract while adding streaming content
  negotiation for the browser client.
- Mapped OpenAI `response.output_text.delta` and refusal deltas to portfolio
  stream events without exposing provider event payloads to the browser.
- Replaced the artificial loading delay with the real request lifecycle.
- Added first-content `Thinking...` behavior, incremental updates to one
  assistant message, an AbortController-backed Stop control, partial-answer
  preservation, retry notices, and a working Retry action.
- Removed token-by-token live-region announcements. Screen readers now receive
  only thinking, generating, completion, cancellation, and failure milestones.
- Expanded mocked provider QA to cover incremental delivery, local structured
  bypass, empty output, malformed and interrupted provider streams, the full
  provider timeout, browser cancellation, retry completion, malformed browser
  events, and secret-safe failures.
- Verified the original API and responsive browser suites with zero reported
  failures after updating the obsolete fixed-delay assertion.
- Next phase: Phase 3, chat interface visual and responsive polish.

### Phase 3

- Renamed the visible assistant to `Nikki AI` and added a compact portfolio-owned
  identity, ready status, reset control, close control, and launcher without
  using OpenAI or ChatGPT branding.
- Reworked assistant prose into an open reading column while keeping structured
  portfolio messages framed, and kept user messages compact and distinct.
- Replaced the suggestion cloud with three focused starter prompts for
  experience, projects, and the resume.
- Added an auto-growing composer with stable send and stop controls, bounded
  height, character-count feedback, and a clear focus state.
- Added subtle panel and launcher motion that respects reduced-motion settings.
- Improved dialog semantics and focus management: opening focuses the composer,
  closing restores focus to the launcher, and keyboard-only open, send, stop,
  retry, reset, and close workflows are covered by browser QA.
- Verified the layout at 390x844, 768x1024, 1366x900, and 1920x1080. The mobile
  assistant uses a near-full-screen sheet; desktop uses an opaque 544px reading
  panel that stays below the navigation. No clipping, horizontal overflow, or
  incoherent overlap was found in the captured screenshots.
- Expanded responsive QA to check panel bounds, opacity, starter count,
  assistant message framing, composer growth and stability, focus treatment,
  and launcher visibility.
- Next phase: Phase 4, safe rich-text rendering and structured message polish.

### Phase 4

- Added `react-markdown` with GitHub Flavored Markdown support for headings,
  paragraphs, lists, inline code, fenced code, blockquotes, tables, and links.
- Kept raw HTML disabled and restricted rendered elements to an explicit
  allowlist. Images, scripts, embedded HTML, and unsupported elements are not
  rendered.
- Added an explicit URL policy for `http`, `https`, `mailto`, `tel`, safe local
  paths, and fragment links. Unsafe or malformed destinations render as plain
  text, while external links receive `target="_blank"` and
  `rel="noopener noreferrer"`.
- Added accessible icon controls for copying complete answers and individual
  code blocks, including success and failure feedback without introducing idle
  live regions into streamed messages.
- Refined resume, contact, and project cards. Contact details use a readable
  single-column grouped list, resume actions remain restricted to the approved
  PDF, and project summaries and technology labels remain contained.
- Tightened structured-message validation with field bounds, exact
  link-kind-to-protocol matching, HTTPS-only external/project URLs, and strict
  rejection of malformed cards.
- Expanded browser QA with deterministic rich Markdown, unsafe protocols, raw
  HTML and script content, malformed structured payloads, clipboard feedback,
  long-word containment, and direct resume, contact, and RecycLens card checks.
- Captured and inspected initial, structured-contact, project, and rich-answer
  screenshots at 390x844, 768x1024, 1366x900, and 1920x1080. No clipping,
  horizontal overflow, unsafe rendering, or incoherent overlap remained.
- Next phase: Phase 5, safety, privacy, rate limits, and cost controls.

### Phase 5

- Centralized question, history, body, provider, structured-message, output, and
  rate limits in `lib/ai/portfolio-limits.ts` so the client, API, validator, and
  provider use one contract.
- Added a 24,576-byte pre-parse request-body cap, unsupported-control-character
  rejection, an 8,000-character provider-output cap, and bounded in-memory
  rate-limit storage with expired-entry cleanup.
- Added a generated `X-Request-ID` to every response and minimal provider logs
  containing only request ID, error class, and status. Visitor prompts, history,
  keys, raw provider responses, and error messages are not logged.
- Added `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`,
  `RateLimit-Policy`, `Retry-After`, and `X-RateLimit-Scope` response headers.
- Retained the 24-request, 60-second limiter as a per-runtime-instance safeguard.
  No supported shared store is configured, so no distributed database or paid
  service was added. Documentation now states that this is not a global Vercel
  quota.
- Preserved `PORTFOLIO_AI_ENABLE_GENERIC` as an emergency provider kill switch
  and verified both disabled-mode and missing-key fail-closed behavior.
- Added deterministic local handling for instruction extraction, secret
  retrieval, hidden chain-of-thought, and live web-search requests. Provider
  instructions also treat supplied history as untrusted and explicitly state
  that no tools are enabled.
- Expanded provider QA to prove request-correlated redacted errors, disabled
  tools, and both streaming and non-streaming character caps.
- Added `npm run qa:ai:guardrails` for malformed and oversized bodies, control
  characters, prompt injection, live-web limitation, request IDs, no-store and
  rate headers, HTTP 429 behavior, log redaction, the kill switch, and missing
  credentials.
- Updated deployment guidance with the enforced limits, privacy behavior,
  emergency disable process, OpenAI limits settings, usage dashboard, and rate
  limit documentation.
- Verified lint, TypeScript, production build, guardrail QA, mocked provider QA,
  original API acceptance checks, and responsive browser QA with zero failures.
- Next phase: Phase 6, automated QA, browser review, and regression fixes.

### Phase 6

- Mapped every Phase 6 acceptance scenario to executable API, provider,
  guardrail, or browser coverage before running the final regression pass.
- Added direct portfolio assertions for internship experience, education, and
  empty-question handling while preserving identity, skills, career, resume,
  contact, project, and ownership checks.
- Expanded mocked provider coverage for generic explanation, writing, coding,
  calculation, supplied multi-turn context, and fresh-request isolation without
  requiring a live API key.
- Added deterministic handling and QA for clearly harmful malware,
  credential-theft, authentication-bypass, and physical-harm requests.
- Expanded browser accessibility checks to prove opening focus, the composer-to-
  Send tab order, and an effectively disabled panel animation under reduced
  motion, in addition to the existing keyboard, Escape, retry, cancellation,
  focus visibility, and screen-reader milestone coverage.
- Found and fixed an intent-ordering regression where a harmful password-theft
  prompt reached the unavailable-information branch before the harmful-request
  refusal.
- Found and fixed project-card punctuation where sentence-ending feature text
  was joined with commas, producing `.,` sequences. Features now use readable
  semicolon separation.
- Isolated project and rich-answer screenshot states by resetting the
  conversation before capture, preventing stale browser compositor layers and
  making each visual artifact independently reviewable.
- Captured and inspected initial, structured resume/contact, RecycLens project,
  and rich Markdown states at 390x844, 768x1024, 1366x900, and 1920x1080. The
  final mobile and desktop evidence showed no clipping, overlap, unreadable
  text, horizontal overflow, blank content, or broken interaction.
- Verified lint, TypeScript, production build, guardrail QA, provider QA,
  original API QA, and the expanded four-viewport browser suite with zero final
  failures.
- Next phase: Phase 7, documentation and deployment readiness.

### Phase 7

- Rewrote `AI_PORTFOLIO_README.md` as the final operating guide for request
  flow, architecture, JSON and NDJSON contracts, safe Markdown, local and
  Vercel setup, fallback behavior, limits, privacy, logging, cost controls, and
  complete QA commands.
- Replaced `AI_PORTFOLIO_QA.md` with the final acceptance matrix, passed manual
  review record, audited date, release state, and explicit residual risks.
- Reconciled `DEPLOYMENT.md` and the root `README.md` with portfolio-only mode,
  optional hosted configuration, deployment-selected model IDs, emergency
  disable steps, and the Phase 8 live smoke-test boundary.
- Found and fixed a race in the provider QA CDP client where a fast browser
  response could arrive before its pending command was registered. Added
  bounded browser command and process/server cleanup so the harness cannot wait
  indefinitely on a lost response or open test connection.
- Confirmed no credential-like pattern, tracked secret environment file,
  binary diff, merge conflict, whitespace error, or leftover local test listener.
  The existing `.env.local` remains ignored and its values were not printed.
- Confirmed branch `main`, the approved GitHub remote, and the required local
  `nikkineilcarino` author identity without modifying global Git configuration.
- Verified lint, TypeScript, production build, guardrail QA, mocked provider QA,
  production API acceptance, and the four-viewport browser suite with zero
  failures. Headless Edge suites were run outside the filesystem sandbox because
  its GPU subprocess is unstable inside the Windows sandbox.
- `npm audit` reports two moderate findings and no high or critical findings.
  No forced breaking dependency change was applied.
- No commit, push, Vercel configuration, or deployment was performed.
- Next phase: Phase 8, release. It requires an explicit commit, push, and deploy
  instruction.

## Official References

- [OpenAI text generation guide](https://developers.openai.com/api/docs/guides/text)
- [OpenAI streaming responses guide](https://developers.openai.com/api/docs/guides/streaming-responses)
- [OpenAI conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state)
- [OpenAI structured outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [ChatGPT and API billing are separate](https://help.openai.com/en/articles/8156019)
