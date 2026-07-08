# QA Checklist for Nikki Neil P. Cariño Portfolio Website

This document is the official quality assurance checklist for the portfolio
website of Nikki Neil P. Cariño.

The purpose of this checklist is to make sure that every SDLC phase is reviewed
before moving to the next phase.

This portfolio must remain truthful, minimalist, professional, UI/UX-friendly,
responsive, accessible, recruiter-friendly, technical-reviewer-friendly, and
confidentiality-safe.

## QA Workflow Rule

Every SDLC phase must follow this workflow:

1. Complete only the requested phase.
2. Review the matching QA section in this checklist.
3. Update the phase status.
4. Report what passed, what needs fixing, and what remains as TODO.
5. Stop and wait for the user's `continue` command.

Do not continue to the next phase automatically.

When the user types:

```text
continue
```

proceed only to the next unfinished phase.

When the user types:

```text
continue to phase [number]
```

proceed only to that specific phase if all prior required QA gates are
acceptable.

## QA Status System

Use only these QA statuses:

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

Codex must not proceed to the next phase unless the current phase status is:

```text
Passed
```

or the user explicitly approves continuing despite TODOs.

## Required End-of-Phase Report Format

At the end of every phase, respond using exactly this structure:

```markdown
## Phase Completed: [Phase Number and Phase Name]

### Completed
- List what was completed.

### Files Created or Modified
- List each file created or modified.

### QA Review
Status: Pending / Passed / Needs Fixes / Blocked

### QA Checks Performed
- List the checks performed for this phase.

### Issues or TODOs
- List issues, missing files, broken links, incomplete content, or TODOs.
- If none, write: None.

### Next Phase
The next phase is: [Next Phase Name]

Type `continue` to proceed to the next phase.
```

Do not continue after giving this report.

## General QA Rules

Before moving to the next SDLC phase, check the following:

* [x] The completed work follows only the current SDLC phase.
* [x] No future phase was started without permission.
* [x] No fake information was added.
* [x] No unapproved portfolio placeholder content was added.
* [x] No Lorem Ipsum was used in new documentation.
* [x] No confidential company or client details were invented.
* [x] Missing information is marked with a clear TODO comment when applicable.
* [x] The design direction remains minimalist, simple, and professional.
* [x] The website remains recruiter-friendly and technical-reviewer-friendly.
* [x] The code or documentation is clean, organized, and maintainable.
* [x] The work aligns with the attached CV/resume and approved portfolio prompt.
* [x] The work does not invent links, screenshots, certificates, metrics, or achievements.
* [x] The work does not expose private, confidential, or company-owned materials without approval.

General Status:

```text
Passed
```

General Notes:

```text
General QA rules were integrated during Phase 1. The original README lorem ipsum was replaced during Phase 2.
```

## Phase 0 QA: Read, Understand, and Inspect

Check that Codex has:

* [x] Read the full portfolio SDLC prompt.
* [x] Understood the phase-by-phase workflow.
* [x] Inspected the current repository.
* [x] Confirmed the current branch.
* [x] Confirmed the remote URL.
* [x] Confirmed the local Git identity.
* [x] Confirmed that the local Git identity uses `nikkineilcarino`.
* [x] Confirmed that commits should not use the global `nsoadorable` identity.
* [x] Checked if the project is initialized.
* [x] Checked existing files and folder structure.
* [x] Identified whether Next.js, TypeScript, and Tailwind CSS are already configured.
* [x] Reviewed attached CV/resume and assets if accessible.
* [x] Created or documented the SDLC phase checklist.
* [x] Did not build the website yet.
* [x] Did not create components yet.
* [x] Did not start Phase 1 automatically.

Status:

```text
Passed
```

Notes:

```text
Phase 0 completed with SDLC_PLAN.md. Repository is on main, remote points to nikkineilcarino/carino-portfolio, local Git identity is correct, and no implementation work was started.
```

## Phase 1 QA: QA Rules Integration

Check that Codex has:

* [x] Created or updated `QA_CHECKLIST.md`.
* [x] Added general QA rules.
* [x] Added QA checks for every SDLC phase.
* [x] Added asset QA rules.
* [x] Added truthfulness QA rules.
* [x] Added confidentiality QA rules.
* [x] Added required end-of-phase report format.
* [x] Added the approved QA status system.
* [x] Confirmed that every future phase requires QA review before continuing.
* [x] Updated planning documentation only if needed.
* [x] Did not build website UI yet.
* [x] Did not create unrelated components.
* [x] Did not proceed to Phase 2 automatically.

