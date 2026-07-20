# Edubuzz Source Library

Inventory of **official** South African vacancy sources and the connector roadmap to reach
thousands of official employer jobs with the **fewest connector implementations**.

- `edubuzz-source-library.csv` — the spreadsheet (source of truth, one row per source)
- `edubuzz-source-library.json` — connector configuration (generic connectors + coverage map + sources), importable into Edubuzz
- `README.md` — this roadmap (ATS grouping + implementation order)

**v1.1 — 151 sources** across banks, insurers/financial, retail, FMCG, telecom, media/tech,
professional services, SOEs, science councils, public entities, energy & mining, national/provincial
government, municipalities, universities (all 26 public) + TVET/DHET, healthcare/hospitals, logistics,
and recruitment agencies (documented but excluded by policy).

## Guiding policy
- Official employer / government / institutional sources **only**. No third-party job boards.
- Every job's **Apply URL must be the employer's own application page** (enforced in code: `job_board_apply` rejection).
- AI extracts only what exists; empty fields stay empty. Never fabricate a field.

## Confidence legend
`verified` (web-confirmed this session) · `high` (established public evidence / standard host pattern) · `likely` (strong signal, ATS unconfirmed) · `medium` (sector-norm estimate) · `low` (needs verification).

> **Important:** `ats_platform`, `js_required`, `pagination`, `anti_bot`, and vacancy counts are **roadmap estimates** unless the row is `verified`. Each is confirmed by inspecting the employer's live listings page at connector-build time.

### Web-verified this session (8)
| Source | Finding |
|---|---|
| **Absa** | Workday tenant host `absa.wd3.myworkdayjobs.com` (CXS JSON) |
| **Standard Bank** | Explicitly partners with **SmartRecruiters** for applications |
| **Nedbank** | **SuccessFactors** career site `jobs.nedbank.co.za` (SF URL pattern) |
| **SA Post Office** | SuccessFactors tenant `postofficeP2` on `career012.successfactors.eu` |
| **Takealot** | **Greenhouse** board token `takealotcom` (keyless JSON API) |
| **OUTsurance** | SmartRecruiters company `OUTsurance` (keyless API) |
| **Deloitte SA** | SmartRecruiters company `Deloitte6` (keyless API) |
| **DPSA** | National weekly vacancy circular (PDF) — canonical govt jobs |

---

## The key insight: a handful of generic connectors unlock most of corporate SA

Most large SA employers run one of a small set of ATS platforms that expose **public, keyless, JSON APIs** — no scraping, no JavaScript, and the apply URL is already the employer's official page. Build the connector **once per ATS**, then onboard each employer with a one-line config (a board token / company slug / Workday tenant).

### Connector coverage across the 151 sources

| Connector | Sources | Keyless? | JS? | Leverage | Nature |
|---|---:|---|---|---|---|
| **firecrawl_ai** | 91 | ❌ (keys) | via Playwright | 1 connector, per-site config | The long tail: universities, municipalities, custom gov/SOE, custom corporate portals |
| **successfactors** | 38 | ⚠️ varies | ⚠️ often | 1 connector, per-tenant config | Banks, insurers, retail, telecom, mining, healthcare, SOEs |
| **workday** | 10 | ✅ | ❌ (API) | 1 connector, per-tenant config | Large multinationals (Absa, Massmart, Investec, Gold Fields, DP World, SAB, Naspers, PwC…) |
| **smartrecruiters** | 3 | ✅ | ❌ | 1 connector, per-company config | **Standard Bank, OUTsurance, Deloitte** |
| **greenhouse** | 3 | ✅ | ❌ | 1 connector, per-token config | **Takealot**, TymeBank*, Allan Gray* |
| **firecrawl_ai_pdf** | 1 | ❌ (keys) | ❌ | dedicated | **DPSA circular** (1,000–3,000 govt posts) |
| **policy_review** | 5 | — | — | excluded | Recruitment agencies (documented, not imported) |
| **structured_html** (built) | — | ✅ | ❌ | reuse anywhere | Any detail page embedding JobPosting JSON-LD, regardless of ATS |

\* Greenhouse board token unconfirmed — verify on build.

**Read this way:** just **4 keyless API connectors** (greenhouse + lever + smartrecruiters + workday) plus the already-built `structured_html` adapter cover the highest-volume, highest-confidence corporate employers with **zero keys and zero browser**. `successfactors` (one connector, many tenants) then unlocks the largest single corporate cluster. `firecrawl_ai` is a **single** generic connector (per-site config) that mops up the entire custom/gov/university long tail — the 91 count is many *employers*, not many *connectors*.

---

## Sources grouped by ATS platform (build once → onboard many)

