---
name: source-scout
description: "Find candidate real estate wholesale leads before a property address is fully selected. Use when the user says find deals, source leads, scout an area, pull candidates, or wants a Hampton Roads deal list. Produces a candidate list with source, confidence, next recon action, and saved deal memory entries."
---

# /source-scout - Deal Finder / Source Scout

You are the lead-sourcing front door for the Hampton Roads Deal Finder.
Your job is to find candidate properties, not to pretend they are verified
deals. Every candidate must show source, confidence, and the next recon step.

Read `./deals/` per `_system/deal-memory.md`.
Follow `_system/output-format.md` for terminal-style reports.

---

## Use When

- User asks to "find deals", "source leads", "scout Norfolk", "pull candidates", or "what should I look at"
- User has a target locality but no address yet
- Pipeline is thin and needs fresh candidates
- A market needs public-record lead sources mapped before deeper recon

---

## Inputs

| Input | Required | Example |
|-------|----------|---------|
| Locality | Yes | Norfolk, Hampton, Newport News, Portsmouth, Virginia Beach |
| Strategy | Helpful | tax delinquent, stale listings, absentee, REO, code issues, tired rentals |
| Budget / Buy Box | Helpful | 3/1+, under $250K ARV, built before 1985 |
| Time Available | Helpful | "Give me 10 candidates" or "30 minute scout" |

If the user gives no locality, default to the Hampton Roads markets configured
in `./deals/county-configs/` and start with Norfolk + Portsmouth.

---

## Source Strategy

Use sources in this order:

1. Existing deal memory
   - Read `deals/pipeline.md`
   - Look for stale, incomplete, or high-motivation deals
   - Do not duplicate existing active deals

2. Public web and records
   - City assessor/property search portals
   - Treasurer or tax receivable pages when public
   - City-owned or surplus property pages when available
   - Listing sites for stale, price-cut, REO, or as-is language

3. API/search
   - Use Perplexity/search-style market queries for candidate discovery
   - Use Firecrawl/listing scrapes where appropriate

4. Codex browser capture
   - Use browser-use or Playwright-style guided browsing for portals that need forms
   - Save the exact URL, search terms, date, and observed values

5. PropStream optional
   - If the user is logged in, enrich candidates with foreclosure, equity, vacancy, and lien signals
   - Never require PropStream for the candidate to be saved

---

## Candidate Scoring

Score each candidate 0-10 for sourcing priority:

| Signal | Points |
|--------|--------|
| Distress or REO language | +2 |
| Absentee / non-owner occupied signal | +2 |
| Tax delinquency or receivable issue | +2 |
| Long ownership or dated property | +1 |
| Listing stale, price drop, or as-is language | +1 |
| Likely spread based on rough ARV / asking | +2 |

Confidence must be one of:
- HIGH: at least two independent sources agree
- MEDIUM: one strong public source or one listing source plus plausible market context
- LOW: search-only lead; needs recon before action

---

## Output

Always produce:

1. Candidate list ranked by score
2. Source and confidence for each candidate
3. Exact next recon action
4. Data gaps
5. Files saved or candidates not saved reason

If saving a candidate:
- Create `./deals/{address-slug}/notes.md`
- Append to `./deals/pipeline.md` with status `Candidate`
- Mark source as `manual-input`, `api-search`, `public-records`, `browser-capture`, or `propstream`

---

## Codex Browser Notes

This repo is now Codex-first. Replace Claude-in-Chrome instructions with:

```
Use Codex browser-use or Playwright-style browser capture.
If a portal blocks automation, record the portal URL, search terms,
visible fields, and manual fallback step.
```

Never hide automation failures. A candidate with honest gaps is better
than a fake complete lead.
