# Nikki Neil P. Cariño Portfolio SDLC Plan

## Phase 0 Status

Phase 0 is complete. It documented the repository state, Git attribution setup,
available assets, and the SDLC checklist before any portfolio implementation
begins.

Implementation has not started. No Next.js, React, Tailwind CSS, component, page,
or asset-copying work has been performed in this phase.

## QA Gate Rule

`QA_CHECKLIST.md` is the official QA guide for this portfolio project.

Every future SDLC phase must:

1. Complete only the requested phase.
2. Review the matching QA section in `QA_CHECKLIST.md`.
3. Update the phase status using only `Pending`, `Passed`, `Needs Fixes`, or
   `Blocked`.
4. Report the QA checks performed, issues, and TODOs.
5. Stop and wait for the user's `continue` command.

Codex must not proceed to the next phase unless the current phase status is
`Passed`, or the user explicitly approves continuing despite TODOs.

## Repository Summary

- Repository path: `C:\Cariño_Portfolio`
- Git branch: `main`
- Remote URL: `https://github.com/nikkineilcarino/carino-portfolio.git`
- Tracked files at inspection time:
  - `README.md`
- Current README state:
  - Replaced during Phase 2 with SDLC-aware project documentation.

## Git Attribution

Commits in this repository must use this local Git identity:

```bash
git config --local user.name "nikkineilcarino"
git config --local user.email "261335732+nikkineilcarino@users.noreply.github.com"
```

Confirmed local identity:

```text
user.name: nikkineilcarino
user.email: 261335732+nikkineilcarino@users.noreply.github.com
```

Global Git identity must not be modified for this project.

## Existing Project Setup

- The repository is initialized as a Git repository.
- The repository is connected to `origin/main`.
- No `package.json` is present yet.
- No Next.js app files are present yet.
- No TypeScript configuration is present yet.
- No Tailwind CSS configuration is present yet.
- No `app/`, `components/`, `constants/`, `lib/`, `types/`, or `public/`
  project structure exists yet.

This means the implementation phase should initialize or scaffold the portfolio
carefully instead of replacing an existing app.

## Asset Availability

Available attached assets:

- CV/resume:
  - Source file: `C:\Users\Nikki\Downloads\UpdatedResume_CariñoNikkiNeil.pdf`
  - Verified as a PDF file.
  - Size: 72,125 bytes.
  - Target path: `public/resume/Nikki_Neil_Carino_CV.pdf`
- Profile photo:
  - Source file: `C:\Users\Nikki\Downloads\Formal picture.jpg`
  - Verified as a JPG image.
  - Dimensions: 2400 x 3000.
  - Target path: `public/images/profile/nikki-neil-carino-profile.jpg`

No project screenshots or certificate images have been provided yet.

Asset rules:

- Use only actual attached files.
- Do not invent images, screenshots, certificates, links, or resume files.
- Do not use random stock images.
- Do not use AI-generated images unless explicitly requested.
- Use TODO comments instead of broken asset paths when files are unavailable.
- Do not expose confidential company-owned or client-owned screenshots unless
  explicitly provided and approved.

## Portfolio Source of Truth

Name:

```text
Nikki Neil P. Cariño
```

Professional profile:

```text
Information Technology graduate with internship experience in Quality Assurance,
software development, AI prompt engineering, and project management. Experienced
in testing enterprise applications, developing full-stack web and mobile
solutions, leading academic software projects, and applying AI-assisted
development workflows.
```

Target roles:

- Software Engineer
- Web Developer
- Frontend Developer
- Backend Developer
- Full-Stack Developer
- QA Engineer
- Manual QA Tester
- Prompt Engineer
- IT Support or IT-related entry-level roles

Required website sections, in order:

1. Navigation Bar
2. Hero Section
3. About Me
4. Skills
5. Experience
6. Featured Projects
7. Leadership
8. Certifications and Professional Development
9. Education
10. Contact
11. Footer

Implementation stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

Not currently used:

- Framer Motion
- shadcn/ui
- Vercel Analytics
- Dark mode, only if cleanly and consistently implemented

## SDLC Phase Checklist

### Phase 0: Read, Understand, and Inspect

Goal: Understand the requirements, inspect the repository, confirm Git identity,
and prepare the phase plan.

Deliverables:

- Repository summary
- Git identity confirmation
- Existing project setup summary
- SDLC phase checklist
- Asset availability summary
- Next-step recommendation

Status: Completed after Prompt 1. See `QA_CHECKLIST.md`.

### Phase 1: QA Rules Integration

Goal: Wait for and integrate the QA rules and regulations prompt.

Planned deliverables:

- `QA_CHECKLIST.md`
- QA gates for every future phase
- Asset QA rules
- Required end-of-phase reporting format

Status: Completed after Prompt 2. See `QA_CHECKLIST.md`.

### Phase 2: Project Setup and Documentation

Goal: Set up or confirm the project foundation and create documentation files.

Planned deliverables:

- Project setup decision based on the current repo state
- `README.md`
- `CONTENT.md`
- `DESIGN_SYSTEM.md`
- `COMPONENT_SPEC.md`
- `TASKS.md`
- `CODING_STANDARDS.md`

