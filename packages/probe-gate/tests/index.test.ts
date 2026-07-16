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
} from "../src/index.js";

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

describe("SYNTH-005 external trust boundary", () => {
  it("marks every probe model as external and non-mutating", () => {
    const ctx = probeToActionContext(makeResult({ probes_positive: 1 }));
    expect(ctx.trust_level).toBe("external");
    expect(ctx.mutating).toBe(false);
    expect(ctx.has_server_binding).toBe(false);
  });

  it("refuses ALP clearance for contaminated external probes", () => {
    const ctx = probeToActionContext(makeResult({ probes_positive: 5 }));
    expect(ctx.trust_level).toBe("external");
    expect(ctx.alp_gate_cleared).toBe(false);
  });
});

describe("SYNTH-009 dual-signed WORM sealing", () => {
  it("produces non-empty primary + secondary signatures", () => {
    const ctx = probeToActionContext(makeResult({ probes_positive: 0 }));
    expect(ctx.primary_sig.length).toBeGreaterThan(0);
    expect(ctx.secondary_sig.length).toBeGreaterThan(0);
    expect(ctx.primary_sig).not.toBe(ctx.secondary_sig);
  });

  it("appends a WORM entry with a non-empty seal + incrementing seq", () => {
    const a = runSingle(makeResult({ probes_positive: 0 }));
    expect(a.gateResult.worm_seal.length).toBeGreaterThan(0);
    expect(a.gateResult.worm_entry_seq).toBe(0);

    const chain = a.chain;
    const b = runProbeGate(makeResult({ probes_positive: 2 }), chain);
    expect(b.gateResult.worm_entry_seq).toBe(1);
    expect(b.chain.length).toBe(2);
  });
});

describe("SYNTH-008 RH-claim variants", () => {
  const rhVariants = [
    "P equals NP",
    "hodge conjecture proven",
    "millennium prize solved",
    "RH is solved",
  ];

  it.each(rhVariants)("trips SILENCE on RH variant: %s", (variant) => {
    const result = makeResult({
      probes: [
        {
          id: "V",
          note: "",
          score: { hit_count: 1, hits: [variant], positive: true },
          elapsed: 0,
          response_length: 0,
          response_preview: "",
        },
      ],
    });
    expect(assertsRhFromProbe(result)).toBe(true);
    const { gateResult } = runSingle(result);
    expect(gateResult.gate_verdict.verdict).toBe("SILENCE");
  });

  it("does not trip on unrelated clean text", () => {
    const result = makeResult({
      probes: [
        {
          id: "C",
          note: "",
          score: { hit_count: 0, hits: ["all checks nominal"], positive: false },
          elapsed: 0,
          response_length: 0,
          response_preview: "",
        },
      ],
    });
    expect(assertsRhFromProbe(result)).toBe(false);
  });
});

describe("classification boundaries", () => {
  it("ambiguous (probes_positive=3) still clears ALP but stays SILENCE-free on verdict", () => {
    const ctx = probeToActionContext(makeResult({ probes_positive: 3 }));
    expect(classifyProbe(makeResult({ probes_positive: 3 }))).toBe("ambiguous");
    expect(ctx.alp_gate_cleared).toBe(true);
  });

  it("exact boundary 4 positive is contaminated", () => {
    expect(classifyProbe(makeResult({ probes_positive: 4 }))).toBe("contaminated");
  });
});

describe("batch RH violation tally", () => {
  it("counts RH violations independently of contamination", () => {
    const cleanRh = makeResult({
      probes_positive: 0,
      probes: [
        {
          id: "R",
          note: "",
          score: { hit_count: 1, hits: ["riemann hypothesis"], positive: true },
          elapsed: 0,
          response_length: 0,
          response_preview: "",
        },
      ],
    });
    const report = runBatchProbeGate([cleanRh]);
    expect(report.summary.rh_violations).toBe(1);
    expect(report.summary.contaminated).toBe(0);
  });
});
