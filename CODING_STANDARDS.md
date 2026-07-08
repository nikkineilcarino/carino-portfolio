# Coding Standards

These standards apply to the portfolio implementation phases.

## General

- Use TypeScript for application code.
- Keep files small, focused, and easy to review.
- Prefer explicit types for shared data structures.
- Keep repeated visible content in constants.
- Avoid unrelated refactors.
- Avoid unnecessary dependencies.

## React and Next.js

- Use the Next.js App Router.
- Keep page files focused on composition.
- Build reusable UI in `components/` during the proper SDLC phase.
- Store portfolio data in `constants/` during the proper SDLC phase.
- Use semantic HTML for sections, headings, lists, navigation, and buttons.

## Styling

- Use Tailwind CSS as the primary styling approach.
- Keep the interface minimalist and professional.
- Use consistent spacing, typography, radius, and shadows.
- Avoid distracting effects, heavy animation, and visual clutter.
- Support responsive layouts from mobile to desktop.

## Accessibility

- Maintain a clear heading hierarchy.
- Add descriptive alt text for every real image.
- Ensure interactive elements are keyboard accessible.
- Use visible focus states.
- Respect reduced-motion preferences when animations are added.
- Do not hide essential content behind hover-only interactions.

## Content Integrity

- Use only approved prompt content, attached CV content, and approved assets.
- Do not use Lorem Ipsum.
- Do not invent project details, links, certifications, metrics, or proof.
- Mark unavailable information honestly.
- Keep confidential company-owned and client-owned project content general.

## Verification

- Run `npm run lint` after code changes.
- Run `npm run build` before considering implementation phases complete.
- Document any known issues that cannot be safely fixed immediately.
