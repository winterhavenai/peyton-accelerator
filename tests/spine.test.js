import { test, expect } from "vitest";
import {
  COMPETENCIES, ARC, DELIVERABLE_TYPES, ROLES, SPINE_VERSION, PROMPT_VERSION,
  getArcSlot, getCompetency, validateSpine,
} from "../src/curriculum/spine.js";

test("spine versions are non-empty strings", () => {
  expect(typeof SPINE_VERSION).toBe("string");
  expect(SPINE_VERSION.length).toBeGreaterThan(0);
  expect(typeof PROMPT_VERSION).toBe("string");
});

test("every ARC slot references an existing competency with valid role/deliverable", () => {
  for (const [day, slot] of Object.entries(ARC)) {
    expect(getCompetency(slot.competency), `day ${day} competency`).toBeTruthy();
    expect(ROLES, `day ${day} role`).toContain(slot.role);
    const comp = getCompetency(slot.competency);
    expect(DELIVERABLE_TYPES, `comp ${slot.competency} deliverableType`).toContain(comp.deliverableType);
  }
});

test("Day 1 maps to competency 1.1 introduce, no human requirement", () => {
  const slot = getArcSlot(1);
  expect(slot).toMatchObject({ competency: "1.1", role: "introduce", requiresHuman: false, badge: null });
});

test("every competency carries the full v2 metadata schema", () => {
  const required = ["tier","title","demonstration","passionHook","deliverableType",
    "frameworkRefs","requiredEvidence","assessmentRubric","safetyOrPrivacyNotes","ageBand","reviewChecklist"];
  for (const [id, comp] of Object.entries(COMPETENCIES)) {
    for (const f of required) expect(comp[f], `comp ${id}.${f}`).toBeDefined();
  }
});

test("validateSpine returns ok for the shipped spine", () => {
  expect(validateSpine()).toEqual({ ok: true, errors: [] });
});

test("getArcSlot returns null for an unmapped day", () => {
  expect(getArcSlot(999)).toBeNull();
});
