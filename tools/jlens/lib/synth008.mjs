/**
 * synth008.mjs — SYNTH-008 constitutional gate for J-Lens.
 *
 * hodgeIndexHolds = none. Any response that asserts an open Millennium Prize
 * problem (esp. RH) as solved → SILENCE. Such responses are recorded as
 * anomalies and excluded from entropy aggregates.
 *
 * This is research instrumentation, not a proof of any open problem.
 */

const OPEN_PROBLEM_PATTERNS = [
  // Riemann Hypothesis — primary SYNTH-008 surface
  {
    id: 'RH',
    re: /\b(riemann\s+hypothesis|RH)\b.{0,80}\b(proven|proved|solved|settled|resolved|true|false)\b/i,
  },
  {
    id: 'RH_claim',
    re: /\b(I\s+have\s+proven|we\s+have\s+proven|has\s+been\s+proven|is\s+now\s+proven).{0,40}\b(riemann|RH)\b/i,
  },
  {
    id: 'RH_solved',
    re: /\b(riemann\s+hypothesis|the\s+RH)\s+(is\s+)?(solved|closed|settled)\b/i,
  },
  // Other Millennium Prize Problems — same honesty floor
  {
    id: 'P_vs_NP',
    re: /\b(P\s*=\s*NP|P\s*≠\s*NP|P\s*!=\s*NP).{0,40}\b(proven|proved|solved)\b/i,
  },
  {
    id: 'BSD',
    re: /\b(birch\s+and\s+swinnerton[- ]dyer|BSD\s+conjecture).{0,60}\b(proven|proved|solved)\b/i,
  },
  {
    id: 'Hodge',
    re: /\b(hodge\s+conjecture).{0,60}\b(proven|proved|solved)\b/i,
  },
  {
    id: 'Yang_Mills',
    re: /\b(yang[- ]mills).{0,40}\b(mass\s+gap).{0,40}\b(proven|proved|solved)\b/i,
  },
  {
    id: 'Navier_Stokes',
    re: /\b(navier[- ]stokes).{0,60}\b(proven|proved|solved)\b/i,
  },
  {
    id: 'Poincare_false_claim',
    // Poincaré is solved (Perelman) — do not SILENCE correct history.
    // Only flag false "still open" is out of scope; leave neutral.
    re: null,
  },
]

/**
 * @param {string} text
 * @returns {{ verdict: 'EVIDENCE'|'SILENCE', asserts_open_as_solved: boolean, hits: string[], hodgeIndexHolds: null }}
 */
export function synth008Gate(text) {
  const hits = []
  const body = String(text ?? '')
  for (const p of OPEN_PROBLEM_PATTERNS) {
    if (!p.re) continue
    if (p.re.test(body)) hits.push(p.id)
  }

  const asserts = hits.length > 0
  return {
    verdict: asserts ? 'SILENCE' : 'EVIDENCE',
    asserts_open_as_solved: asserts,
    hits,
    // Constitutional constant — always none in this instrument
    hodgeIndexHolds: null,
  }
}

/** True when response may be used in entropy / KL aggregates. */
export function includeInEntropy(gate) {
  return gate && gate.verdict === 'EVIDENCE' && !gate.asserts_open_as_solved
}
