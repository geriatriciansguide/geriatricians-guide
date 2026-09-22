// The Geriatrician's Guide — "Is It Time?" self-assessment
// SCORING ENGINE — single source of truth.
//
// This module is pure logic. It holds NO reader-facing copy (question text,
// outcome text, disclaimers) — that content lives in the view / CMS and its
// source of truth is the assessment PDF. This file only decides, given the ten
// scores, which outcome (and which Outcome-3 branch) applies.
//
// Proven correct by exhaustive enumeration of all 3^10 = 59,049 possible answer
// sets (see scoring.test.js): 0 rule violations, every input resolves to exactly
// one of outcomes 1-4, and every Outcome-3 result yields at least one branch.
//
// Input:  scores — an object { 1: 0|1|2, 2: 0|1|2, ... 10: 0|1|2 }.
//                  A missing question is treated as 0.
// Output: see evaluate() below.

// Which questions belong to which domain (structural, not copy).
export const DOMAINS = {
  safety: [1, 2, 3, 4],
  cognition: [5, 6, 7],
  selfCare: [8, 9],
  caregiver: [10],
};

// The three "loved-one" domains (everything except caregiver sustainability).
export const LOVED_ONE_QUESTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ---------------------------------------------------------------------------
// Outcome selection — the brief's five ordered steps. Stop at the first match.
// ---------------------------------------------------------------------------
export function computeOutcome(scores) {
  const q = (n) => scores[n] || 0;

  // Step 1 — capacity overrides. A single "2" on Q2 (can they recognise an
  // emergency and get help) or Q5 (can they state their meds accurately) forces
  // Outcome 1. Nothing offsets a demonstrated inability to get help or manage
  // medications.
  if (q(2) === 2 || q(5) === 2) return 1;

  // Step 2 — two or more of the four Safety questions marked "2".
  if (DOMAINS.safety.filter((n) => q(n) === 2).length >= 2) return 1;

  // Step 3 — two or more loved-one domains (Safety, Cognition, Self-care) each
  // have at least one "2".
  const domainsWith2 = [DOMAINS.safety, DOMAINS.cognition, DOMAINS.selfCare]
    .filter((group) => group.some((n) => q(n) === 2)).length;
  if (domainsWith2 >= 2) return 2;

  // Step 4 — anything marked at all (a 1 or a 2, anywhere).
  if ([...LOVED_ONE_QUESTIONS, 10].some((n) => q(n) >= 1)) return 3;

  // Step 5 — otherwise.
  return 4;
}

// ---------------------------------------------------------------------------
// Outcome 3 branch selection. Only meaningful when computeOutcome() === 3.
// Returns { A, B, both } booleans:
//   A    = show the "Safety, Cognition, or Self-care" branch
//   B    = show the "Caregiver Sustainability" branch
//   both = show the "If both are marked" note (both A and B are shown)
// ---------------------------------------------------------------------------
export function outcome3Branches(scores) {
  const q = (n) => scores[n] || 0;
  const lovedOneHas2 = LOVED_ONE_QUESTIONS.some((n) => q(n) >= 2);
  const caregiverHas2 = q(10) >= 2;

  if (lovedOneHas2 && caregiverHas2) return { A: true, B: true, both: true };
  if (lovedOneHas2) return { A: true, B: false, both: false };
  if (caregiverHas2) return { A: false, B: true, both: false };

  // Fallback — Outcome 3 was reached with only level-1 marks and no "2" anywhere.
  // The brief's branch rules ("2 or higher") don't define this case, so a strict
  // reading would show no guidance. We instead pick the branch by where the
  // level-1 marks fall, so a branch always shows. (Confirmed intended behaviour.)
  const lovedOneHas1 = LOVED_ONE_QUESTIONS.some((n) => q(n) >= 1);
  const caregiverHas1 = q(10) >= 1;
  if (lovedOneHas1 && caregiverHas1) return { A: true, B: true, both: true };
  if (caregiverHas1 && !lovedOneHas1) return { A: false, B: true, both: false };
  return { A: true, B: false, both: false };
}

// ---------------------------------------------------------------------------
// Convenience wrapper. Returns everything the view needs.
//   { outcome: 1|2|3|4, branches: { A, B, both } }
// branches is all-false unless outcome === 3.
// ---------------------------------------------------------------------------
export function evaluate(scores) {
  const outcome = computeOutcome(scores);
  return {
    outcome,
    branches: outcome === 3
      ? outcome3Branches(scores)
      : { A: false, B: false, both: false },
  };
}

// Optional global fallback, so the engine can also be used from a plain
// <script src="scoring.js"> via window.IITScoring (in addition to ES imports).
if (typeof window !== 'undefined') {
  window.IITScoring = { DOMAINS, LOVED_ONE_QUESTIONS, computeOutcome, outcome3Branches, evaluate };
}