Status:

```text
Passed
```

Notes:

```text
Phase 1 created the official QA checklist and updated planning documentation to require QA gates before future phases.
```

## Phase 2 QA: Project Setup and Documentation

Check that Codex has:

* [x] Confirmed or initialized the Next.js project correctly.
* [x] Confirmed TypeScript setup.
* [x] Confirmed Tailwind CSS setup.
* [x] Adapted to the existing project structure instead of replacing everything blindly.
* [x] Created or updated `README.md`.
* [x] Created or updated `CONTENT.md`.
* [x] Created or updated `DESIGN_SYSTEM.md`.
* [x] Created or updated `COMPONENT_SPEC.md`.
* [x] Created or updated `TASKS.md`.
* [x] Created or updated `CODING_STANDARDS.md`.
* [x] Preserved `QA_CHECKLIST.md`.
* [x] Did not build unrelated UI sections.
* [x] Did not invent missing data.
* [x] Did not use Lorem Ipsum.
* [x] Stopped after completing Phase 2.

Status:

```text
Passed
```

Notes:

```text
Phase 2 initialized a minimal Next.js, React, TypeScript, Tailwind CSS, and ESLint foundation; created required planning documentation; replaced the original lorem ipsum README; and passed lint and production build checks. npm audit reports two moderate transitive vulnerabilities in Next.js/PostCSS where the suggested fix is a breaking forced change, so this is documented as a non-blocking dependency tracking item.
```

## Phase 3 QA: Content Source of Truth

Check that Codex has:

* [x] Filled `CONTENT.md` using only the approved prompt and attached CV/resume.
* [x] Included Hero content.
* [x] Included About Me content.
* [x] Included Skills content.
* [x] Included Experience content.
* [x] Included Projects content.
* [x] Included Leadership content.
* [x] Included Certifications and Professional Development content.
* [x] Included Education content.
* [x] Included Contact content.
* [x] Included Footer content.
* [x] Marked missing links as TODO.
* [x] Marked unavailable live demos honestly.
* [x] Marked unavailable screenshots honestly.
* [x] Did not invent project details.
* [x] Did not add fake achievements.
* [x] Did not add fake certifications.
* [x] Did not add fake metrics.
* [x] Did not add fake GitHub or live demo links.
* [x] Stopped after completing Phase 3.

Status:

```text
Passed
```

Notes:

```text
Phase 3 completed CONTENT.md as the approved content source of truth using the portfolio prompt and extracted CV text. Missing live demos, project GitHub links, LinkedIn, location, project screenshots, and certificate images are marked honestly instead of invented.
```

## Phase 4 QA: Design System

Check that Codex has:

* [x] Filled `DESIGN_SYSTEM.md`.
* [x] Defined color palette.
* [x] Defined typography rules.
* [x] Defined spacing rules.
* [x] Defined border radius rules.
* [x] Defined shadow rules.
* [x] Defined button styles.
* [x] Defined card styles.
* [x] Defined animation rules.
* [x] Defined responsive design rules.
* [x] Defined accessibility rules.
* [x] Kept the design minimalist and professional.
* [x] Kept the design web-friendly.
* [x] Kept the design mobile/app-like.
* [x] Avoided flashy or distracting design choices.
* [x] Avoided excessive animations.
* [x] Stopped after completing Phase 4.

Status:

```text
Passed
```

Notes:

```text
Phase 4 completed DESIGN_SYSTEM.md with concrete rules for colors, typography, spacing, border radius, shadows, buttons, cards, images, navigation, responsive behavior, motion, accessibility, and Tailwind implementation guidance. No UI components or page sections were created.
```

## Phase 5 QA: Architecture and Data Structure

Check that Codex has:

* [x] Created or adapted the `app` folder.
* [x] Created or adapted the `components` folder.
* [x] Created or adapted the `constants` folder.
* [x] Created or adapted the `lib` folder.
* [x] Created or adapted the `public` folder.
* [x] Created or adapted the `types` folder.
* [x] Created or prepared `public/images/profile`.
* [x] Created or prepared `public/images/projects`.
* [x] Created or prepared `public/images/certificates`.
* [x] Created or prepared `public/resume`.
* [x] Created constants for navigation.
* [x] Created constants for skills.
* [x] Created constants for projects.
* [x] Created constants for experience.
* [x] Created constants for education.
* [x] Created constants for leadership.
* [x] Created constants for certifications.
* [x] Used typed data structures where needed.
* [x] Did not hardcode repeated visible content directly into the page component.
* [x] Stopped after completing Phase 5.

