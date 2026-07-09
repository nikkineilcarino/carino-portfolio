# AI Portfolio Assistant

This document defines the planned AI assistant feature for Nikki Neil P.
Carino's portfolio website. It is the source of truth for the AI feature scope,
behavior, implementation phases, and safety rules.

The AI assistant is not implemented yet. Development must proceed phase by
phase, with a QA review after every phase. After each phase, stop and wait for
the user's `continue` prompt.

## Current Status

```text
Feature status: Ready for commit, push, and deployment approval
Current phase status: Phase 6 - Deployment Preparation passed
Next phase: Commit, push, and deploy only after explicit user approval
Implementation status: Knowledge layer, prompt builder, API route, assistant UI, local safe-answer fallback, and UI QA script created
Deployment status: Prepared, not deployed for the AI feature
```

## Feature Goal

Add an AI assistant to the portfolio that helps recruiters, clients, and
visitors ask questions about Nikki's CV, skills, projects, experience,
education, certifications, and contact options.

The assistant should reduce friction for visitors who want quick answers
without manually reading every portfolio section.

## User Goals

The assistant should help visitors:

- Understand Nikki's professional background.
- Ask questions about the CV and portfolio content.
- Summarize Nikki's technical skills.
- Understand project roles, technologies, and constraints.
- Learn about QA, software development, and prompt engineering experience.
- Find the resume download link.
- Find contact options.
- Ask general technical or career-related questions when the answer is not
  directly in the portfolio.

## Scope

The first implemented version should include:

- A small AI assistant entry point on the portfolio.
- A chat panel or compact assistant interface.
- A visible `Thinking...` state while waiting for a response.
- A server-side AI route so API keys are never exposed to the browser.
- A portfolio knowledge layer built from approved portfolio constants.
- Clear handling for missing, confidential, or unavailable information.
- A fallback response when the AI service fails.

## Out of Scope for the First Version

Do not add these in the first implementation unless the user explicitly asks:

- User accounts.
- Conversation storage.
- Admin dashboards.
- Analytics tracking.
- Automatic learning from visitor messages.
- Uploading visitor files.
- Voice input or voice output.
- Public claims about unavailable screenshots, links, metrics, certificates, or
  confidential project details.

## Trusted Knowledge Sources

The assistant must use the current portfolio as the trusted source of truth.

Primary source files:

- `constants/site.ts`
- `constants/projects.ts`
- `constants/skills.ts`
- `constants/experience.ts`
- `constants/education.ts`
- `constants/certifications.ts`
- `constants/leadership.ts`
- `public/resume/Nikki_Neil_Carino_CV.pdf`
- `README.md`
- `CONTENT.md`
- `QA_CHECKLIST.md`
- `DEPLOYMENT.md`

If a claim is not present in the approved portfolio content, the assistant must
not present it as a fact about Nikki.

## Answer Rules

The assistant must follow these rules:

- Use portfolio facts first.
- If a visitor asks about Nikki, answer from approved portfolio and CV content.
- If the information is missing, say it is not currently provided in the
  portfolio.
- If the question is general and not about Nikki, answer with general AI
  knowledge and clarify that it is general information.
- If a visitor asks for confidential project details, explain that some details
  are intentionally kept general because of company or client confidentiality.
- Do not invent screenshots, live demos, GitHub links, certificates, metrics,
  employment claims, client details, private workflows, or private data.
- Keep answers professional, concise, and recruiter-friendly.
- Do not pretend to be Nikki. The assistant should present itself as a portfolio
  AI helper.
- Encourage the visitor to use the portfolio contact options when appropriate.

## Expected Questions

The assistant should be able to answer:

- What is Nikki's educational background?
- What skills does Nikki have?
- What projects has Nikki worked on?
- Can you summarize Nikki's QA experience?
- Can you summarize Nikki's software development experience?
- Does Nikki have prompt engineering or AI-assisted workflow experience?
- What technologies were used in RecycLens?
- Why are some project screenshots unavailable?
- Can I download the resume?
- How can I contact Nikki?
- Is Nikki suitable for a software development role?
- Is Nikki suitable for a QA role?
- What should I ask Nikki in an interview?

## UI Requirements

Recommended placement:

- Floating assistant button on the lower-right side of the portfolio.
- Compact chat panel that works on desktop, tablet, and mobile.

Required UI states:

- Closed: show a small assistant button.
- Open: show message history, greeting, input field, and send button.
- Loading: show `Thinking...`.
- Answered: show the assistant response.
- Empty input: do not send; prompt the visitor to type a question.
- Error: show a short fallback message.

Recommended greeting:

