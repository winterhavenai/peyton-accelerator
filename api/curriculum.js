import { Redis } from "@upstash/redis";
import { getArcSlot, getCompetency, FORBIDDEN_OUTPUTS, SPINE_VERSION, PROMPT_VERSION } from "../src/curriculum/spine.js";
import {
  normalizeName, passionHash, buildLessonKey, confidenceTier,
  extractJson, validateLessonShape, buildGenericFallbackLesson,
} from "./_lib/curriculum.js";

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
const GEN_MODEL = "claude-sonnet-4-20250514";

function tierInstruction(tier) {
  if (tier === "domain-specific") return "Instantiate directly and specifically in the student's passion domain and sub-domain.";
  if (tier === "domain-guided") return "Open with a brief mission that CONFIRMS/NARROWS the student's domain before going deep, since the domain was inferred, not strongly confirmed.";
  return "The student has no clearly identified passion. Use a friendly choice-menu / micro-interest probe while still teaching the competency; do not theme heavily.";
}

function buildSystemPrompt({ competency, passion, tier, performanceContext }) {
  return `You generate ONE day's lesson for The Force Multiplier, a K-12 AI-literacy platform. You teach a fixed AI-literacy competency THROUGH the student's passion (same skill, different context).

COMPETENCY TO TEACH TODAY:
- Title: ${competency.title}
- What the student must be able to demonstrate: ${competency.demonstration}
- Passion hook: ${competency.passionHook}
- Required evidence: ${competency.requiredEvidence}
- Deliverable type: ${competency.deliverableType}

STUDENT PASSION: domain="${passion?.domain ?? "unknown"}", sub-domain="${passion?.subDomain ?? "unknown"}", goal="${passion?.goalLabel ?? "unknown"}".
CONFIDENCE TIER: ${tier}. ${tierInstruction(tier)}

HOW THE STUDENT'S RECENT PERFORMANCE SHOULD SHAPE TODAY (may be empty):
${performanceContext || "(none — generate from passion only)"}

HARD RULES (never violate):
${FORBIDDEN_OUTPUTS.map((r) => `- ${r}`).join("\n")}

Return ONLY this JSON, nothing else:
{
  "title": "short lesson title, references the passion",
  "mission": "2-4 sentences: what the student does today with Cipher, in their domain. Must drive toward the demonstration bar.",
  "deliverable": "one sentence: what they produce",
  "tools": ["Cipher", "...only free, age-appropriate tools..."],
  "skills": ["2-3 short passion-specific skill statements the day proves"]
}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // forceRegenerate is an ADMIN-ONLY override (auth via review secret). Client/student calls never set it.
  const { studentName, activeDay, passion, performanceContext } = req.body || {};
  const forceRegenerate = req.body?.forceRegenerate === true && req.headers["x-review-secret"] === process.env.CURRICULUM_REVIEW_SECRET;
  if (!studentName || !activeDay) return res.status(400).json({ error: "Missing studentName or activeDay" });

  const slot = getArcSlot(Number(activeDay));
  if (!slot) return res.status(400).json({ error: `No ARC slot for activeDay ${activeDay}` });
  const competency = getCompetency(slot.competency);

  const studentKey = normalizeName(studentName);
  const pHash = passionHash(passion);
  const tier = confidenceTier(passion);
  const key = buildLessonKey({ studentKey, activeDay, passionHash: pHash, spineVersion: SPINE_VERSION, promptVersion: PROMPT_VERSION });

  // CACHE READ FIRST (Codex fix #1): never regenerate over an existing lesson — that would clobber
  // an approved lesson and re-pend it, breaking the review gate. Return what's there unless an admin forces.
  if (!forceRegenerate) {
    const existing = await redis.get(key);
    if (existing) return res.status(200).json(typeof existing === "string" ? JSON.parse(existing) : existing);
  }

  // Provenance + governance fields shared by both the generated and fallback paths.
  const base = {
    lessonKey: key,
    activeDay: Number(activeDay), phase: slot.phase, badge: slot.badge,
    competencyId: slot.competency, competencyTitle: competency.title, role: slot.role,
    spineVersion: SPINE_VERSION, promptVersion: PROMPT_VERSION, generationModel: GEN_MODEL,
    evidenceRequired: competency.requiredEvidence,
  };

  async function storeAndReturn(lesson, { fidelityException, lessonRoute } = {}) {
    await redis.set(key, JSON.stringify(lesson));
    if (lesson.reviewStatus === "pending") await redis.sadd("lesson_index:pending", key);
    // fidelityException = a personalized lesson was EXPECTED but we served fallback (failure).
    if (fidelityException) await redis.set(`fidelityException:${key}`, JSON.stringify({ reason: fidelityException, at: new Date().toISOString() }));
    // lessonRoute = a designed routing decision (e.g. general-track), NOT an exception.
    if (lessonRoute) await redis.set(`lessonRoute:${key}`, JSON.stringify({ route: lessonRoute, at: new Date().toISOString() }));
    return res.status(200).json(lesson);
  }

  // General-track (<0.55) is the DESIGNED route per PPAI-002, not a failure (Codex fix #4).
  if (tier === "general") {
    const fb = { ...buildGenericFallbackLesson({ activeDay: Number(activeDay), competencyId: slot.competency, competency, slot, studentName }), ...base, reviewStatus: "systemFallbackApproved", reviewedBy: "system" };
    return storeAndReturn(fb, { lessonRoute: "general-track" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: GEN_MODEL, max_tokens: 700,
        system: buildSystemPrompt({ competency, passion, tier, performanceContext: performanceContext || "" }),
        messages: [{ role: "user", content: `Generate Day ${activeDay} for ${studentName}.` }],
      }),
    });
    const data = await r.json();
    if (data.error) throw new Error(JSON.stringify(data.error));
    const parsed = extractJson(data.content?.[0]?.text || "");
    if (!parsed || !validateLessonShape(parsed)) throw new Error("invalid generated lesson shape");

    const lesson = {
      ...base,
      title: parsed.title, mission: parsed.mission, deliverable: parsed.deliverable,
      tools: parsed.tools, skills: parsed.skills,
      ...(slot.requiresHuman ? { outsideProject: parsed.outsideProject || null } : {}),
      reviewStatus: "pending", reviewedBy: null, reviewedAt: null, fidelityScore: null, laneNotes: null,
    };
    return storeAndReturn(lesson);
  } catch (err) {
    console.error("curriculum generation failed:", err);
    // Failure path: a personalized lesson WAS expected -> this IS a fidelityException.
    const fb = { ...buildGenericFallbackLesson({ activeDay: Number(activeDay), competencyId: slot.competency, competency, slot, studentName }), ...base, reviewStatus: "systemFallbackApproved", reviewedBy: "system" };
    return storeAndReturn(fb, { fidelityException: `generation failure: ${String(err).slice(0, 140)}` });
  }
}
