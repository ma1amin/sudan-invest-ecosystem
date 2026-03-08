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

## Phase 10: Complete Platform — Missing Features

### Founder Progress Tracker
- [x] FounderProgressTracker page with AI-driven step-by-step improvement roadmap
- [x] Dimension-by-dimension score breakdown with progress bars
- [x] Prioritized action items based on lowest-scoring dimensions
- [x] Resources and milestone suggestions per dimension
- [x] Progress history tracking (score over time)
- [x] Add /progress route to App.tsx and Dashboard sidebar

### KYC / Identity Verification
- [x] KYC verification flow page (document upload, identity confirmation)
- [x] Trust level badges (Unverified, Pending, Verified) displayed on profiles
- [x] Admin KYC review queue in AdminPanel
- [x] Verification status shown on venture cards and profiles
- [x] Add /kyc route to App.tsx

### Venture Comparison Tool
- [x] VentureCompare page — side-by-side comparison of 2–3 ventures
- [x] Compare AI scores, sectors, stages, funding targets, team size
- [x] Add /ventures/compare route to App.tsx

### Diaspora Deal Room
- [x] DiasporaDealRoom page — curated investment opportunities for diaspora
- [x] Filter by ticket size, sector, engagement type
- [x] One-click expression of interest flow
- [x] Add /diaspora/deals route to App.tsx

### Behavioral Intelligence & Quality Control
- [x] behavioralSignals table in schema for tracking engagement patterns
- [x] Profile completeness score displayed in dashboard
- [x] Quality gate enforcement: ventures below score 40 go to incubation, not published
- [x] Founder engagement score (logins, updates, responses)

### UI/UX Completeness
- [x] Notifications panel/dropdown (NotificationsPanel component with polling)
- [x] Mobile-responsive navigation (PlatformHeader with hamburger menu)
- [x] Empty state components for all list pages
- [x] Loading skeleton components for all data-fetching pages
- [x] 404 and error boundary improvements
- [x] RTL layout verification across all pages

### Analytics Dashboard Page
- [x] Analytics section in Dashboard with Recharts visualizations
- [x] Platform stats (ventures, users, matches, investment flow) in admin view

## Phase 10 Summary
- 75 vitest tests passing (2 test files)
- 0 TypeScript errors
- 13 pages built
- 4 reusable components
- Full bilingual AR/EN RTL/LTR support
- All routes registered in App.tsx

## Phase 11: Route Audit & Sudan Branding Fix
- [ ] Audit all routes in App.tsx vs sidebar links in Dashboard.tsx
- [ ] Audit all internal hrefs in PlatformHeader, Home, Ventures, VentureDetail, Diaspora, DiasporaDealRoom
- [ ] Fix any broken or mismatched routes
- [ ] Replace all "African" / "Africa's" language with "Sudanese" / "Sudan's" in Home.tsx
- [ ] Replace all "African" / "Africa's" language in Dashboard.tsx
- [ ] Replace all "African" / "Africa's" language in PlatformHeader.tsx
- [ ] Replace all "African" / "Africa's" language in Ventures.tsx, VentureDetail.tsx
- [ ] Replace all "African" / "Africa's" language in Diaspora.tsx, DiasporaDealRoom.tsx
- [ ] Replace all "African" / "Africa's" language in VentureSubmit.tsx, FounderProgress.tsx
- [ ] Replace all "African" / "Africa's" language in server/routers.ts AI prompt
- [ ] Verify Arabic translations also reflect Sudan-specific context
- [ ] Run vitest (75 tests) and TypeScript check (0 errors)
