# The Force Multiplier — Rules

## Collaboration
- This is a SHARED repo with Lane Bowers (Winterhaven AI)
- DO NOT modify SBA documents, NSF grant documents, or Google Drive files
- Zane's scope is TECHNICAL ONLY — platform code, deployment, testing
- Lane handles business, grants, curriculum content, school district relations
- Always create ZANE_HANDOFF_[date].md after completing tasks

## Code Safety
- Deploy with `vercel --prod` after each completed task
- Test locally before deploying (`npm run dev`)
- Never commit API keys, tokens, or credentials
- The Anthropic API key is in Vercel environment variables — don't expose it

## Content Moderation
- Cipher (AI tutor) must have content safety checks
- Student-facing responses must be appropriate for K-12
- Follow the safety spec in PPAI-001_Cipher_Safety_System_Prompt_v1.0.docx

## Documentation
- Update Progress and Updates after every task completion
- Log all changes in Audit Ledger
- Create handoff docs for Lane's review
- Local documentation is permanent — append only, never revise away history

## Deployment
- Platform: Vercel
- Domain: theforcemultiplier.ai
- Always deploy with `vercel --prod`
- Test on the live URL after deployment
