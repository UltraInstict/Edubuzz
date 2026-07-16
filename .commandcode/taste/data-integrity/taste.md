# data-integrity
- Every imported job must contain at minimum: title, company, location (province), apply_url/email. Reject imports missing any of these core fields. Confidence: 0.90
- AI extraction may ONLY extract information that exists in the source content; never fabricate responsibilities, requirements, benefits, salary, or any other field. If data is not present in the source, leave it empty. Fabricated content damages trust and SEO. Confidence: 0.95
- The contentEnricher.ts pipeline (which generates generic "Communication, teamwork, problem-solving" skills templates) must be removed — it fabricates content rather than extracting real information from job listings. AI normalization via Firecrawl should be used instead. Confidence: 0.90
- Job quality gate: reject jobs with confidence < 60%, no title, no employer, no apply method, no location, or no useful description. Confidence: 0.85