Status: Completed after Prompt 3. See `QA_CHECKLIST.md`.

### Phase 3: Content Source of Truth

Goal: Create the complete content source of truth before building the interface.

Planned deliverables:

- Completed `CONTENT.md`
- Approved content for all required website sections
- TODO comments for missing links, screenshots, demos, and other unavailable data

Status: Completed after Prompt 4. See `QA_CHECKLIST.md`.

### Phase 4: Design System

Goal: Create visual rules before creating components.

Planned deliverables:

- Completed `DESIGN_SYSTEM.md`
- Visual rules for color, typography, spacing, radius, shadows, buttons, cards,
  animations, responsive behavior, and accessibility

Status: Completed after Prompt 5. See `QA_CHECKLIST.md`.

### Phase 5: Architecture and Data Structure

Goal: Prepare project architecture and typed data files.

Planned deliverables:

- `app/`
- `components/`
- `constants/`
- `lib/`
- `public/`
- `types/`
- Typed constants for repeated visible content

Status: Completed after Prompt 6. See `QA_CHECKLIST.md`.

### Phase 6: Asset and CV Setup

Goal: Organize approved assets and CV files.

Planned deliverables:

- `public/resume/Nikki_Neil_Carino_CV.pdf`
- `public/images/profile/nikki-neil-carino-profile.jpg`
- Project screenshot folders, if approved assets are provided
- Certificate image folders, if approved assets are provided
- TODO comments for unavailable assets

Status: Completed after Prompt 7. See `QA_CHECKLIST.md`.

### Phase 7: Reusable UI Components

Goal: Build reusable components before creating page sections.

Planned component order:

1. Button
2. SectionContainer
3. SectionHeader
4. SkillBadge
5. SkillCard
6. TimelineItem
7. ExperienceTimeline
8. ProjectCard
9. LeadershipCard
10. CertificateCard
11. EducationCard
12. ContactButton
13. ScrollIndicator
14. Navbar
15. Footer

Status: Completed after Prompt 8. See `QA_CHECKLIST.md`.

### Phase 8: Main Page Sections

Goal: Build the full page layout using reusable components and content constants.

Planned section order:

1. Navbar
2. Hero
3. About
4. Skills
5. Experience
6. Projects
7. Leadership
8. Certifications
9. Education
10. Contact
11. Footer

Status: Completed after Prompt 9. See `QA_CHECKLIST.md`.

### Phase 9: UI/UX Interactions and Animations

Goal: Add subtle, useful interactivity.

Allowed interaction categories:

- Smooth scrolling
- Sticky navigation
- Navbar blur on scroll
- Active section highlighting
- Mobile menu animation
- Button hover and press states
- Card hover lift
- Skill badge hover effects
- Subtle fade-in while scrolling
- Project card expansion
- Clear focus states

Status: Completed after Prompt 10. See `QA_CHECKLIST.md`.

### Phase 10: Responsive Design and App-Like Mobile UX

Goal: Polish the website for desktop, tablet, and mobile users.

Planned checks:

- Spacious desktop layout
- Mobile-first layout
- Touch-friendly buttons
- Clean mobile navigation
- Readable mobile text
- No horizontal scrolling
- Lightweight animation behavior

Status: Completed after Prompt 11. See `QA_CHECKLIST.md`.

### Phase 11: Accessibility and SEO

Goal: Make the portfolio accessible and searchable.

Planned deliverables:

- Semantic HTML checks
- Heading hierarchy checks
- Alt text for images
- Keyboard accessibility
- Focus states
- Reduced motion support
- Metadata title, description, keywords, and Open Graph metadata
- Favicon TODO if missing
- Social preview image TODO if missing

Status: Completed after Prompt 12. See `QA_CHECKLIST.md`.

### Phase 12: Testing and Quality Assurance

Goal: Test the project like a real portfolio product.

Planned commands:

```bash
npm run lint
npm run build
```

Planned checks:

- Desktop, tablet, and mobile layout
- Navbar links and mobile menu
- Buttons and resume download
- Profile photo display
- Project and certificate images
- Email and external links
- Keyboard navigation
- Focus states
- Reduced motion behavior
- Console and build errors
- Lighthouse readiness

Status: Completed after Prompt 13. See `QA_CHECKLIST.md`.

### Phase 13: Final Polish

Goal: Improve small details before deployment.

Planned checks:

- Spacing consistency
- Typography consistency
- Card and button polish
- TODO comments
- No fake data
- No lorem ipsum
- Confidentiality-safe project descriptions
- Correct asset paths
- Polished mobile experience

Status: Completed after Prompt 14. See `QA_CHECKLIST.md`.

### Phase 14: Deployment Preparation

Goal: Prepare the project for deployment on Vercel.

Planned deliverables:

- Passing production build
- Metadata confirmation
- Responsive design confirmation
- TODO and placeholder audit
- Deployment notes

Status: Completed after Prompt 15. See `QA_CHECKLIST.md`.

## Next-Step Recommendation

Phase 14 is complete. The SDLC portfolio build phases are complete.
Do not deploy, commit, or push unless the user explicitly approves it.
