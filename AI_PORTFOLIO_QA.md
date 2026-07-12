# AI Portfolio Assistant QA

This is the final acceptance record for `Nikki AI`. It covers the user-provided
requirements, the phased polish roadmap, and the implemented local and optional
hosted-provider paths.

## Audit Status

```text
Status: Passed
Audited: 2026-07-12
Requirement sources: AI_PORTFOLIO_GUIDE.md and AI_PORTFOLIO_POLISH_README.md
Blocking QA issues: None
Release state: Local changes only; production release is pending Phase 8
```

## Required Commands

Static and isolated suites:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run qa:ai:guardrails
npm run qa:ai:provider
```

Production API and browser suites:

```powershell
npm run start -- -p 3014
```

In another terminal:

```powershell
$env:QA_BASE_URL="http://localhost:3014"
npm run qa:ai:api
npm run qa:ai:ui
```

No live provider key is required. Provider behavior is verified against a
localhost-only mocked Responses API.

## Acceptance Matrix

| Area | Evidence | Result |
|---|---|---|
| Identity and professional summary | First-person introduction, degree, UST background, development, QA, internship, prompt engineering, and AI-assisted work in API QA | Passed |
| Internship and education | Direct internship and education scenarios in `tools/ai-acceptance-check.mjs` | Passed |
| Skills and career goals | Grouped skills, honest entry-level positioning, and target roles in API QA | Passed |
| Projects and ownership | RecycLens data, technologies, project card validation, and internship ownership boundaries in API/UI QA | Passed |
| Resume contract | Exact approved filename, MIME type, structured file card, and no raw path in chat | Passed |
| Resume reachability | Production server returns the approved PDF | Passed |
| Resume UI and privacy | Keyboard-accessible View/Download controls and no visible raw URL | Passed |
| Contact details | Clickable email, phone, GitHub, and portfolio links with strict protocols | Passed |
| Portfolio-first routing | Known questions bypass the hosted provider and preserve structured responses | Passed |
| Generic explanation | Mocked provider returns a useful neutral explanation | Passed |
| Generic writing | Mocked provider returns bounded writing assistance | Passed |
| Generic coding | Mocked provider returns safe Markdown code content | Passed |
| Generic calculation | Mocked provider returns a bounded calculation response | Passed |
| Multi-turn context | Valid supplied history reaches the provider in order and within limits | Passed |
| Session isolation | Fresh requests do not inherit history from prior requests | Passed |
| Streaming | Metadata, incremental deltas, completion, and structured local events validate | Passed |
| Stop and retry | Browser cancellation preserves safe partial content; retry completes a fresh request | Passed |
| Provider failures | Timeout, empty output, malformed stream, interruption, and provider errors fail safely | Passed |
| Provider disabled or unconfigured | Kill switch and missing key/model fail closed without exposing configuration | Passed |
| Request validation | Malformed JSON, empty input, control characters, and unsupported values are rejected safely | Passed |
| Resource limits | Body, question, history, provider output, and rendered output caps are enforced | Passed |
| Request correlation | Every API response includes an `X-Request-ID` | Passed |
| Rate limiting | Per-instance 24/60-second policy, rate headers, and HTTP 429 retry metadata | Passed |
| Log redaction | Provider errors exclude prompts, history, secrets, payloads, and raw messages | Passed |
| Prompt injection and secrets | Local refusals cover instruction extraction, environment values, and credentials | Passed |
| Harmful requests | Malware, credential theft, authentication bypass, and physical harm refuse locally | Passed |
| Live web limitation | No tools are enabled and the assistant does not claim current browsing | Passed |
| Safe Markdown | Raw HTML and scripts stay inert; supported prose, lists, tables, and code render | Passed |
| Link safety | Unsafe protocols and malformed links are not clickable | Passed |
| Structured validation | Malformed resume, contact, and project cards are rejected | Passed |
| Copy controls | Answer and code copy actions expose accessible success/failure feedback | Passed |
| Keyboard and focus | Open focus, composer-to-Send order, Escape, close restoration, stop, retry, and reset | Passed |
| Screen-reader status | Thinking, generation, completion, cancellation, and failure milestones only | Passed |
| Reduced motion | Panel animation is effectively disabled under reduced-motion preference | Passed |
| Responsive layout | 390x844, 768x1024, 1366x900, and 1920x1080 have no clipping or horizontal overflow | Passed |
| Visual states | Initial, resume/contact, project, and rich Markdown states were captured and inspected | Passed |

## Manual Review Record

- [x] The assistant sounds professional, direct, and natural.
- [x] Portfolio answers use first person and stay within approved facts.
- [x] Entry-level experience and internship ownership are represented honestly.
- [x] Resume and contact controls are visible, distinguishable, and usable by
      keyboard.
- [x] The raw resume path is not printed as conversational answer text.
- [x] No key, provider error, environment value, stack trace, or local path is
      exposed in the browser.
- [x] Thinking and generation states do not expose hidden reasoning.
- [x] Markdown, long words, code, tables, and structured cards remain contained.
- [x] Mobile, tablet, desktop, and wide-desktop states have no incoherent
      overlap, clipping, unreadable text, or blank rendered content.
- [x] Unsupported information and unavailable hosted AI use clear local fallback
      language.

## Residual Risks

- The rate limiter is in memory and applies per runtime instance, not globally
  across Vercel regions, cold starts, or deployments.
- Automated provider QA uses a local mock. A real OpenAI request is intentionally
  excluded so tests require no secret and incur no cost.
- Production has not been updated or smoke-tested with these local changes;
  release verification belongs to Phase 8.
- `npm audit` reports two moderate dependency advisories. The suggested forced
  fix would make a breaking dependency change, so it is not applied implicitly.
- Live web search is disabled, so the assistant cannot verify current external
  information.
- QA screenshots were temporary evidence and are not committed to the portfolio.

Update this document whenever approved portfolio facts, response contracts,
limits, provider configuration, or assistant UI behavior changes.
