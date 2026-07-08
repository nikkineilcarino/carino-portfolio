# Component Specification

This document tracks the reusable component plan for the portfolio.

Phase 7 completed the reusable component foundation. Page sections must still be
built later in Phase 8.

## Component Build Order

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

## Component Files

| Component | File |
| --- | --- |
| Button | `components/ui/button.tsx` |
| SectionContainer | `components/layout/section-container.tsx` |
| SectionHeader | `components/shared/section-header.tsx` |
| SkillBadge | `components/shared/skill-badge.tsx` |
| SkillCard | `components/shared/skill-card.tsx` |
| TimelineItem | `components/shared/timeline-item.tsx` |
| ExperienceTimeline | `components/shared/experience-timeline.tsx` |
| ProjectCard | `components/shared/project-card.tsx` |
| LeadershipCard | `components/shared/leadership-card.tsx` |
| CertificateCard | `components/shared/certificate-card.tsx` |
| EducationCard | `components/shared/education-card.tsx` |
| ContactButton | `components/shared/contact-button.tsx` |
| ScrollIndicator | `components/shared/scroll-indicator.tsx` |
| Navbar | `components/layout/navbar.tsx` |
| Footer | `components/layout/footer.tsx` |

## Component Rules

- Use TypeScript.
- Keep components small and focused.
- Use semantic HTML.
- Add accessibility attributes when needed.
- Keep styling minimalist and professional.
- Store repeated visible content in constants, not inside page components.
- Do not add fake content.
- Do not use Lorem Ipsum.
- Do not compose the homepage until Phase 8.
