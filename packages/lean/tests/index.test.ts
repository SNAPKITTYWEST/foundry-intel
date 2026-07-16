// tests/pearl-invariants.test.ts — @veneer/lean L2 test stub
import { PearlInvariants, THRESHOLDS, assertAlpGate, verifyInvariants } from "../src/index.js";
import type { WormSeal } from "../src/index.js";

const seal: WormSeal = { digest: "0".repeat(64), timestamp: 0, prev: null };

describe("@veneer/lean PearlInvariants", () => {
  test("SYNTH-008: crux is always encoded as open — hodgeIndexHolds and liPositivityHolds = none", () => {
    // This is the core honesty invariant: RH is never promoted to proved
    const status = PearlInvariants.synth008_cruxIsOpen(seal);
    expect(status.kind).toBe("open");
  });

  test("SYNTH-001: AlpGate vetoes mutating actions and admits non-mutating ones", () => {
    const vetoed = assertAlpGate({ id: "mutate-op", mutating: true }, seal);
    expect(vetoed.admitted).toBe(false);
    const admitted = assertAlpGate({ id: "read-op", mutating: false }, seal);
    expect(admitted.admitted).toBe(true);
    expect(admitted.seal).toBe(seal);
  });

  test("THRESHOLDS: constants anchored to ExportThresholds.lean with correct values", () => {
    expect(THRESHOLDS.tau_r).toBeCloseTo(47.06998778, 5);
    expect(THRESHOLDS.l_eff_max).toBeLessThan(1.0);
    expect(THRESHOLDS.l_eff_max).toBeGreaterThan(0);
    expect(THRESHOLDS.contractivity_margin).toBeGreaterThan(0);
    expect(THRESHOLDS.rpi_upper).toBe(7);
  });

  test("SYNTH-004: 108-cycle is canonical contractive word (2^2 * 3^3 = 108)", () => {
    expect(THRESHOLDS.cycle_108).toBe(Math.pow(2, 2) * Math.pow(3, 3));
  });

  test("verifyInvariants: returns WORM-sealed report with all 9 stubs, each a valid ProofStatus", () => {
    const report = verifyInvariants(seal);
    expect(report.seal).toBe(seal);
    const statuses = Object.values(report.results);
    expect(statuses.length).toBeGreaterThanOrEqual(9);
    const validKinds = new Set(["proved", "open", "stub"]);
    statuses.forEach(s => expect(validKinds.has(s.kind)).toBe(true));
    // SYNTH-008 must be open in any aggregate run
    expect(report.results["synth008_cruxIsOpen"].kind).toBe("open");
  });
});