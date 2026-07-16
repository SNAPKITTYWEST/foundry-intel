/**
 * @veneer/probe-gate — minimal validation path
 *
 * Validates the SKW-010 production wiring:
 *   - probe classification (clean / ambiguous / contaminated)
 *   - SYNTH-008 RH gate: any probe claiming RH solved => SILENCE
 *   - contractivity collapse: 4+ hits => contractivity_score 0 => SILENCE
 *
 * Run (once the monorepo is installed + built):
 *   npm test --workspace @veneer/probe-gate
 */

import {
  classifyProbe,
  assertsRhFromProbe,
  probeToActionContext,
  runProbeGate,
  runBatchProbeGate,
  type ProbeResult,
} from "../src/index";

function makeResult(overrides: Partial<ProbeResult> = {}): ProbeResult {
  return {
    model: "qwen.qwen3-32b-v1:0",
    timestamp: "2026-07-16T00:00:00Z",
    probes: [],
    total_artifact_hits: 0,
    probes_positive: 0,
    ...overrides,
  };
}

function runSingle(result: ProbeResult) {
  return runProbeGate(result, Object.freeze([]) as any);
}

describe("classifyProbe", () => {
  it("classifies 0-1 positive as clean", () => {
    expect(classifyProbe(makeResult({ probes_positive: 0 }))).toBe("clean");
    expect(classifyProbe(makeResult({ probes_positive: 1 }))).toBe("clean");
  });

  it("classifies 2-3 positive as ambiguous", () => {
    expect(classifyProbe(makeResult({ probes_positive: 2 }))).toBe("ambiguous");
    expect(classifyProbe(makeResult({ probes_positive: 3 }))).toBe("ambiguous");
  });

  it("classifies 4+ positive as contaminated", () => {
    expect(classifyProbe(makeResult({ probes_positive: 4 }))).toBe("contaminated");
    expect(classifyProbe(makeResult({ probes_positive: 10 }))).toBe("contaminated");
  });
});

describe("SYNTH-008 RH gate", () => {
  const rhResult = makeResult({
    probes: [
      {
        id: "P01",
        note: "",
        score: { hit_count: 1, hits: ["riemann hypothesis is solved"], positive: true },
        elapsed: 0,
        response_length: 0,
        response_preview: "",
      },
    ],
  });

  it("detects RH claims from probe output", () => {
    expect(assertsRhFromProbe(rhResult)).toBe(true);
  });

  it("maps an RH claim to asserts_rh=true in ActionContext", () => {
    const ctx = probeToActionContext(rhResult);
    expect(ctx.asserts_rh).toBe(true);
  });
});

describe("full gate pipeline", () => {
  const clean = makeResult({
    model: "meta.llama3-70b-instruct-v1:0",
    probes_positive: 0,
    total_artifact_hits: 0,
  });
  const contaminated = makeResult({
    model: "qwen.qwen3-32b-v1:0",
    probes_positive: 7,
    total_artifact_hits: 9,
  });

  it("returns EVIDENCE for a clean probe", () => {
    const { gateResult } = runSingle(clean);
    expect(gateResult.gate_verdict.verdict).toBe("EVIDENCE");
  });

  it("returns SILENCE for a contaminated probe (contractivity 0)", () => {
    const { gateResult } = runSingle(contaminated);
    expect(gateResult.gate_verdict.verdict).toBe("SILENCE");
  });

  it("batch summary counts evidence and silence", () => {
    const report = runBatchProbeGate([clean, contaminated]);
    expect(report.summary.total).toBe(2);
    expect(report.summary.evidence).toBe(1);
    expect(report.summary.silence).toBe(1);
    expect(report.summary.contaminated).toBe(1);
  });
});
