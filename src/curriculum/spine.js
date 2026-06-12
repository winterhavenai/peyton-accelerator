// The SPINE — a human-authored encoding of PPAI-002_Required_AI_Skill_Set_v1.
// Domain-independent. Identical for every student. Generation selects FROM this; never invents.
// Slice B ships Day 1 (competency 1.1). Slice C fills the remaining ~65 active-day ARC slots.

export const SPINE_VERSION = "1.0";
export const PROMPT_VERSION = "1.0";

export const DELIVERABLE_TYPES = ["artifact", "document", "conversation", "comparison", "plan", "reflection", "human-assignment"];
export const ROLES = ["introduce", "practice", "apply", "reflect"];

// Hard rules injected into every generation prompt.
export const FORBIDDEN_OUTPUTS = [
  "No paid-only tools — only free or free-tier tools.",
  "No tasks requiring an adult account, ID, or age-gated signup.",
  "No unsafe physical activities.",
  "No collection of the student's or others' private personal data.",
  "No medical, legal, or financial advice as lesson content.",
  "Never claim a generic or auto-generated task PROVES mastery.",
  "Domain dignity: never trivialize, mock, or moralize about the student's passion.",
  "For a fringe or unsafe passion, route to the nearest safe adjacent skill (e.g. anime -> storytelling/media analysis/source evaluation; fishing -> ecology/conditions/conservation).",
];

export const COMPETENCIES = {
  "1.1": {
    tier: 1,
    title: "Recognize AI in everyday tools",
    demonstration: "Student identifies 2-3 AI-powered features in tools they already use and articulates why they qualify as AI.",
    passionHook: "Find AI in tools used inside the passion domain.",
    deliverableType: "reflection",
    frameworkRefs: ["Long & Magerko #1 (Recognizing AI)", "AI4K12 Big Idea #4"],
    requiredEvidence: "Student identifies 2-3 AI-powered or AI-adjacent tools/features in or near their passion domain and explains why at least one qualifies as AI.",
    assessmentRubric: "Names >=2 AI features AND gives a valid reason >=1 qualifies as AI (learns from patterns/data rather than only hand-coded rules).",
    safetyOrPrivacyNotes: "No real personal data in examples.",
    ageBand: "12-18",
    reviewChecklist: ["targets the demonstration bar", "passion-appropriate", "no forbidden outputs", "age-appropriate free tools"],
  },
};

// ARC — keyed by ACTIVE LESSON INDEX (1..~65), not calendar day. Slice B ships Day 1 only.
export const ARC = {
  1: { competency: "1.1", role: "introduce", tier: 1, phase: "Foundations", calendarWindow: "1-2", badge: null, requiresHuman: false },
};

export function getArcSlot(activeDay) {
  return ARC[activeDay] || null;
}

export function getCompetency(id) {
  return COMPETENCIES[id] || null;
}

// Structural self-check used by tests and (optionally) a build guard.
export function validateSpine() {
  const errors = [];
  for (const [day, slot] of Object.entries(ARC)) {
    const comp = COMPETENCIES[slot.competency];
    if (!comp) { errors.push(`ARC day ${day}: unknown competency ${slot.competency}`); continue; }
    if (!ROLES.includes(slot.role)) errors.push(`ARC day ${day}: invalid role ${slot.role}`);
    if (!DELIVERABLE_TYPES.includes(comp.deliverableType)) errors.push(`competency ${slot.competency}: invalid deliverableType ${comp.deliverableType}`);
  }
  return { ok: errors.length === 0, errors };
}