```text
Hi, I can answer questions about Nikki's portfolio, CV, skills, projects, and contact details.
```

Required loading text:

```text
Thinking...
```

Recommended fallback error:

```text
I could not answer that right now. Please try again in a moment.
```

## Planned Architecture

The implementation should keep AI logic on the server and UI logic on the
client.

Planned files:

```text
lib/ai/portfolio-context.ts - created in Phase 1
lib/ai/portfolio-prompt.ts - created in Phase 2
lib/ai/portfolio-fallback.ts - created in Phase 4
app/api/portfolio-ai/route.ts - created in Phase 2
components/ai/portfolio-ai-assistant.tsx - created in Phase 3
components/ai/portfolio-ai-message.tsx - created in Phase 3
components/ai/portfolio-ai-input.tsx - created in Phase 3
tools/ai-ui-phase5-check.mjs - created in Phase 5
constants/ai-knowledge.ts - optional future file only with user approval
```

`constants/ai-knowledge.ts` should only be added if the user approves extra
knowledge beyond the current portfolio content.

## Provider Strategy

The implementation can support a hosted AI provider and a local fallback.

Recommended approach:

- Use a server-side API route for provider calls.
- Store provider keys only in environment variables.
- Do not commit real API keys.
- Keep a simple fallback answer for API failures.
- If no provider key is configured, the assistant should answer approved
  portfolio questions with the local safe-answer fallback and explain that live
  AI is not configured for broader general questions.

Possible environment variables:

```text
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=
```

The API route returns a safe missing-configuration response when required
provider settings are absent. This keeps the future chat UI from breaking while
the hosted AI provider is not configured yet.

## Draft System Prompt

```text
You are the AI assistant for Nikki Neil P. Carino's portfolio website.
Answer questions about Nikki's CV, skills, projects, experience, education,
certifications, leadership, and contact details using the approved portfolio
context.

If a question asks about Nikki and the information is not in the portfolio
context, say that the information is not currently provided in the portfolio.

If a question is general and not about Nikki, answer helpfully using general AI
knowledge, but do not claim that the answer is a confirmed fact about Nikki.

Do not invent confidential details, screenshots, live demos, metrics, links,
employment claims, certificates, private workflows, or private information.

Keep answers professional, concise, and useful for recruiters, clients, and
portfolio visitors.
```

## Learning Rules

The assistant must not silently learn from visitor messages.

Approved learning flow:

- Keep the first version stateless.
- Collect no visitor personal data by default.
- Add new knowledge only when Nikki approves it.
- Store approved new knowledge in a reviewed source file.
- Re-run QA after adding new knowledge.

## Phase Roadmap

### Phase 0: Documentation and QA Setup

- Polish this README.
- Create `AI_PORTFOLIO_QA.md`.
- Confirm the phase-by-phase workflow.
- Do not implement AI code yet.

### Phase 1: Portfolio Knowledge Layer

- Create a typed knowledge object from approved portfolio constants.
- Create a helper that formats portfolio context for the AI prompt.
- Keep all claims traceable to existing portfolio content.
- Status: completed in `lib/ai/portfolio-context.ts`.

### Phase 2: Prompt and API Route

- Create the system prompt builder.
- Create a server-side API route.
- Add provider-neutral request and response handling.
- Add safe fallback behavior when no API key is configured.
- Status: completed in `lib/ai/portfolio-prompt.ts` and
  `app/api/portfolio-ai/route.ts`.

### Phase 3: Assistant UI

- Create the chat button and panel.
- Add the greeting, message list, input, send action, and `Thinking...` state.
- Keep layout responsive and accessible.
- Status: completed in `components/ai/`.

### Phase 4: Safety and Answer QA

- Test portfolio questions.
- Test general questions.
- Test missing-information questions.
- Test confidential-project questions.
- Confirm the assistant does not invent unsupported claims.
- Status: completed with local safe-answer fallback and route QA.

### Phase 5: UI, Accessibility, and Responsive QA

- Test desktop, tablet, and mobile behavior.
- Test keyboard navigation and focus states.
- Test empty input, long input, loading, error, and retry states.
- Status: completed with Edge headless browser QA in
  `tools/ai-ui-phase5-check.mjs`.

### Phase 6: Deployment Preparation

- Document required environment variables.
- Verify local build.
- Prepare Vercel configuration notes.
- Deploy only after explicit user approval.
- Status: completed in `DEPLOYMENT.md` and this README.

## QA Source

All AI assistant QA gates are documented in `AI_PORTFOLIO_QA.md`.

Do not move to the next phase unless the current phase passes QA or the user
explicitly approves continuing despite documented issues.
