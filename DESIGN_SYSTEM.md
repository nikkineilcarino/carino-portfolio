# Design System

This document defines the visual and interaction rules for the Nikki Neil P.
Cariño portfolio website.

Use this file before building reusable components or page sections. The goal is a
minimal, professional, recruiter-friendly portfolio that feels polished on both
desktop and mobile without becoming decorative or distracting.

## Design Principles

- Keep the interface simple, spacious, and easy to scan.
- Prioritize reading comfort over visual effects.
- Make the mobile experience feel deliberate and app-like, not like a squeezed
  desktop layout.
- Use real approved assets only.
- Keep company-owned and client-owned project content confidentiality-safe.
- Avoid unnecessary abstraction, animation, and decoration.
- Do not use Lorem Ipsum or placeholder portfolio content.

## Visual Direction

The portfolio should feel close to a modern product interface:

- Clean neutral surfaces
- Strong typography hierarchy
- Subtle borders instead of heavy decoration
- Clear action buttons
- Compact but readable project and experience cards
- Minimal motion used only to improve orientation

Use restrained cues inspired by Vercel, Linear, Stripe, GitHub, and Apple, while
keeping the final result personal and truthful to Nikki Neil P. Cariño.

## Color Palette

Use a mostly neutral interface with a small set of accents. Do not let the page
become dominated by one hue family.

### Core Colors

| Token | Hex | Use |
| --- | --- | --- |
| `background` | `#FAFAFA` | Main page background |
| `foreground` | `#18181B` | Primary text |
| `surface` | `#FFFFFF` | Cards, panels, menus |
| `surface-muted` | `#F4F4F5` | Quiet section contrast |
| `surface-raised` | `#FFFFFF` | Elevated cards |
| `border` | `#E4E4E7` | Default borders |
| `border-strong` | `#D4D4D8` | Emphasized dividers |
| `muted` | `#52525B` | Secondary text with accessible contrast on white and light-gray surfaces |
| `muted-strong` | `#3F3F46` | Supporting labels |

### Accent Colors

| Token | Hex | Use |
| --- | --- | --- |
| `accent` | `#0F766E` | Primary actions and active states |
| `accent-hover` | `#115E59` | Primary action hover |
| `accent-soft` | `#CCFBF1` | Soft accent background |
| `secondary` | `#2563EB` | Secondary links and focus support |
| `secondary-soft` | `#DBEAFE` | Soft secondary background |
| `warm` | `#B45309` | Small highlights for leadership/certifications |
| `warm-soft` | `#FEF3C7` | Soft warm background |

### Semantic Colors

| Token | Hex | Use |
| --- | --- | --- |
| `success` | `#15803D` | Success states if needed |
| `warning` | `#A16207` | Caution states if needed |
| `danger` | `#B91C1C` | Error states if needed |
| `focus` | `#2563EB` | Focus ring |

### Color Rules

- Use `background` as the default page color.
- Use `surface` for cards, menus, and framed content.
- Use `accent` sparingly for primary CTAs, active navigation, and important
  highlights.
- Use `secondary` only for supporting links or focus reinforcement.
- Use `warm` sparingly for small non-primary highlights.
- Avoid heavy gradients, neon colors, decorative blobs, and large colored bands.
- Keep body text contrast high against the background.
- Do not place low-contrast muted text on tinted backgrounds.

## Typography

Use a system-first sans-serif stack to keep the site fast and professional:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

If Inter is not loaded, the system fallback is acceptable.

### Type Scale

| Role | Mobile | Desktop | Line height | Weight |
| --- | --- | --- | --- | --- |
| Display / hero name | `2.25rem` | `3.75rem` | `1.05` | `700` |
| Page section heading | `1.75rem` | `2.25rem` | `1.15` | `650` |
| Card title | `1.125rem` | `1.25rem` | `1.3` | `650` |
| Body | `1rem` | `1rem` | `1.7` | `400` |
| Compact body | `0.9375rem` | `0.9375rem` | `1.6` | `400` |
| Label / metadata | `0.8125rem` | `0.875rem` | `1.45` | `500` |
| Button / nav | `0.9375rem` | `0.9375rem` | `1.25` | `600` |

### Typography Rules

- Do not scale font size with viewport width.
- Letter spacing should be `0` by default.
- Do not use negative letter spacing.
- Keep body paragraphs at `68ch` or less.
- Use sentence case for most labels and headings.
- Use visible headings that match recruiter-friendly section names:
  - About Me
  - Skills
  - Experience
  - Projects
  - Leadership
  - Certifications
  - Education
  - Contact
