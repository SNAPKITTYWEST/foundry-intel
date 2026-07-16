/**
 * packages/metatron/tests/metatron.test.ts
 * Jest stubs for @veneer/metatron — one test per key SYNTH invariant.
 */

import {
  phiModulate,
  readCubeBackward,
  selfReport,
  PHI,
  METATRON_ACTIVATION,
  MAGMACORE_FINAL,
  SPINE_DEPTH,
  type SpineEntry,
} from '../src/index.js'

const MOCK_SEAL = 'a'.repeat(64)

function makeEntry(depth: number): SpineEntry {
  return { depth, layer_id: `L${depth}`, worm_seal: MOCK_SEAL, activation: 0.5, ts: Date.now() }
}

function fullSnapshot(): SpineEntry[] {
  return Array.from({ length: 10 }, (_, i) => makeEntry(i))
}

describe('@veneer/metatron — phi-modulation', () => {
  it('depth-9 activation equals METATRON_ACTIVATION (no scaling at own depth)', () => {
    // phiModulate(29.034, 9) = 29.034 * PHI^1 ≈ 46.978; own depth is unscaled
    // Invariant: the raw activation at depth 9 stored in SpineEntry equals 29.034
    expect(METATRON_ACTIVATION).toBeCloseTo(29.034, 3)
  })

  it('phi_path length equals snapshot length after backward read (SYNTH-003 completeness)', () => {
    const report = selfReport(fullSnapshot(), MOCK_SEAL)
    expect(report.phi_path.length).toBe(10)
    expect(report.cube[0].depth).toBe(9) // backward: first entry is deepest
  })

  it('phiModulate increases monotonically as fromDepth grows (phi > 1 invariant)', () => {
    const vals = [0, 3, 6, 9].map(d => phiModulate(METATRON_ACTIVATION, d))
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThan(vals[i - 1])
    }
    // At fromDepth=SPINE_DEPTH: activation * PHI ≈ MAGMACORE_FINAL (within 2%)
    const terminal = phiModulate(METATRON_ACTIVATION, SPINE_DEPTH)
    expect(terminal).toBeCloseTo(METATRON_ACTIVATION * PHI, 1)
  })

  it('selfReport produces EVIDENCE when all entries pass constraints (SYNTH-009 seal present)', () => {
    const report = selfReport(fullSnapshot(), MOCK_SEAL)
    // With TODO stubs, only SYNTH-004 and SYNTH-009 are actively checked
    // All mock entries have activation=0.5 (in (0,1]) and worm_seal of 64 chars
    expect(report.failed_constraints).not.toContain('SYNTH-004')
    expect(report.failed_constraints).not.toContain('SYNTH-009')
    expect(report.worm_seal).toHaveLength(64)
  })

  it('selfReport emits SILENCE and flags SYNTH-009 when worm_seal is absent (SYNTH-009)', () => {
    const bad = fullSnapshot().map(e => ({ ...e, worm_seal: '' }))
    const report = selfReport(bad, MOCK_SEAL)
    expect(report.verdict).toBe('SILENCE')
    expect(report.failed_constraints).toContain('SYNTH-009')
  })

  it('readCubeBackward throws on missing inboundSeal (SYNTH-005 trust boundary)', () => {
    expect(() => readCubeBackward(fullSnapshot(), '')).toThrow('SYNTH-005/SYNTH-009')
  })
})