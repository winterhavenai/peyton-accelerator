# The Force Multiplier — Task List

> Assigned by Lane Bowers. Priority order. Start with 1 and 2 (quick wins).

## Task 1 — goalLabel Field (QUICK WIN)
**Status:** NOT STARTED
**Priority:** 1 (start here)
**Estimated time:** 30 min

Add `goalLabel` to the `p_passion` detection object output from the Passion Discovery Engine.
- Progress bar reads from `passion.goalLabel` — fallback to "Your Goal" if not set
- App.jsx lines 776-777 have a `userName === "Peyton"` conditional showing "% to UCF"
- Replace with `passion.goalLabel` with fallback
- Discovery engine doesn't exist yet — for now just add the field to the schema and update lines 776-777
- This unblocks the UCF curriculum references (Task 2)

## Task 2 — UCF Curriculum References (QUICK WIN)
**Status:** NOT STARTED (blocked by Task 1)
**Priority:** 2
**Estimated time:** 1 hour

Once goalLabel is implemented, find and replace the 17+ UCF hardcoded references in the curriculum/prompts to use goalLabel dynamically.

## Task 3 — Upstash Redis Backup for Pappa Legacy
**Status:** NOT STARTED
**Priority:** 3
**Estimated time:** 2-3 hours
**NOTE:** This is for the TheLegacy project (pappa-legacy.vercel.app), not TheForceMultiplier

LocalStorage autosave is already implemented (commit c1e21df). What's needed:
1. Vercel serverless function at `/api/save-answer` that writes to Redis
2. `/api/get-answers` function that retrieves saved answers by session ID
3. Call `/api/save-answer` from the existing autosave debounce after localStorage update
4. Upstash Redis is already configured — just needs the implementation

Important: Pappa is elderly and could accidentally clear browser or switch devices.

## Task 4 — Content Moderation Pre-Check
**Status:** NOT STARTED
**Priority:** 4
**Estimated time:** 2-3 hours

Before each Cipher response in the `send()` function:
1. Add a lightweight secondary API call that checks if student message is attempting misuse
2. If flagged, replace Cipher's response with a safe redirect message
3. Log the incident
4. Spec is in `PPAI-001_Cipher_Safety_System_Prompt_v1.0.docx` in Google Drive → 03_Grant

## Task 5 — Passion Discovery Engine (THE SPRINT)
**Status:** NOT STARTED
**Priority:** 5 (do last — this is the big one)
**Estimated time:** Full sprint

Design and build the 10-question adaptive conversation flow that:
- Detects a student's passion domain
- Emits the `p_passion` detection object
- This is the core of the entire platform