- Do not expose internal labels such as Hero, CTA, component block, or tech stack
  section in the visible UI.

## Spacing

Use a 4px spacing base.

| Token | Size | Use |
| --- | --- | --- |
| `space-1` | `4px` | Fine gaps |
| `space-2` | `8px` | Badge and inline gaps |
| `space-3` | `12px` | Compact control gaps |
| `space-4` | `16px` | Default element gaps |
| `space-5` | `20px` | Card internal spacing |
| `space-6` | `24px` | Standard layout gaps |
| `space-8` | `32px` | Section inner groups |
| `space-10` | `40px` | Large card or hero groups |
| `space-12` | `48px` | Mobile section padding |
| `space-16` | `64px` | Tablet section padding |
| `space-20` | `80px` | Desktop section padding |

### Layout Spacing

- Page max width: `1120px` for content-heavy sections.
- Wide max width: `1200px` only when comparing project cards.
- Mobile horizontal padding: `20px`.
- Tablet horizontal padding: `32px`.
- Desktop horizontal padding: `40px`.
- Section vertical padding:
  - Mobile: `48px`
  - Tablet: `64px`
  - Desktop: `80px`
- Keep related content close; separate major sections with clear vertical rhythm.
- Do not put cards inside other cards.
- Do not style whole page sections as floating cards.

## Border Radius

Use restrained radius values.

| Token | Size | Use |
| --- | --- | --- |
| `radius-xs` | `4px` | Badges, small inputs |
| `radius-sm` | `6px` | Buttons, compact controls |
| `radius-md` | `8px` | Cards, image frames, menus |
| `radius-full` | `999px` | Pills and circular icon controls only |

Rules:

- Cards should use `8px` radius or less.
- Profile image frames may use `8px`.
- Do not use oversized rounded cards.
- Use `radius-full` only for badges, pills, and icon controls where appropriate.

## Shadows

Use borders first. Use shadows only when hierarchy needs it.

| Token | Value | Use |
| --- | --- | --- |
| `shadow-sm` | `0 1px 2px rgb(24 24 27 / 0.06)` | Buttons, small raised surfaces |
| `shadow-md` | `0 8px 24px rgb(24 24 27 / 0.08)` | Cards on hover or profile image |
| `shadow-lg` | `0 18px 45px rgb(24 24 27 / 0.10)` | Hero profile image only if needed |

Rules:

- Default cards should rely on border plus subtle background.
- Hover shadows should be modest and brief.
- Do not stack multiple decorative shadows.
- Avoid glowing shadows.

## Buttons

Buttons should be clear, touch-friendly, and consistent.

### Button Sizes

| Size | Height | Padding | Use |
| --- | --- | --- | --- |
| `sm` | `36px` | `12px 14px` | Secondary compact actions |
| `md` | `44px` | `14px 18px` | Standard actions |
| `lg` | `48px` | `16px 22px` | Hero and primary mobile actions |

### Button Variants

Primary:

- Background: `accent`
- Text: white
- Hover: `accent-hover`
- Use for Download Resume and strongest page action.

Secondary:

- Background: `surface`
- Text: `foreground`
- Border: `border`
- Hover background: `surface-muted`
- Use for View Projects and supporting actions.

Ghost:

- Background: transparent
- Text: `muted-strong`
- Hover background: `surface-muted`
- Use for navigation and low-emphasis actions.

Link:

- Text: `accent`
- Underline only on hover or focus.
- Use for inline links.

Rules:

- Buttons need visible focus states.
- Minimum touch target should be `44px` high on mobile.
- Use Lucide icons inside icon buttons when an icon exists.
- Use text labels for key CTAs.
- Do not rely on color alone to communicate state.

## Cards

Cards should make content easy to compare without feeling decorative.

Default card:

- Background: `surface`
- Border: `1px solid border`
- Radius: `8px`
- Padding: `20px` mobile, `24px` desktop
- Shadow: none by default

Hover state:

- Border: `border-strong`
- Optional shadow: `shadow-md`
- Optional transform: `translateY(-2px)`

Project card rules:

- Include project name, year, role, type, description, technologies, and honest
  screenshot/link status.
- Company-owned projects must show confidentiality-safe notes when screenshots
  are unavailable.
- Cards should be easy to compare in a grid on desktop and easy to scan as a
  vertical list on mobile.

Certificate card rules:

- Use verified title and year only unless images or links are provided.
- Do not invent certificate IDs, descriptions, links, or organizations.

## Images

Profile image:

