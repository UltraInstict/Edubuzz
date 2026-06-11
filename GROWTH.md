# Edubuzz.co.za — Growth Engineering & Marketplace Strategy

## Current Funnel Audit

### Candidate Funnel
```
Landing page → Job search → Job view → Apply start → Apply complete
    100%          ~60%         ~40%         ~15%           ~8%
```

**Drop-off points identified:**
1. Landing page → Search: No autocomplete, no recent searches, no personalized recommendations
2. Job search → Job view: Missing salary filters upfront, no "posted today" filter
3. Job view → Apply: No one-click apply, CV upload friction, trust concerns
4. Apply start → Complete: Fill fatigue on long forms, CV format issues

### Employer Funnel
```
Landing page → Signup start → Signup complete → Post job → Publish
    100%          ~12%            ~8%              ~5%         ~3%
```

**Drop-off points:**
1. Landing → Signup: No trust indicators, no social proof, pricing buried
2. Signup start → Complete: Password complexity friction, no progress indicator
3. Post job → Publish: Description writer's block, no AI help surfaced prominently
4. No post-signup nurture sequence

---

## Growth Systems Implemented

### Event Tracking Architecture
- `POST /api/growth-track` — single endpoint for all funnel events
- 21 funnel event types: landing_page_viewed through referral_signup
- `growth_events` collection in PocketBase
- Automatic bot filtering
- Device/source/referrer attribution
- Server-side tracking via `growthService.trackFunnelEvent()`

### Saved Jobs System
- `POST /api/save-job` — toggle save/unsave
- `saved_jobs` collection in PocketBase
- Heart button on job detail page with ❤️/✓ Saved states
- Tracked as `job_saved` funnel event

### Funnel Event Triggers (Job Detail Page)
- `job_viewed` — fires on page load
- `application_started` — fires on "Apply Now" click
- `application_completed` — fires on successful form submission
- `job_shared` — fires on WhatsApp, LinkedIn, X, or copy-link click
- `job_saved` — fires on save button toggle
- `job_clicked` — fires on job card clicks (existing analytics)

### Growth Analytics Dashboard
- `/admin/growth` — real-time funnel metrics
- Today/week views, applications
- Application funnel visualization with completion rate
- Employer signups, jobs posted, saves, shares
- Setup guide for PocketBase collections

### Social Sharing Enhancement
- WhatsApp share button (highest CTR in SA market)
- LinkedIn share for professional network
- X/Twitter share
- Copy link button
- All shares tracked as `job_shared` events
- Shareable employer pages with referral codes

---

## Retention Systems (Designed)

### To Implement:
1. **Saved searches**: Store search params, notify on new matches
2. **Abandoned application reminders**: Track `application_started` without `application_completed`, email after 24h
3. **Re-engagement emails**: "New jobs matching your last search" batch
4. **WhatsApp notifications**: "3 new jobs in Gauteng" digest
5. **Push notifications**: Browser push for saved job price drops / expiry

### PocketBase Collections Needed:
```
saved_searches: user_id, params (JSON), province, category, created
abandoned_applications: user_id, job_id, email, started_at, reminded_at
notification_preferences: user_id, email_enabled, whatsapp_enabled, push_enabled
```

---

## Marketplace Optimization Strategy

### Job Quality Scoring (Implemented)
- 0-70 scoring system across 5 dimensions
- Title detail (0-10), Description detail (0-20), Salary disclosed (0-15), Application method (0-15), Company name (0-10)
- Low-scoring jobs flagged for admin review
- Scores visible in admin panel for prioritization

### Employer Quality Scoring (Designed)
- Verification status (binary)
- Job post completion rate
- Response rate to applications
- Average job quality score
- Account age
- Payment history

### Application Quality (Designed)
- Name completeness
- Cover letter length/quality
- CV presence
- Phone number presence
- Past application response rate

---

## A/B Testing Framework (Designed)

### Feature Flag System
```typescript
// src/lib/features.ts
export const FEATURES = {
  NEW_ONBOARDING: 'new_onboarding_2026',
  ONE_CLICK_APPLY: 'one_click_apply',
  AI_DESCRIPTION_SUGGEST: 'ai_description_suggest',
  REFERRAL_PROGRAM: 'referral_program',
};
```

### Experiment Spec
```typescript
interface Experiment {
  id: string;
  control: number;    // % in control group
  variant: number;     // % in variant group
  metric: string;      // primary metric to track
  hypothesis: string;
}
```

### Tracking
- Assign visitors to experiment groups via cookie
- Log experiment assignment as `experiment_assigned` event
- Log conversion as `experiment_conversion` with experiment ID
- Dashboard at `/admin/experiments`

---

## CRM & Revenue Operations (Designed)

### Employer Lifecycle States
```
Visitor → Lead → Trial → Active → Power → At-Risk → Churned
```

### Lead Scoring Triggers
- Visited pricing page: +5
- Started signup: +15
- Completed signup: +30
- Posted first job: +50
- First application received: +20
- 7 days inactive: -10
- Job expired, not renewed: -20

### Re-engagement Sequences
- Day 3 post-signup: "Complete your company profile"
- Day 7 no jobs: "Post your first job in 5 minutes"
- Day 14 job expiring: "Renew your listing"
- Application received: "You have new applicants!"

---

## CAC / LTV Model

### Customer Acquisition Cost (Est.)
- Organic search: R0 (free)
- Social media: ~R2 per click, ~R50 per signup
- Job aggregator feeds: R0
- Referrals: R0 + reward cost

### Lifetime Value (Est. per employer)
- Free tier: R0 but drives marketplace liquidity
- Starter (R299/mo): R3,588/year at 12-month retention
- Professional (R799/mo): R9,588/year
- Enterprise (R1,999/mo): R23,988/year

### Target LTV:CAC Ratio: 5:1

---

## Revenue Growth Roadmap

### Phase 1 (Current Month)
- [x] Growth event tracking infrastructure
- [x] Save job system
- [x] Social sharing enhancement
- [x] Growth analytics dashboard
- [ ] Free employer signup → Post-job flow optimization
- [ ] First job posted email sequence

### Phase 2 (Month 2)
- [ ] Employer subscription tiers (Starter R299 / Pro R799)
- [ ] Featured job upsell during posting flow
- [ ] Saved searches + email alerts
- [ ] Abandoned application recovery
- [ ] A/B test onboarding flow

### Phase 3 (Month 3-6)
- [ ] Referral program (invite employer, get 1 month free)
- [ ] WhatsApp notification channel
- [ ] Push notifications
- [ ] Enterprise onboarding concierge
- [ ] Job board aggregation partnerships (Indeed, Jooble rev share)

---

## Growth Metrics Dashboard (Live at /admin/growth)

### Daily KPIs
- Job views (today, 7-day trend)
- Applications completed (today, 7-day)
- Employer signups (7-day)
- Jobs posted (7-day)
- Saves + shares (7-day engagement)

### Funnel Health
- View → Apply start rate
- Apply start → Complete rate
- Signup → Publish rate
- Overall conversion rate

### Required PocketBase Collections
```
growth_events: event, job_id, employer_id, ref, device, source, metadata (JSON), created
saved_jobs: user_id, job_id, created
referrals: employer_id, code, signups, created
```