Status:

```text
Passed
```

Notes:

```text
Phase 5 created the required architecture folders, typed data structures, typed constants from CONTENT.md, public asset directories with placeholders, and a small utility helper. No UI components, page sections, or real assets were added.
```

## Phase 6 QA: Asset and CV Setup

Check that Codex has:

* [x] Used only the attached CV/resume file.
* [x] Did not create a fake CV or resume.
* [x] Did not rewrite or edit the CV content.
* [x] Saved the CV in `public/resume/`.
* [x] Renamed the CV to `Nikki_Neil_Carino_CV.pdf`.
* [x] Confirmed the CV path is `/resume/Nikki_Neil_Carino_CV.pdf`.
* [x] Used only the attached profile photo if available.
* [x] Saved the profile photo in `public/images/profile/`.
* [x] Used only attached project screenshots if available.
* [x] Saved project screenshots in `public/images/projects/`.
* [x] Used only attached certificate images if available.
* [x] Saved certificate images in `public/images/certificates/`.
* [x] Added TODO comments for unavailable assets.
* [x] Did not use random stock photos.
* [x] Did not use AI-generated images unless requested.
* [x] Did not expose confidential screenshots without approval.
* [x] Stopped after completing Phase 6.

Status:

```text
Passed
```

Notes:

```text
Phase 6 copied the verified CV PDF to public/resume/Nikki_Neil_Carino_CV.pdf and the verified profile photo to public/images/profile/nikki-neil-carino-profile.jpg. The originally referenced CV filename was not present, but the current local UpdatedResume_CariñoNikkiNeil.pdf matched the previously verified CV by size, timestamp, and extracted content. No project screenshots or certificate images were provided, so those directories remain prepared without fake assets.
```

## Phase 7 QA: Reusable UI Components

Check that Codex has created or prepared:

* [x] Button component.
* [x] SectionContainer component.
* [x] SectionHeader component.
* [x] SkillBadge component.
* [x] SkillCard component.
* [x] TimelineItem component.
* [x] ExperienceTimeline component.
* [x] ProjectCard component.
* [x] LeadershipCard component.
* [x] CertificateCard component.
* [x] EducationCard component.
* [x] ContactButton component.
* [x] ScrollIndicator component.
* [x] Navbar component.
* [x] Footer component.
* [x] Components are reusable.
* [x] Components are typed properly.
* [x] Components follow accessibility basics.
* [x] Components do not contain fake content.
* [x] Components do not contain Lorem Ipsum.
* [x] Components do not contain hardcoded repeated data that should be in constants.
* [x] Stopped after completing Phase 7.

Status:

```text
Passed
```

Notes:

```text
Phase 7 created the required reusable components with typed props, accessible states, honest unavailable-asset/link handling, and data-driven defaults from constants. No main page sections were composed.
```

## Phase 8 QA: Main Page Sections

Check that Codex has built:

* [x] Navbar section.
* [x] Hero section.
* [x] About section.
* [x] Skills section.
* [x] Experience section.
* [x] Projects section.
* [x] Leadership section.
* [x] Certifications section.
* [x] Education section.
* [x] Contact section.
* [x] Footer section.
* [x] Sections use the approved content source of truth.
* [x] Sections use actual available assets only.
* [x] Resume/CV buttons point to the correct CV path.
* [x] Sections are readable.
* [x] Sections are responsive.
* [x] No placeholder text exists.
* [x] No fake links exist.
* [x] No fake screenshots exist.
* [x] Stopped after completing Phase 8.

Status:

```text
Passed
```

Notes:

```text
Phase 8 composed the full portfolio page in the required order using approved content, constants, reusable components, the real profile image, and the real resume path. The local route, resume PDF, and profile image all returned HTTP 200 on the dev server.
```

## Phase 9 QA: UI/UX Interactions and Animations

Check that Codex has added only approved interactions:

* [x] Smooth scrolling.
* [x] Sticky navigation.
* [x] Navbar blur on scroll.
* [x] Active section highlighting.
* [x] Mobile menu animation.
* [x] Button hover and press states.
* [x] Card hover lift.
* [x] Skill badge hover effects.
* [x] Subtle fade-in while scrolling.
* [x] Project card expansion if needed.
* [x] Clear focus states.
* [x] No flashing elements.
* [x] No floating particles.
* [x] No heavy parallax.
* [x] No excessive typing effects.
* [x] No distracting animations.
* [x] No autoplay media.
* [x] No unnecessary popups.
* [x] Interactions improve usability.
* [x] Stopped after completing Phase 9.

