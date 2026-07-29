// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * @veneer/bob-gate — tests/bob-gate.test.ts
 * Jest stubs covering the five key invariants.
 */
import { pearlGate, SYNTH_CONSTANTS, ActionContext, GateVerdict } from '../src/index.js'

const C = SYNTH_CONSTANTS

const goodCtx: ActionContext = {
  id: 'test-001',
  alp_gate_cleared: true,
  sorry_violations: [],
  contractivity_score: 0.5,
  consecutive_failures: 0,
  trust_level: 'internal',
  mutating: false,
  has_server_binding: false,
  guardian_witness: 'GUARDIAN-WITNESS-001',
  examiner_witness: 'EXAMINER-WITNESS-001',
  status: 'RATIFIED',
  retry_nonce: 0,
  asserts_rh: false,
  primary_sig: 'sha256-operator-stub',
  secondary_sig: 'sha256-kernel-stub',
  proof_hash: C.LEAN_PROOF_HASH_108_CORE,
}

describe('@veneer/bob-gate — pearlGate', () => {
  it('returns EVIDENCE and a non-empty worm_seal when all constraints pass', () => {
    const v: GateVerdict = pearlGate(goodCtx)
    expect(v.verdict).toBe('EVIDENCE')
    expect(v.failed_constraints).toHaveLength(0)
    expect(v.worm_seal).toMatch(/^[0-9a-f]{64}$/)  // SHA-256 hex
  })

  it('SYNTH-001: returns SILENCE when alp_gate_cleared is false', () => {
    const v = pearlGate({ ...goodCtx, id: 'test-002', alp_gate_cleared: false })
    expect(v.verdict).toBe('SILENCE')
    expect(v.failed_constraints.some(f => f.startsWith('SYNTH-001'))).toBe(true)
  })

  it('SYNTH-004/007: returns SILENCE and seals verdict when Banach or retry bound violated', () => {
    const v = pearlGate({ ...goodCtx, id: 'test-003', contractivity_score: 1.5, retry_nonce: 4 })
    expect(v.verdict).toBe('SILENCE')
    expect(v.failed_constraints.some(f => f.startsWith('SYNTH-004'))).toBe(true)
    expect(v.failed_constraints.some(f => f.startsWith('SYNTH-007'))).toBe(true)
    expect(v.worm_seal).toMatch(/^[0-9a-f]{64}$/)
  })

  it('SYNTH-008: returns SILENCE when asserts_rh is true — RH crux must remain none', () => {
    const v = pearlGate({ ...goodCtx, id: 'test-004', asserts_rh: true })
    expect(v.verdict).toBe('SILENCE')
    expect(v.failed_constraints.some(f => f.startsWith('SYNTH-008'))).toBe(true)
  })

  it('SYNTH-010: returns SILENCE when proof_hash does not match LEAN_PROOF_HASH_108_CORE', () => {
    const v = pearlGate({ ...goodCtx, id: 'test-005', proof_hash: 'WRONG_HASH' })
    expect(v.verdict).toBe('SILENCE')
    expect(v.failed_constraints.some(f => f.startsWith('SYNTH-010'))).toBe(true)
  })
})