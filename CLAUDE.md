# The Force Multiplier — AI-Powered K-12 Literacy Platform

> **BEFORE ANY WORK:** Read the governance files in this order:
> 1. `Core Files/Rules.md`
> 2. `Core Files/Context.md`
> 3. `Core Files/Planning/Tasks.md`
> 4. `Core Files/User Memories/User Memory current.md`
> 5. `/Users/zanebowers/Desktop/Zane's Agents/Core Files/Rules.md` (ecosystem rules)
> 6. `/Users/zanebowers/Desktop/Zane's Agents/Core Files/Preferences.md` (Zane's preferences)

## What This Is
The Force Multiplier (theforcemultiplier.ai) is a K-12 AI literacy platform built for an NSF SBIR grant. It features "Cipher" — an AI tutor powered by Claude that adapts curriculum to each student's passion domain. The platform is a collaboration between Zane Bowers and his dad Lane Bowers through Winterhaven AI.

## Project Location
- Local: `/Users/zanebowers/Desktop/Zane's Agents/TheForceMultiplier/`
- GitHub: `winterhavenai/peyton-accelerator` (collaboration repo — Zane is collaborator)
- Live: `theforcemultiplier.ai`

## Tech Stack
- React + Vite (frontend)
- Vercel serverless functions (backend/API)
- Anthropic API (claude-sonnet-4-20250514) for Cipher AI tutor
- Upstash Redis (session storage)
- Resend (email)

## Architecture
```
src/                           # React frontend
├── App.jsx                    # Main app — progress bar on lines 776-777
├── components/                # UI components
└── ...

api/                           # Vercel serverless functions
├── chat.js                    # Cipher AI endpoint (Anthropic API)
└── ...

scripts/                       # Build/deploy scripts
```

## Collaboration Rules
- This is a SHARED repo with Lane Bowers (dad) via Winterhaven AI
- DO NOT touch: SBA documents, NSF grant documents, Google Drive files outside codebase
- Zane's lane is PURELY TECHNICAL — platform code only
- Always create HANDOFF docs after completing tasks
- Deploy with `vercel --prod` after each completed task

## Related Project
- TheLegacy (pappa-legacy.vercel.app) — Pappa's interview/legacy app, same tech stack

## Owner
Zane Bowers — technical co-lead. Lane Bowers — project lead, grant writer, business.
