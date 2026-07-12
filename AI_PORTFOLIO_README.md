# AI Portfolio Assistant

This is the operating guide for `Nikki AI`, the portfolio assistant for Nikki
Neil P. Cariño. It documents the implemented architecture, safe configuration,
response contracts, limits, privacy behavior, and verification workflow.

## Current Status

```text
Implementation: Complete through Phase 6
Default mode: Portfolio-only local responses
Optional mode: OpenAI Responses API for generic questions
Release state: Deployed to production on 2026-07-13
Production URL: https://carino-portfolio.vercel.app
Production AI mode: Portfolio-only; hosted provider variables are not configured
```

`Nikki AI` is a portfolio feature, not an embedded ChatGPT account. Approved
portfolio facts come from `lib/ai/portfolio-profile.ts`. The optional provider
answers neutral general questions but must not invent or override facts about
Nikki.

## Request Flow

1. The browser sends a question and at most eight validated history messages.
2. The API assigns a request ID, applies body and rate limits, and validates the
   request before processing it.
3. Known portfolio, safety, and capability intents are answered locally first.
4. Unknown questions return a safe local limitation response unless generic AI
   is explicitly enabled and all provider variables are present.
5. Hosted calls use the OpenAI Responses API with `store: false`, no tools, no
   automatic retries, bounded output, and an eight-second timeout.
6. The browser validates stream events and structured messages before rendering
   them.

## Architecture

| File or area | Responsibility |
|---|---|
| `lib/ai/portfolio-profile.ts` | Approved portfolio facts and public links |
| `lib/ai/portfolio-intents.ts` | Local portfolio, safety, and capability routing |
| `lib/ai/portfolio-fallback.ts` | Deterministic local answers and structured cards |
| `lib/ai/portfolio-context.ts` | Bounded portfolio context formatting |
| `lib/ai/portfolio-prompt.ts` | Portfolio and neutral provider instructions plus request validation |
| `lib/ai/portfolio-limits.ts` | Shared body, history, output, provider, and rate limits |
| `lib/ai/portfolio-rate-limit.ts` | In-memory per-instance request limiting |
| `lib/ai/openai-provider.ts` | Server-only OpenAI Responses API adapter |
| `lib/ai/portfolio-response.ts` | Structured message types and strict validation |
| `lib/ai/portfolio-stream.ts` | NDJSON event schema, parsing, and serialization |
| `app/api/portfolio-ai/route.ts` | Request validation, routing, streaming, headers, and fallbacks |
| `components/ai/` | Dialog, composer, safe Markdown, copy controls, and cards |
| `tools/ai-*.mjs` | API, provider, guardrail, accessibility, and responsive QA |

## Response Contracts

Clients that do not request streaming receive JSON:

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

`AssistantMessage` is one of:

- `text` for plain or safe Markdown answers.
- `file` for the approved resume PDF.
- `links` for approved contact details.
- `project` for a validated project summary and technologies.

Streaming clients receive newline-delimited JSON in this order:

```text
metadata -> text_delta or message -> optional error -> done
```

The stream parser rejects malformed events. A stopped response keeps any safe
partial text, and a retry starts a fresh request using the visible conversation
context.

## Safe Rendering

Text answers support headings, paragraphs, lists, blockquotes, tables, inline
code, fenced code, and links through `react-markdown` and `remark-gfm`.

- Raw HTML is not rendered.
- Scripts, images, embeds, and unsupported elements are excluded.
- Safe Markdown links allow `http:`, `https:`, `mailto:`, `tel:`, fragments,
  and safe local paths.
- Structured contact links require the exact protocol for their link type.
- External project links must use HTTPS.
- Full-answer and code-block copy controls report success or failure accessibly.

## Resume and Contact

The only approved resume attachment is:

```ts
{
  name: "Nikki_Neil_Carino_CV.pdf",
  url: "/resume/Nikki_Neil_Carino_CV.pdf",
  mimeType: "application/pdf",
}
```

