# AI Portfolio Assistant QA

This checklist verifies the implemented portfolio AI assistant against
`AI_PORTFOLIO_GUIDE.md`.

## Required Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Run these after starting a local production server on port `3014`:

```bash
$env:QA_BASE_URL="http://localhost:3014"
npm run qa:ai:api
npm run qa:ai:ui
```

## Acceptance Matrix

| Area | Requirement | Automated coverage |
|---|---|---|
| Identity | First-person Nikki introduction with degree and UST background | `tools/ai-acceptance-check.mjs` |
| Professional summary | Explains development, QA, internship, prompt engineering, and AI-assisted workflows | `tools/ai-acceptance-check.mjs` |
| Resume | Returns a structured file message only | `tools/ai-acceptance-check.mjs` |
| Resume UI | Shows `View Resume` and `Download Resume` controls | `tools/ai-ui-phase5-check.mjs` |
| Resume privacy | Does not show `/resume/Nikki_Neil_Carino_CV.pdf` as visible chat text | Both AI QA scripts |
| Resume reachability | Approved PDF exists and responds in production server mode | `tools/ai-acceptance-check.mjs` |
| Contact | Renders clickable email, phone, GitHub, and portfolio links | Both AI QA scripts |
| Skills | Gives concise grouped skills and avoids generic errors | `tools/ai-acceptance-check.mjs` |
| AI honesty | Does not claim expert-level AI or senior engineering status | `tools/ai-acceptance-check.mjs` |
| Projects | Gives approved RecycLens description and technologies | `tools/ai-acceptance-check.mjs` |
| Internship ownership | Clarifies OneOPS and related work were internship contributions, not solo ownership | `tools/ai-acceptance-check.mjs` |
| Career goals | Describes entry-level target roles honestly | `tools/ai-acceptance-check.mjs` |
| Prompt injection | Refuses to reveal internal instructions or secrets | `tools/ai-acceptance-check.mjs` |
| Unknown questions | Returns natural fallback guidance when local knowledge is not enough | `tools/ai-acceptance-check.mjs` |
| Validation | Rejects empty or overlength questions with safe text responses | API route and `tools/ai-acceptance-check.mjs` |
| Layout | Works on mobile, tablet, and desktop without horizontal overflow | `tools/ai-ui-phase5-check.mjs` |
| Accessibility | Checks labels, focus visibility, keyboard behavior, ARIA loading status, and Escape close | `tools/ai-ui-phase5-check.mjs` |
| Error fallback | Forced client fetch failure shows portfolio-safe fallback language | `tools/ai-ui-phase5-check.mjs` |

## Manual Review Checklist

- [ ] The assistant sounds professional, friendly, confident, and natural.
- [ ] Answers use first person unless the user asks for third person.
- [ ] Known questions do not expose provider/configuration errors.
- [ ] No API key, provider name, environment variable, stack trace, or local file
      path appears in the browser.
- [ ] Resume buttons are keyboard-accessible.
- [ ] Contact links are distinguishable from plain text.
- [ ] Project answers distinguish internship, academic, personal, and capstone
      work.
- [ ] The assistant presents Nikki as entry-level / recent graduate.
- [ ] Unsupported information uses a natural limitation message.

## Current Status

```text
Status: Implemented
Last audited requirement source: AI_PORTFOLIO_GUIDE.md from the user-provided attachment
Blocking QA issues: None known before final local verification
```

Update this file whenever portfolio data, response types, UI behavior, resume
handling, or AI safety rules change.
