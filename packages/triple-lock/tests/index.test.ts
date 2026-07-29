// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * packages/triple-lock/tests/triple-lock.test.ts
 * Jest stubs for @veneer/triple-lock invariants.
 */

import {
  guard,
  examine,
  publish,
  runChain,
  LEAN_PROOF_HASH_108_CORE,
  GUARDIAN_PREFIX,
  EXAMINER_PREFIX,
  MAX_RETRY_NONCE,
} from '../src/index.js'

const PREV_SEAL = '0'.repeat(64)
const PRIMARY_SIG = 'test-primary-sig'
const KERNEL_SIG = 'test-kernel-sig'

const validProposal = {
  sequence: 1,
  proof_hash: LEAN_PROOF_HASH_108_CORE,
  guardian_witness: `${GUARDIAN_PREFIX}-001-abcdef-${LEAN_PROOF_HASH_108_CORE}`,
  retry_nonce: 0,
  status: 'ACTIVE',
}

const validBundle = {
  ensemble_id: 'ens-test-001',
  sequence: 1,
  state_commitment: 'state-hash-abc',
  retry_nonce: 0,
  status: 'ACTIVE',
}

const validExaminerWitness = `${EXAMINER_PREFIX}-ens-test-001-DRIFT-deadbeef`

describe('@veneer/triple-lock', () => {
  // SYNTH-006: PROVISIONAL status must be rejected at Lock 1 (Guardian)
  it('rejects PROVISIONAL status at guard (SYNTH-006)', () => {
    const result = guard({ ...validProposal, status: 'PROVISIONAL' }, PREV_SEAL, PRIMARY_SIG, KERNEL_SIG)
    expect(result.verdict).toBe('SILENCE')
    expect(result.reason).toMatch(/PROVISIONAL/)
  })

  // SYNTH-010: proof_hash must equal LEAN_PROOF_HASH_108_CORE
  it('rejects wrong proof_hash at guard (SYNTH-010)', () => {
    const result = guard({ ...validProposal, proof_hash: 'WRONG_HASH' }, PREV_SEAL, PRIMARY_SIG, KERNEL_SIG)
    expect(result.verdict).toBe('SILENCE')
    expect(result.reason).toMatch(/SYNTH-010/)
  })

  // SYNTH-006: Lock 2 must not proceed if Lock 1 issued SILENCE
  it('propagates SILENCE from guard through examine (SYNTH-006 chain)', () => {
    const g = guard({ ...validProposal, proof_hash: 'BAD' }, PREV_SEAL, PRIMARY_SIG, KERNEL_SIG)
    const e = examine(g, validExaminerWitness, validBundle.state_commitment)
    expect(e.verdict).toBe('SILENCE')
    expect(e.reason).toMatch(/Lock 1/)
  })

  // SYNTH-006: retry_nonce exceeding MAX_RETRY_NONCE must be rejected
  it('rejects retry_nonce > MAX_RETRY_NONCE at guard (SYNTH-006/007)', () => {
    const result = guard({ ...validProposal, retry_nonce: MAX_RETRY_NONCE + 1 }, PREV_SEAL, PRIMARY_SIG, KERNEL_SIG)
    expect(result.verdict).toBe('SILENCE')
    expect(result.reason).toMatch(/retry_nonce/)
  })

  // SYNTH-006 + SYNTH-010: full happy-path chain issues EVIDENCE with correct proof_hash
  it('full chain issues EVIDENCE and manifest carries LEAN_PROOF_HASH_108_CORE', () => {
    const result = runChain(validProposal, validExaminerWitness, validBundle, PREV_SEAL, PRIMARY_SIG, KERNEL_SIG)
    expect(result.verdict).toBe('EVIDENCE')
    expect(result.manifest.proof_hash).toBe(LEAN_PROOF_HASH_108_CORE)
    expect(result.seal.worm_seal).toHaveLength(64)
  })
})