Status:

```text
Passed
```

Notes:

```text
Phase 9 added smooth scrolling, reduced-motion safeguards, active section highlighting, scroll-state navigation styling, animated mobile navigation, press states, card and badge hover polish, and subtle section reveal behavior. Project card expansion was not added because the current project cards do not hide extra approved details that require expansion.
```

## Phase 10 QA: Responsive Design and App-Like Mobile UX

Check that Codex has verified:

* [x] Desktop layout.
* [x] Laptop layout.
* [x] Tablet layout.
* [x] Mobile layout.
* [x] No horizontal scrolling.
* [x] Text remains readable on small screens.
* [x] Buttons are touch-friendly.
* [x] Cards stack properly.
* [x] Mobile navigation works.
* [x] Project cards are easy to scroll through.
* [x] Profile photo displays properly on mobile.
* [x] Certificate cards display properly on mobile.
* [x] Project screenshots display properly on mobile.
* [x] Mobile version feels polished and app-like.
* [x] Desktop version feels spacious and professional.
* [x] Stopped after completing Phase 10.

Status:

```text
Passed
```

Notes:

```text
Phase 10 verified mobile, tablet, laptop, and desktop layouts with Playwright viewport checks. Contact buttons were changed to avoid tablet overflow, contact labels now wrap safely, navigation and footer tap targets meet the 44px guideline, and the profile image is constrained on tablet while remaining spacious on desktop. Project screenshots and certificate images remain unavailable by design; their cards were checked as responsive no-asset states.
```

## Phase 11 QA: Accessibility and SEO

Check that Codex has verified:

* [x] Semantic HTML is used.
* [x] Heading hierarchy is correct.
* [x] Images have descriptive alt text.
* [x] Buttons are keyboard accessible.
* [x] Focus states are visible.
* [x] Aria labels are added where needed.
* [x] Reduced-motion preference is respected.
* [x] Essential content is not hidden behind hover only.
* [x] Mobile menu is keyboard accessible.
* [x] Color contrast is readable.
* [x] SEO title is added.
* [x] SEO description is added.
* [x] SEO keywords are added.
* [x] Open Graph metadata is added.
* [x] Missing favicon or social preview image is marked as TODO.
* [x] Stopped after completing Phase 11.

Status:

```text
Passed
```

Notes:

```text
Phase 11 added approved SEO metadata, Open Graph metadata, Twitter summary metadata, a keyboard-visible skip link, improved mobile menu keyboard behavior, and documented TODOs for a dedicated favicon/logo and social preview image. The temporary browser icon uses the approved profile photo asset. Browser checks confirmed one H1, ordered section headings, descriptive image alt text, working skip-link focus, keyboard-operable mobile navigation, reduced-motion behavior, and contrast samples above the normal-text threshold after darkening muted text.
```

## Phase 12 QA: Testing and Quality Assurance

Check that Codex has tested:

* [x] Desktop layout.
* [x] Tablet layout.
* [x] Mobile layout.
* [x] Navbar links.
* [x] Mobile menu.
* [x] Buttons.
* [x] Resume/CV download.
* [x] Profile photo display.
* [x] Project screenshots.
* [x] Certificate image display.
* [x] GitHub buttons.
* [x] LinkedIn button if available.
* [x] Email button.
* [x] Keyboard navigation.
* [x] Focus states.
* [x] Reduced motion behavior.
* [x] Console errors.
* [x] Build errors.
* [x] Lighthouse readiness.

Required commands:

```bash
npm run lint
npm run build
```

Check:

* [x] Lint passes or documented if no lint script exists.
* [x] Build passes.
* [x] All blocking errors are fixed.
* [x] Stopped after completing Phase 12.

Status:

```text
Passed
```

Notes:

```text
Phase 12 ran lint, production build, diff checks, browser viewport QA, route checks, keyboard and focus checks, reduced-motion checks, console checks, and a production Lighthouse readiness audit. The skip link was adjusted to a 44px focus target, and the approved profile image was configured as the temporary browser icon to avoid a favicon 404. Lighthouse on the production server scored 100 accessibility, 100 best practices, and 100 SEO with no failed binary audits. Project and certificate image checks passed as unavailable-asset states because no approved images were provided; no fake images were added. LinkedIn was not rendered because no approved LinkedIn link was provided.
```

## Phase 13 QA: Final Polish

Check that Codex has reviewed:

