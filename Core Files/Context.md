# The Force Multiplier — Context

## What It Is
K-12 AI literacy platform featuring "Cipher" — an adaptive AI tutor (Claude-powered) that personalizes curriculum based on each student's passion domain. Built for NSF SBIR Phase I grant submission.

## Key Concepts
- **Cipher** — The AI tutor that students interact with
- **p_passion** — Detection object that identifies a student's passion domain
- **goalLabel** — Dynamic field in p_passion that replaces hardcoded "UCF" references
- **Passion Discovery Engine** — 10-question adaptive conversation flow that detects passion domain
- **Force Multiplier** — The rebranded name (was "Peyton Accelerator")

## Business Context
- **NSF SBIR grant** — Phase I submission in progress
- **Polk County School District** — pilot partner, letter of intent signed
- **Winterhaven AI** — Lane Bowers' company, partnership with Zane
- **UF Co-PI** — Gardner-McCune from UF is being recruited as co-PI
- **Live URL**: theforcemultiplier.ai

## Grant Documents
- Located in `/Users/zanebowers/Downloads/03_Grant/`
- 40 files including NSF pitches, curriculum mappings, safety specs, competitive analysis
- Key file: `PPAI-001_Cipher_Safety_System_Prompt_v1.0.docx` (content moderation spec)
- Zane should NOT modify grant docs — read-only reference

## Current State (April 1, 2026)
- Platform is live at theforcemultiplier.ai
- Codebase cloned from winterhavenai/peyton-accelerator
- Zane has collaborator access on GitHub
- All 5 tasks from Lane COMPLETE and deployed
- PR #4 (monitoring alerts) MERGED — health-check endpoint live, needs HEALTH_CHECK_SECRET env var
- Content moderation hotfixed April 1 — was failing closed (blocking all messages for Wyatt), now fails open
- Passion Discovery API error handling added — fallback questions prevent empty box
- **Cipher Memory System** — persistent student memory in Redis, injected into every session

## Cipher Memory System (api/memory.js)
- Stores per-student memory in Upstash Redis at key `memory:{name}`
- Fields: skills, preferences, goals, strengths, weaknesses, personalInfo, conversationHighlights, daysSummary
- Loaded on session start via GET, injected as `[STUDENT MEMORY]` block in system prompt
- After day completion, Claude extracts memory updates from conversation and POSTs merged updates
- Skills from localStorage also injected as COMPLETED SKILLS
- Memory merges on write (arrays deduplicated, objects merged, highlights capped at 20)

## Moderation Architecture (chat.js)
- Haiku pre-check on every student message before Cipher responds
- JSON parse uses regex extraction (handles Haiku wrapping text around JSON)
- **Fail-open policy**: if Haiku returns non-JSON or API errors, message passes through to Cipher
- Only explicitly flagged `{ safe: false }` messages are blocked
- Separate `/api/moderate.js` endpoint also available for standalone checks

## Monitoring (MERGED — now on main)
- `api/health-check.js` — Vercel cron checks cipherContext.json integrity
- Sends Resend email alert to thefootersedge@gmail.com if degraded
- `.github/workflows/sync-cipher-context.yml` — validation step (exits 1 if <20 topics)
- Needs HEALTH_CHECK_SECRET env var in Vercel to authenticate cron requests

## Passion Discovery Engine (api/discover.js)
- 10-question adaptive conversation via Claude Sonnet
- Step 0-8: generates contextual questions; step 9+: emits p_passion JSON
- Error handling: API errors fall back to hardcoded discovery questions, never returns empty text
- Possible issue: check Vercel function logs for /api/discover — empty boxes suggest API key or rate limit problems

## Beta Families
- **Karen & Wyatt** — active beta family. Wyatt on Day 10+. Karen requested parent visibility into progress.
- Parent/educator progress view is Task 6 (HIGH priority) — required for Polk County pilot

## What's Waiting on Lane
- Add HEALTH_CHECK_SECRET env var to Vercel
- Add KV env vars to pappa-legacy Vercel project (for TheLegacy Redis backup)
- Refresh NotebookLM auth if needed
- Review grant pitch v4.5 rewrites
