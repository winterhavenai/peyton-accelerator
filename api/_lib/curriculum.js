import { SPINE_VERSION, PROMPT_VERSION } from "../../src/curriculum/spine.js";

export function normalizeName(name) {
  return String(name ?? "").trim().toLowerCase();
}

// p_passion.confidence is emitted as 0-100 by discover.js but the spec tiers are 0-1.
// Normalize: anything > 1 is treated as a percentage.
export function normalizeConfidence(c) {
  const n = Number(c);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const scaled = n > 1 ? n / 100 : n;   // discover.js emits 0-100; spec tiers are 0-1
  return Math.min(1, Math.max(0, scaled)); // clamp so a bad 150 doesn't become 1.5
}

export function confidenceTier(passion) {
  const c = normalizeConfidence(passion?.confidence);
  if (c >= 0.75) return "domain-specific";
  if (c >= 0.55) return "domain-guided";
  return "general";
}

// Deterministic, dependency-free FNV-1a hash -> short hex. Stable across runs.
export function passionHash(passion) {
  const basis = `${(passion?.domain ?? "").toLowerCase()}|${(passion?.subDomain ?? "").toLowerCase()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < basis.length; i++) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// TODO(before pilot scale): studentKey is the normalized first name in Slice B — collision-prone.
// Replace with a real student id / auth subject once accounts exist.
export function buildLessonKey({ studentKey, activeDay, passionHash, spineVersion, promptVersion }) {
  return `lesson:${studentKey}:${activeDay}:${passionHash}:${spineVersion}:${promptVersion}`;
}

// Same defensive pattern as discover.js: pull the first JSON object out of model text.
export function extractJson(text) {
  if (typeof text !== "string") return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export function validateLessonShape(obj) {
  if (!obj || typeof obj !== "object") return false;
  for (const f of ["title", "mission", "deliverable"]) {
    if (typeof obj[f] !== "string" || obj[f].length === 0) return false;
  }
  if (!Array.isArray(obj.tools)) return false;
  if (!Array.isArray(obj.skills) || obj.skills.length === 0) return false;
  return true;
}

// Generic, non-cyber lesson for a competency. Used when generation fails (-> fidelityException)
// OR when the student is general-track (-> routing event, NOT an exception). Slot-aware so it
// carries the right phase/role/badge for any day, not just Day 1. Marked systemFallbackApproved
// so it can ship without Lane review.
export function buildGenericFallbackLesson({ activeDay, competencyId, competency, slot, studentName }) {
  return {
    activeDay,
    phase: slot?.phase ?? "Foundations",
    badge: slot?.badge ?? null,
    competencyId,
    competencyTitle: competency.title,
    role: slot?.role ?? "introduce",
    title: `Day ${activeDay}: Spotting AI Around You`,
    mission: `Talk with Cipher about the apps, sites, and tools you already use. Together, find 2-3 features that are powered by AI. For at least one, work out WHY it counts as AI.`,
    deliverable: `A short note listing 2-3 AI features you found and why one of them is AI.`,
    tools: ["Cipher"],
    skills: [`Identified AI in everyday tools`, `Explained why a feature counts as AI`],
    reviewStatus: "systemFallbackApproved",
    reviewedBy: "system",
    reviewedAt: null,
    fidelityScore: null,
    laneNotes: null,
    spineVersion: SPINE_VERSION,
    promptVersion: PROMPT_VERSION,
    generationModel: null,
    evidenceRequired: competency.requiredEvidence,
  };
}
