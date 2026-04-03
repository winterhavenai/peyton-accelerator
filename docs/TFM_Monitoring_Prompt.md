# The Force Multiplier — cipherContext Monitoring Alerts
## For use with Claude Code (terminal)
## Repo: winterhaven-ai/peyton-accelerator
## Run from: ~/theforcemultiplier/
## Do NOT commit directly to main — open a single PR for both changes

---

You are adding two monitoring alerts to The Force Multiplier to detect
when `src/cipherContext.json` goes empty due to expired NotebookLM auth.
The goal: the system finds Lane, Lane doesn't have to find the system.

Work through both tasks in order, then open a single PR.

---

## ALERT 1 — GitHub Actions Email Notification

**The issue:**
The weekly sync workflow (`.github/workflows/sync-cipher-context.yml`)
runs every Sunday at 7 AM UTC. When the NotebookLM auth secret expires,
all 26 topics return EMPTY but the workflow still exits with code 0 —
no failure, no alert, no email.

**What to do:**
1. Read `.github/workflows/sync-cipher-context.yml`
2. Find where topics are queried and results written to `cipherContext.json`
3. Add a post-sync validation step that:
   a. Reads `src/cipherContext.json` after the sync completes
   b. Counts how many topics have content longer than 50 chars
   c. If fewer than 20 topics have real content:
      - Sets the workflow exit code to failure
      - Sends an email alert to lane@winterhaven.ai using the GitHub
        Actions email notification system (configure via workflow
        `on: failure` notification, or use a `actions/send-mail` step
        if available, or use the built-in GitHub email notification
        by forcing a workflow failure with `exit 1`)
4. The failure email subject should make the problem obvious:
   "⚠️ TFM: cipherContext sync failed — NotebookLM auth likely expired"
5. The email body should include:
   - How many topics populated vs expected (e.g. "4/26 topics")
   - Exact fix instructions:
     "Run: python3 -m notebooklm login
      Then update NOTEBOOKLM_AUTH_JSON secret in GitHub repo settings.
      Then re-run the sync workflow manually."
   - Link to the workflow run

**Note:** GitHub automatically emails the repo owner when a workflow
fails. So forcing `exit 1` on empty results is sufficient — no external
mail service needed. Confirm this approach works before adding complexity.

---

## ALERT 2 — Vercel Health Check Function

**The issue:**
Even if the GitHub sync fails silently, the app continues serving
students with an empty knowledge base. We need a runtime health check
that detects this condition and alerts via email using Resend (already
in the stack).

**What to do:**
1. Read the existing Vercel serverless functions in `api/` to understand
   the pattern (auth headers, error handling, response format)
2. Read the existing Resend integration to find:
   - Which file handles email sending
   - What environment variable holds the Resend API key
   - What from/to addresses are used
3. Create a new file `api/health-check.js` that:
   a. Reads `src/cipherContext.json`
   b. Counts topics with content > 50 chars
   c. If fewer than 20 topics have real content:
      - Sends an email to lane@winterhaven.ai via Resend with subject:
        "⚠️ TFM Health Check: cipherContext.json is empty or degraded"
      - Body includes: topic count, timestamp, and fix instructions
      - Returns HTTP 503 with JSON: { status: "degraded", topics: N }
   d. If 20+ topics have real content:
      - Returns HTTP 200 with JSON: { status: "healthy", topics: N }
   e. Add a bearer token check so this endpoint cannot be called
      publicly — only by an authorized caller. Use a new environment
      variable: HEALTH_CHECK_SECRET. Document this in the PR.

4. Add a Vercel cron job to call this endpoint weekly:
   - Create or update `vercel.json` to add a cron:
     { "path": "/api/health-check", "schedule": "0 8 * * 0" }
     (8 AM UTC Sunday — 1 hour after the sync workflow runs)
   - The cron will automatically call the endpoint with the right auth

5. Add `HEALTH_CHECK_SECRET` to the list of required environment
   variables in the PR description so Lane knows to add it in Vercel.

---

## After both alerts are implemented:

Open a single PR titled:
`feat: add cipherContext monitoring — GitHub Actions failure alert + Vercel health check`

PR description must include:
- What problem this solves (auth expiry goes undetected)
- How Alert 1 works (GitHub workflow failure → auto email)
- How Alert 2 works (Vercel cron → health check → Resend email)
- Environment variables that need to be added to Vercel:
  HEALTH_CHECK_SECRET (generate a random string, suggest one in the PR)
- Test plan:
  [ ] Manually trigger sync workflow with bad auth — confirm failure email
  [ ] Call /api/health-check with empty cipherContext.json — confirm 503 + email
  [ ] Call /api/health-check with populated file — confirm 200 healthy
  [ ] Confirm Vercel cron is scheduled correctly

Tag @lanebowers in a PR comment with:
- One-line summary of what was built
- The HEALTH_CHECK_SECRET value to add to Vercel env vars
- Any follow-up issues that need a human decision

Do not merge without Lane's approval.