- Use the approved profile photo only.
- Frame it in a clean rounded rectangle or card.
- Use `radius-md`, a soft border, and a subtle shadow.
- Use a quiet accent background behind the image only if it improves hierarchy.
- Do not over-edit the image.
- Alt text: `Portrait photo of Nikki Neil Cariño`

Project and certificate images:

- Use only approved attached files.
- Do not use stock images.
- Do not use AI-generated images unless explicitly requested.
- Do not show confidential screenshots unless approved.
- Every image must have descriptive alt text.
- If an approved image is unavailable, use text-based cards and TODO comments
  instead of broken paths.

## Navigation

Desktop:

- Sticky top navigation is allowed.
- Use a subtle background blur only if readability stays strong.
- Keep navigation labels short and recruiter-friendly.
- Resume action should be visually distinct but not oversized.

Mobile:

- Use a clean menu with large touch targets.
- Avoid tiny icons.
- Menu should be keyboard accessible.
- Prevent horizontal scrolling.
- Keep the Resume action easy to find.

## Section Rules

Section order:

1. Navigation Bar
2. Hero Section
3. About Me
4. Skills
5. Experience
6. Projects
7. Leadership
8. Certifications
9. Education
10. Contact
11. Footer

Rules:

- Visible section titles should use recruiter-friendly labels.
- Section headings should be clear and consistent.
- Do not create marketing-heavy hero layouts.
- Keep the first viewport focused on Nikki Neil P. Cariño, role, summary,
  profile photo, and primary actions.
- Leave a hint of the next section visible when practical.

## Responsive Rules

Breakpoints should follow Tailwind defaults unless a specific layout need
appears later:

- `sm`: `640px`
- `md`: `768px`
- `lg`: `1024px`
- `xl`: `1280px`

Mobile:

- Build mobile-first.
- Stack content vertically.
- Use full-width buttons when helpful.
- Keep text readable without zooming.
- Use `20px` horizontal padding.
- Avoid dense multi-column layouts.
- Prevent horizontal overflow.

Tablet:

- Use two-column layouts only where readability improves.
- Keep cards large enough for touch interaction.

Desktop:

- Use grid layouts for skills and projects.
- Keep paragraphs from becoming too wide.
- Keep navigation visible and predictable.
- Use spacious layout without excessive empty decoration.

## Animation and Motion

Allowed:

- Smooth scrolling
- Subtle fade-in on scroll
- Small card hover lift
- Button hover and press states
- Mobile menu open/close transition
- Navbar blur or shadow on scroll
- Active section highlighting

Motion values:

- Standard duration: `160ms`
- Slower reveal duration: `220ms`
- Easing: `cubic-bezier(0.2, 0, 0, 1)`
- Hover lift: no more than `2px`

Avoid:

- Flashing elements
- Floating particles
- Heavy parallax
- Constant motion
- Excessive typing effects
- Random animations
- Auto-playing media
- Unnecessary popups
- Unnecessary 3D effects

Reduced motion:

- Respect `prefers-reduced-motion`.
- Disable reveal movement and hover transforms when reduced motion is enabled.
- Keep essential content available without animation.

## Accessibility Rules

- Use semantic HTML.
- Maintain one clear `h1`.
- Follow a logical heading hierarchy.
- Make all buttons and links keyboard accessible.
- Use visible focus rings.
- Use `aria-label` when an icon-only control is necessary.
- Do not hide essential content behind hover only.
- Ensure color contrast is readable.
- Every real image must have alt text.
- Decorative elements should be hidden from assistive technology.
- Mobile navigation must support keyboard and screen reader users.
- Touch targets should be at least `44px` high.

Focus ring:

```css
outline: 2px solid #2563EB;
outline-offset: 2px;
```

## Tailwind Implementation Notes

Use these tokens as the source of truth for implementation and future edits.

Recommended utility patterns:

- Page background: `bg-[#FAFAFA] text-[#18181B]`
- Card: `rounded-lg border border-[#E4E4E7] bg-white`
- Muted text: `text-[#52525B]`
- Primary action: `bg-[#0F766E] text-white hover:bg-[#115E59]`
- Focus ring: `focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]`

## Quality Checklist for Design Implementation

Current and future QA should verify:

- The palette remains restrained and professional.
- Typography is readable on mobile and desktop.
- Text does not overflow containers.
- Buttons are touch-friendly.
- Cards are not nested inside other cards.
- Images use approved assets only.
- Motion is subtle and respects reduced motion.
- The UI does not rely on fake content, fake links, or fake screenshots.
- Confidential projects stay general and professional.
