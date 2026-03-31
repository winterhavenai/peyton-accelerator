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

## Tech Stack
- React + Vite frontend
- Vercel serverless functions
- Anthropic API (claude-sonnet-4-20250514)
- Upstash Redis
- Resend email

## Current State (March 30, 2026)
- Platform is live at theforcemultiplier.ai
- Codebase cloned from winterhavenai/peyton-accelerator
- Zane has collaborator access on GitHub
- 5 tasks assigned by Lane (see Planning/Tasks.md)
- Rebranding from "Peyton Accelerator" to "The Force Multiplier" in progress

## Known Issues
- Progress bar (App.jsx lines 776-777) has hardcoded "UCF" reference
- 17+ UCF references in curriculum prompts need dynamic goalLabel
- No content moderation pre-check on Cipher responses yet
- Passion Discovery Engine not built yet (the big sprint)
