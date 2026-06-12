import { test, expect } from "vitest";
import {
  normalizeName, normalizeConfidence, confidenceTier, passionHash,
  buildLessonKey, extractJson, validateLessonShape, buildGenericFallbackLesson,
} from "../api/_lib/curriculum.js";
import { SPINE_VERSION, PROMPT_VERSION, getCompetency } from "../src/curriculum/spine.js";

test("normalizeName lowercases and trims", () => {
  expect(normalizeName("  Brady ")).toBe("brady");
});

test("normalizeConfidence handles both 0-1 and 0-100 inputs and clamps to [0,1]", () => {
  expect(normalizeConfidence(0.91)).toBeCloseTo(0.91);
  expect(normalizeConfidence(91)).toBeCloseTo(0.91);
  expect(normalizeConfidence(undefined)).toBe(0);
  expect(normalizeConfidence(150)).toBe(1);   // 150 is a bad percentage -> clamp, not 1.5
  expect(normalizeConfidence(-5)).toBe(0);
});

test("confidenceTier routes by normalized confidence", () => {
  expect(confidenceTier({ confidence: 0.9 })).toBe("domain-specific");
  expect(confidenceTier({ confidence: 0.6 })).toBe("domain-guided");
  expect(confidenceTier({ confidence: 0.3 })).toBe("general");
  expect(confidenceTier({ confidence: 80 })).toBe("domain-specific");
});

test("passionHash is stable and order-independent of unrelated fields", () => {
  const a = passionHash({ domain: "Music", subDomain: "Hip-Hop Production", goalLabel: "x" });
  const b = passionHash({ domain: "Music", subDomain: "Hip-Hop Production", goalLabel: "y" });
  expect(a).toBe(b);
  expect(passionHash({ domain: "Sports", subDomain: "Hip-Hop Production" })).not.toBe(a);
});

test("buildLessonKey composes the versioned key", () => {
  const key = buildLessonKey({ studentKey: "brady", activeDay: 1, passionHash: "abc123", spineVersion: "1.0", promptVersion: "1.0" });
  expect(key).toBe("lesson:brady:1:abc123:1.0:1.0");
});

test("extractJson pulls a JSON object out of noisy model text", () => {
  expect(extractJson('sure! {"title":"Hi","mission":"m"} done')).toEqual({ title: "Hi", mission: "m" });
  expect(extractJson("no json here")).toBeNull();
});

test("validateLessonShape requires the lesson-content fields", () => {
  const ok = { title: "t", mission: "m", deliverable: "d", tools: ["Cipher"], skills: ["s1"] };
  expect(validateLessonShape(ok)).toBe(true);
  expect(validateLessonShape({ title: "t" })).toBe(false);
  expect(validateLessonShape({ ...ok, skills: "nope" })).toBe(false);
});

test("buildGenericFallbackLesson is slot-aware and returns a valid, non-cyber lesson", () => {
  const comp = getCompetency("1.1");
  const slot = { competency: "1.1", role: "introduce", tier: 1, phase: "Foundations", calendarWindow: "1-2", badge: null, requiresHuman: false };
  const lesson = buildGenericFallbackLesson({ activeDay: 1, competencyId: "1.1", competency: comp, slot, studentName: "Brady" });
  expect(validateLessonShape(lesson)).toBe(true);
  expect(lesson.reviewStatus).toBe("systemFallbackApproved");
  expect(lesson.competencyId).toBe("1.1");
  expect(lesson.phase).toBe("Foundations");   // from slot, not hardcoded
  expect(lesson.role).toBe("introduce");
  expect(lesson.spineVersion).toBe(SPINE_VERSION);
  expect(lesson.promptVersion).toBe(PROMPT_VERSION);
  expect(JSON.stringify(lesson).toLowerCase()).not.toContain("cyber");
});