* [x] Spacing consistency.
* [x] Typography consistency.
* [x] Button consistency.
* [x] Card consistency.
* [x] Mobile polish.
* [x] Desktop polish.
* [x] App-like mobile experience.
* [x] TODO comments.
* [x] Missing links.
* [x] Asset paths.
* [x] Confidentiality-safe project descriptions.
* [x] No fake data.
* [x] No Lorem Ipsum.
* [x] No unnecessary animations.
* [x] Overall portfolio impression.
* [x] Stopped after completing Phase 13.

Status:

```text
Passed
```

Notes:

```text
Phase 13 reviewed the UI for spacing, typography, button/card consistency, mobile polish, desktop polish, TODO clarity, missing links, asset paths, confidentiality-safe project descriptions, fake data, lorem ipsum, and motion restraint. Stale planning wording was updated in README, SDLC_PLAN.md, DESIGN_SYSTEM.md, and CONTENT.md. No fake assets, links, screenshots, metrics, or certifications were added.
```

## Phase 14 QA: Deployment Preparation

Check that Codex has confirmed:

* [x] Production build passes.
* [x] No console errors exist.
* [x] Metadata is added.
* [x] Responsive design works.
* [x] TODO links are clearly marked.
* [x] No fake links exist.
* [x] No placeholder text exists.
* [x] No Lorem Ipsum exists.
* [x] CV download path is correct.
* [x] Asset paths are correct.
* [x] Deployment notes are prepared.
* [x] Website is ready for Vercel deployment.

Status:

```text
Passed
```

Notes:

```text
Phase 14 confirmed production build readiness, route and asset paths, metadata, responsive readiness, TODO clarity, placeholder/lorem ipsum checks, and Vercel deployment settings. DEPLOYMENT.md was added with Vercel-ready settings, pre-deployment commands, known TODOs, and source links to official Vercel deployment documentation. The portfolio is ready to commit, push, and import into Vercel after explicit user approval.
```

## Asset QA Rules

When assets are added, Codex must verify:

* [x] The profile photo displays correctly.
* [x] The CV download link works.
* [x] Project screenshots display only when approved and available.
* [x] Certificate images display only when available.
* [x] No broken image paths exist.
* [x] No fake images are used.
* [x] Every image has alt text.
* [x] Confidential project screenshots are not exposed.
* [x] Mobile image layout is responsive.
* [x] Images do not slow down the page unnecessarily.

Asset QA Status:

```text
Passed
```

Asset QA Notes:

```text
Phase 13 confirmed the profile photo, resume PDF, and temporary profile-photo browser icon use approved assets. Project screenshots and certificate images remain unavailable by design, so no fake images are rendered. The profile image has descriptive alt text and passed mobile, tablet, desktop, and route checks.
```

## Confidentiality QA Rules

For Microgenesis Central Hub, OneOps, BTr HCM, and any company-owned or
client-owned projects:

* [x] Do not expose confidential internal information.
* [x] Do not invent system details.
* [x] Do not display screenshots unless the user provides and approves them.
* [x] Use general, professional descriptions when needed.
* [x] Add confidentiality notes where screenshots or proof are unavailable.
* [x] Do not reveal private company data, client data, credentials, source code, or internal workflows.

Confidentiality QA Status:

```text
Passed
```

Confidentiality QA Notes:

```text
Phase 13 confirmed Microgenesis Central Hub, OneOps, BTr HCM, and client-owned project descriptions remain general and confidentiality-safe. Screenshots and proof are withheld unless approved assets are provided, and the UI displays confidentiality-safe notes instead of private material.
```

## Truthfulness QA Rules

Before completing any phase, verify:

* [x] All content comes from the approved prompt or attached CV/resume.
* [x] No unapproved project is added.
* [x] No unapproved certification is added.
* [x] No fake live demo is added.
* [x] No fake GitHub link is added.
* [x] No fake metric is added.
* [x] No fake role is added.
* [x] No fake company detail is added.
* [x] No fake screenshot is added.
* [x] No fake certificate image is added.
* [x] Missing information is marked as TODO.

Truthfulness QA Status:

```text
Passed
```

Truthfulness QA Notes:

```text
Phase 13 confirmed missing live demos, project GitHub links, LinkedIn, location, project screenshots, certificate images, a dedicated favicon/logo, and a social preview image remain clearly marked as unavailable or TODO. No fake links, metrics, achievements, screenshots, certificates, or company details were added.
```

## Final QA Principle

This portfolio should not only look good.

It should be checked like a real software product.

Every phase must pass a basic QA review before moving forward.

Do not continue to the next phase automatically.

Wait for the user's `continue` command.
