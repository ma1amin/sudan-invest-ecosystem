# Sudan Innovation & Investment Ecosystem — TODO

## Phase 1: Foundation
- [x] Database schema (users extended, ventures, investments, matching, messages, notifications, documents, waitlist, sectors)
- [x] Design system: OKLCH color palette, typography, global CSS, RTL/LTR support
- [x] i18n context for Arabic/English switching

## Phase 2: Pre-Launch Landing Page
- [x] Hero section with vision statement and bilingual toggle
- [x] Value proposition section (Founders, Investors, Diaspora)
- [x] Waitlist registration form (name, email, role)
- [x] Countdown / launch indicator
- [x] Platform narrative and impact metrics
- [x] Footer with social links

## Phase 3: Authentication & Roles
- [x] Extended user schema with platform role (founder, investor, mentor, diaspora, admin)
- [x] Role selection on first login
- [x] Profile completion flow per role
- [x] RBAC middleware (protectedProcedure per role)
- [x] Admin user management

## Phase 4: Project Submission & AI Scoring
- [x] Venture submission form (multi-step)
- [x] AI readiness scoring engine (LLM-powered)
- [x] Risk indicators and market clarity assessment
- [x] Moderation workflow (AI pre-screen → human review → publish/reject)
- [x] Sector classification and tagging
- [x] Idea-stage incubation pathway

## Phase 5: Dashboards & Matching
- [x] Founder dashboard (venture status, AI score, matches, activity)
- [x] Investor dashboard (opportunities, portfolio, match suggestions)
- [x] Mentor dashboard (mentee requests, sessions, impact)
- [x] Diaspora dashboard (investment channels, programs, donations)
- [x] Admin dashboard (ecosystem metrics, moderation queue)
- [x] Matching engine (sector, stage, geography, behavioral signals)
- [x] Investment opportunity discovery page

## Phase 6: Messaging & Notifications
- [x] Connection request system
- [x] Secure messaging between roles
- [x] Automated notification service (investor alerts, project updates)
- [x] Diaspora engagement features (invest, mentor, sponsor, donate)

## Phase 7: Analytics & Documents
- [x] Platform analytics (growth, investment flow, match rate, sector trends)
- [x] Secure document storage (pitch decks, business plans, financials, legal)
- [x] Role-based document access control
- [x] Admin panel (user management, moderation, sector management)

## Phase 8: QA & Delivery
- [x] Vitest unit tests (40 tests, 2 test files — all passing)
- [x] RTL/LTR layout verification
- [x] Security hardening review
- [x] TypeScript strict mode — zero errors
- [x] Checkpoint and publish

## Phase 9: AI Scoring Enhancement & Missing Features
- [x] Customize AI scoring prompt with platform investment thesis (Sudan/Africa focus, sector priorities, diaspora lens, impact weighting)
- [x] Add impactScore dimension to AI scoring (social/economic impact for Sudan/Africa)
- [x] Add diasporaRelevance dimension (alignment with diaspora investment interests)
- [x] Add sectorAlignmentScore dimension (fit with 7 priority sectors)
- [x] Add regulatoryRisk dimension specific to Sudan/African markets
- [x] Enhance user context in AI prompt (sector, subsector, funding target, team size, country)
- [x] Sector seed data — auto-seeded on first sectors.list call
- [x] Investment thesis alignment scoring in matching engine (5-factor: sector, stage, geography, AI impact, quality)
- [x] Update vitest tests to cover new AI scoring dimensions (58 tests passing, 2 test files)