The chat shows `View Resume` and `Download Resume`; it does not print the raw
resume path as answer text. Approved public contact links are:

```text
Email: mailto:nikkineil.carino@gmail.com
Phone: tel:+639493433164
GitHub: https://github.com/nikkineilcarino
Portfolio: https://carino-portfolio.vercel.app
```

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `PORTFOLIO_AI_ENABLE_GENERIC` | No | Provider kill switch; only `true` enables generic hosted answers |
| `OPENAI_API_KEY` | Hosted mode only | Server-side project API key |
| `OPENAI_MODEL` | Hosted mode only | Deployment-selected supported OpenAI model ID |

There is no hardcoded provider model default. Model selection is deployment
configuration so it can be reviewed and changed without a source edit.

### Portfolio-Only Local Mode

No environment file is required:

```powershell
npm install
npm run dev
```

Known portfolio questions, resume, contact, project, safety, and capability
responses work locally. Unknown general questions receive a clear limitation
message.

### Optional Hosted Local Mode

Create an ignored local environment file from the safe template:

```powershell
Copy-Item .env.example .env.local
```

Set all three values in `.env.local`:

```text
PORTFOLIO_AI_ENABLE_GENERIC=true
OPENAI_API_KEY=[local secret]
OPENAI_MODEL=[supported model ID]
```

Restart the development or production server after changing environment
variables. Never commit `.env.local`, paste a real key into documentation, or
use a `NEXT_PUBLIC_` prefix for the key.

### Vercel Mode

Portfolio-only production requires no environment variables. To enable generic
answers, add the same three variables in the Vercel project environment settings
for Production, keep the key server-side, and redeploy. Detailed release and
emergency-disable steps are in `DEPLOYMENT.md`.

## Fallback Behavior

| Condition | Visitor-visible result |
|---|---|
| Known portfolio intent | Immediate validated local response |
| Generic mode disabled | Local generic-capability limitation |
| Key or model missing | Same safe local limitation; no configuration details |
| Provider timeout, error, empty output, or interrupted stream | Safe retryable fallback |
| Invalid or oversized request | Bounded validation response |
| Rate limit reached | HTTP 429 with retry guidance |
| Prompt extraction, secret, hidden-reasoning, or harmful request | Deterministic local refusal |
| Live web request | Capability notice; no fabricated browsing claim |

## Enforced Limits

| Guardrail | Limit |
|---|---:|
| JSON request body | 24,576 bytes |
| Question | 1,200 characters |
| Conversation history | 8 messages |
| Each history message | 1,200 characters |
| Provider output request | 700 tokens |
| Rendered provider output | 8,000 characters |
| Provider timeout | 8 seconds |
| Provider automatic retries | 0 |
| Requests per client key | 24 per 60 seconds per runtime instance |

The in-memory rate limiter is a best-effort instance safeguard, not a globally
consistent quota across Vercel regions, cold starts, or deployments.

## Privacy, Logging, and Cost

- Provider requests use `store: false`.
- The application does not persist conversations.
- Browser requests contain only the current question and bounded visible
  history needed for that response.
- Server provider logs contain a generated request ID and minimal error class
  or status only. They exclude prompts, history, keys, provider payloads, and
  raw error messages.
- Live web search and all provider tools are disabled.
- The provider kill switch preserves free local portfolio answers when hosted
  usage is disabled.
- Use a dedicated provider project, conservative platform limits, and usage
  monitoring before enabling hosted answers publicly. See `DEPLOYMENT.md`.

## Verification

Run static and isolated suites from the repository root:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run qa:ai:guardrails
npm run qa:ai:provider
```

The guardrail and provider suites start their own local test servers and do not
need a live provider key. For API and browser acceptance checks, start the built
application in one terminal:

```powershell
npm run start -- -p 3014
```

Then run in another terminal:

```powershell
$env:QA_BASE_URL="http://localhost:3014"
npm run qa:ai:api
npm run qa:ai:ui
```

The final acceptance matrix and known residual risks are documented in
`AI_PORTFOLIO_QA.md`.