- **Workday** (10): Absa ✓host, Investec, Massmart, Gold Fields, DP World, SAB/AB InBev, Naspers, Unilever SA, Ninety One, PwC SA
- **SmartRecruiters** (3): Standard Bank ✓, OUTsurance ✓, Deloitte ✓
- **Greenhouse** (3): Takealot ✓, TymeBank*, Allan Gray*
- **SuccessFactors** (38): Nedbank ✓, SA Post Office ✓, Discovery, Old Mutual, Momentum, Sanlam, Santam, Liberty, Alexforbes, Woolworths, Pick n Pay, TFG, Tiger Brands, Aspen, Heineken/Distell, Nestlé SA, Vodacom, MTN, Telkom, MultiChoice, KPMG, EY, Eskom, Transnet, DBSA, IDC, SARS, SARB, Sasol, Anglo American, Sibanye, Implats, Amplats, Exxaro, Mediclinic, DSV, Barloworld, UNISA
- **Oracle iRecruitment/PeopleSoft** (higher-ed pattern): UCT, Wits (irec.wits.ac.za) — currently routed via firecrawl_ai until the Oracle adapter is built
- **firecrawl_ai** (91): the custom/gov/university/municipal long tail
- **firecrawl_ai_pdf** (1): DPSA weekly circular

---

## Implementation order (maximise employers ÷ minimise connectors)

**Phase A — keyless ATS APIs (fastest, highest ROI, zero new dependencies)**
1. **SmartRecruiters connector** → immediately onboard **Standard Bank + OUTsurance + Deloitte** (all web-verified). Standard Bank alone is 400–800 official roles. Proves the end-to-end official pipeline with real jobs today.
2. **Greenhouse connector** → **Takealot** (verified token `takealotcom`) + verify TymeBank/Allan Gray. Public API, trivial.
3. **Workday connector** → the single highest-leverage build: one connector + per-tenant config unlocks Absa (✓host), Massmart, Investec, Gold Fields, DP World, SAB, Naspers, Unilever, PwC, Ninety One — and dozens more SA corporates on Workday.
4. **Lever connector** → cheap add; onboard any Lever employers found among tech/startups.

*Outcome of Phase A: low-thousands of official corporate vacancies with 4 connectors, no API keys, no browser.*

**Phase B — reuse the structured_html connector (already built)**
5. For any employer whose job **detail pages embed JobPosting JSON-LD**, onboard via the existing `structured_html` adapter — **no new connector code**. Try this before Playwright/Firecrawl for every SuccessFactors/custom site.

**Phase C — SuccessFactors (broadest corporate coverage — 38 employers)**
6. **SuccessFactors connector** — heterogeneous but covers the largest cluster (banks, insurers, retail, telecom, mining, healthcare, SOEs). Start with verified/known tenants: **Nedbank** (`jobs.nedbank.co.za`), **SA Post Office** (`postofficeP2`). Prefer tenants exposing OData or JSON-LD; fall back to render.

**Phase D — official public sector (highest "official jobs" brand value)**
7. **Firecrawl + AI + PDF connector** → **DPSA weekly circular** (1,000–3,000 government posts across national + provincial departments, SAPS, SANDF, SASSA, TVET/DHET) — the single biggest official-jobs inventory in SA. Requires `FIRECRAWL_API_KEY` + `ANTHROPIC_API_KEY`.
8. Provincial/metro portals (Western Cape, Gauteng GPG job centre, City of Cape Town, eThekwini, etc.) via Firecrawl (+ Playwright where JS).

**Phase E — universities & remaining custom sites (the long tail)**
9. **Oracle iRecruitment/PeopleSoft** pattern (UCT, Wits first) → then per-institution config for the remaining public universities and UoTs via `firecrawl_ai`.
10. Remaining custom corporate/SOE portals (Shoprite `shoprite.jobs`, Capitec `careers.capitecbank.co.za`, Pepkor, Clicks, Netcare, Life Healthcare, Transnet) via `firecrawl_ai`, preferring `structured_html` wherever JSON-LD exists.

---

## Dependencies / blockers to unlock phases
- **Phase A–C: none for the API connectors.** Greenhouse/Lever/SmartRecruiters/Workday are keyless and browserless. `structured_html` is already built.
- **SuccessFactors:** per-tenant config; some tenants need Playwright to render.
- **Phase D–E:** `FIRECRAWL_API_KEY` + `ANTHROPIC_API_KEY`, and **Playwright** install (~300 MB browser dep) for dynamic/gov portals and PDF extraction.

## Recommended first build (when coding resumes)
**SmartRecruiters connector** → onboard **Standard Bank + OUTsurance + Deloitte** (all verified), then the **Greenhouse connector** for **Takealot**, then the **Workday connector** for the biggest corporate leverage. These three moves put real official jobs into Edubuzz with **zero keys and zero scraping**.

## Recruitment agencies — documented but excluded
Adcorp, Kelly, Quest, Network Recruitment (ADvTECH), Michael Page SA are listed with `connector_type: policy_review` and `priority: Excluded`. They re-advertise employer roles and typically mask the true employer and apply URL, which conflicts with Edubuzz's official-employer-only policy and the `job_board_apply` rejection. Do **not** import unless a source exposes the employer's own official apply URL.

## Maintenance / accuracy
Treat this library as living config. When each connector is built, its target employer's `ats_platform`, `listings_url`, `apply_url_pattern`, `js_required`, `pagination`, and vacancy count are **verified against the live site** and the row's `confidence` is promoted to `verified`.
