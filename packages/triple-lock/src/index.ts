// Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
// Licensed under Business Source License 2.0 (BSL-2.0).
// Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
// See LICENSE for complete terms.

/**
 * packages/triple-lock/src/index.ts
 * Veneer Sedona Spine — L5 @veneer/triple-lock
 *
 * Triple-Lock Sequential Chain of Custody (SYNTH-006, SYNTH-010).
 * Guardian→Examiner→Publisher — no lock may be skipped.
 * PROVISIONAL states are rejected at every stage.
 * publisher_constant proof_hash = LEAN_PROOF_HASH_108_CORE (SYNTH-010).
 *
 * Constants anchored to:
 *   crates/atlas/src/proof_attestation.rs  — PROOF_HASH
 *   crates/atlas/src/publisher.rs          — MAX_RETRY_NONCE, GUARDIAN_PREFIX, EXAMINER_PREFIX
 *   crates/commander-cli/state/archivum/witnesses.jsonl — tau_r = 47.06998778
 */

import crypto from 'crypto'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LockVerdict = 'EVIDENCE' | 'SILENCE'

export interface WormSealData {
  /** SHA-256 of ratified manifest fields */
  worm_seal: string
  /** prior chain head; '0'.repeat(64) for genesis */
  prev_seal: string
  ts: number
}

export interface GuardResult {
  guardian_witness: string
  seal: WormSealData
  verdict: LockVerdict
  reason?: string
}

export interface ExamineResult {
  examiner_witness: string
  seal: WormSealData
  verdict: LockVerdict
  reason?: string
}

export interface VerifiedManifest {
  ensemble_id: string
  sequence: number
  guardian_witness: string
  examiner_witness: string
  proof_hash: string
  state_commitment: string
  p_kernel_signature: string
}

export interface PublishResult {
  manifest: VerifiedManifest
  seal: WormSealData
  verdict: LockVerdict
  reason?: string
}

// ── Constants (anchored to foundry-intel source) ──────────────────────────────

/** proof_attestation.rs + publisher.rs line 80 */
export const LEAN_PROOF_HASH_108_CORE = 'LEAN_PROOF_HASH_108_CORE' as const
/** publisher.rs line 53 */
export const GUARDIAN_PREFIX = 'GUARDIAN-WITNESS' as const
/** publisher.rs line 57 */
export const EXAMINER_PREFIX = 'EXAMINER-WITNESS' as const
/** publisher.rs line 42 — SYNTH-007 bound */
export const MAX_RETRY_NONCE = 3 as const
/** witnesses.jsonl r_sc canonical value — Lipschitz contraction threshold */
export const TAU_R = 47.06998778 as const

// ── Internal helpers ──────────────────────────────────────────────────────────

function sha256(...parts: string[]): string {
  return crypto.createHash('sha256').update(parts.join(':')).digest('hex')
}

function genesis(): WormSealData {
  return { worm_seal: '0'.repeat(64), prev_seal: '0'.repeat(64), ts: 0 }
}

// ── Lock 1 — Guardian ─────────────────────────────────────────────────────────

/**
 * SYNTH-006 Lock 1: validate guardian witness, proof hash, retry nonce,
 * PROVISIONAL rejection, and dual-sig requirement (SYNTH-009/010).
 * Returns a WORM-sealed GuardResult.
 *
 * TODO(full-impl): integrate L0 constitutional gate and Banach contractivity
 * check from lower layers (@veneer/constitutional, @veneer/banach-field).
 */
export function guard(
  proposal: {
    sequence: number
    proof_hash: string
    guardian_witness: string
    retry_nonce: number
    status: string
  },
  prevSeal: string,
  primarySig: string,
  kernelSig: string
): GuardResult {
  const ts = Date.now()

  if (!primarySig || !kernelSig) {
    const worm_seal = sha256('SILENCE', String(proposal.sequence), prevSeal, String(ts))
    return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'SILENCE', reason: 'SYNTH-009: dual-sig required for WORM admission' }
  }
  if (proposal.status === 'PROVISIONAL') {
    const worm_seal = sha256('SILENCE', String(proposal.sequence), prevSeal, String(ts))
    return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'SILENCE', reason: 'SYNTH-006: PROVISIONAL status rejected at Lock 1' }
  }
  if (!proposal.guardian_witness.startsWith(GUARDIAN_PREFIX)) {
    const worm_seal = sha256('SILENCE', String(proposal.sequence), prevSeal, String(ts))
    return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'SILENCE', reason: `SYNTH-006: guardian_witness must start with '${GUARDIAN_PREFIX}'` }
  }
  if (proposal.proof_hash !== LEAN_PROOF_HASH_108_CORE) {
    const worm_seal = sha256('SILENCE', String(proposal.sequence), prevSeal, String(ts))
    return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'SILENCE', reason: `SYNTH-010: proof_hash '${proposal.proof_hash}' !== '${LEAN_PROOF_HASH_108_CORE}'` }
  }
  if (proposal.retry_nonce > MAX_RETRY_NONCE) {
    const worm_seal = sha256('SILENCE', String(proposal.sequence), prevSeal, String(ts))
    return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'SILENCE', reason: `SYNTH-006: retry_nonce ${proposal.retry_nonce} > MAX_RETRY_NONCE ${MAX_RETRY_NONCE}` }
  }

  const worm_seal = sha256('EVIDENCE', proposal.guardian_witness, proposal.proof_hash, prevSeal, String(ts), primarySig, kernelSig)
  return { guardian_witness: proposal.guardian_witness, seal: { worm_seal, prev_seal: prevSeal, ts }, verdict: 'EVIDENCE' }
}

// ── Lock 2 — Examiner ─────────────────────────────────────────────────────────

/**
 * SYNTH-006 Lock 2: validate examiner witness against a prior GuardResult.
 * Will issue SILENCE if Lock 1 did not pass.
 *
 * TODO(full-impl): integrate drift-manifest audit from @veneer/trust-boundary.
 */
export function examine(
  guardResult: GuardResult,
  examiner_witness: string,
  stateCommitment: string
): ExamineResult {
  const ts = Date.now()
  const prev_seal = guardResult.seal.worm_seal

  if (guardResult.verdict !== 'EVIDENCE') {
    const worm_seal = sha256('SILENCE', examiner_witness, prev_seal, String(ts))
    return { examiner_witness, seal: { worm_seal, prev_seal, ts }, verdict: 'SILENCE', reason: 'SYNTH-006: Lock 1 (Guardian) did not issue EVIDENCE — chain broken' }
  }
  if (!examiner_witness.startsWith(EXAMINER_PREFIX)) {
    const worm_seal = sha256('SILENCE', examiner_witness, prev_seal, String(ts))
    return { examiner_witness, seal: { worm_seal, prev_seal, ts }, verdict: 'SILENCE', reason: `SYNTH-006: examiner_witness must start with '${EXAMINER_PREFIX}'` }
  }

  const worm_seal = sha256('EVIDENCE', examiner_witness, guardResult.guardian_witness, stateCommitment, prev_seal, String(ts))
  return { examiner_witness, seal: { worm_seal, prev_seal, ts }, verdict: 'EVIDENCE' }
}

// ── Lock 3 — Publisher ────────────────────────────────────────────────────────

/**
 * SYNTH-006 Lock 3: ratify witness bundle into an immutable VerifiedManifest.
 * Rejects PROVISIONAL, excess retry_nonce, and failed prior locks.
 * proof_hash is always LEAN_PROOF_HASH_108_CORE (SYNTH-010).
 *
 * TODO(full-impl): compute real P-Kernel BLAKE3 signature via @veneer/worm-ledger.
 */
export function publish(
  examineResult: ExamineResult,
  bundle: { ensemble_id: string; sequence: number; state_commitment: string; retry_nonce: number; status: string }
): PublishResult {
  const ts = Date.now()
  const prev_seal = examineResult.seal.worm_seal

  if (examineResult.verdict !== 'EVIDENCE') {
    const worm_seal = sha256('SILENCE', bundle.ensemble_id, prev_seal, String(ts))
    return { manifest: {} as VerifiedManifest, seal: { worm_seal, prev_seal, ts }, verdict: 'SILENCE', reason: 'SYNTH-006: Lock 2 (Examiner) did not issue EVIDENCE — chain broken' }
  }
  if (bundle.status === 'PROVISIONAL') {
    const worm_seal = sha256('SILENCE', bundle.ensemble_id, prev_seal, String(ts))
    return { manifest: {} as VerifiedManifest, seal: { worm_seal, prev_seal, ts }, verdict: 'SILENCE', reason: 'SYNTH-006: PROVISIONAL status rejected at Publisher — cannot ratify unresolved state' }
  }
  if (bundle.retry_nonce > MAX_RETRY_NONCE) {
    const worm_seal = sha256('SILENCE', bundle.ensemble_id, prev_seal, String(ts))
    return { manifest: {} as VerifiedManifest, seal: { worm_seal, prev_seal, ts }, verdict: 'SILENCE', reason: `SYNTH-006: retry_nonce ${bundle.retry_nonce} > MAX_RETRY_NONCE ${MAX_RETRY_NONCE}` }
  }

  // TODO(full-impl): replace stub p_kernel_signature with BLAKE3(manifest_json + P_KERNEL_KEY)
  const manifest: VerifiedManifest = {
    ensemble_id: bundle.ensemble_id,
    sequence: bundle.sequence,
    guardian_witness: examineResult.seal.prev_seal, // propagated from examine's prev (guard's seal)
    examiner_witness: examineResult.examiner_witness,
    proof_hash: LEAN_PROOF_HASH_108_CORE,
    state_commitment: bundle.state_commitment,
    p_kernel_signature: sha256('SIG-PK-STUB', bundle.ensemble_id, String(bundle.sequence), LEAN_PROOF_HASH_108_CORE),
  }

  const worm_seal = sha256('EVIDENCE', manifest.ensemble_id, String(manifest.sequence), manifest.proof_hash, manifest.p_kernel_signature, prev_seal, String(ts))
  return { manifest, seal: { worm_seal, prev_seal, ts }, verdict: 'EVIDENCE' }
}

// ── Convenience combinator ────────────────────────────────────────────────────

/**
 * Run all three locks in sequence, fail-fast on first SILENCE.
 * Passes the guardian_witness from the GuardResult into examine, and
 * threads WORM seals through the chain.
 */
export function runChain(
  proposal: Parameters<typeof guard>[0],
  examiner_witness: string,
  bundle: Parameters<typeof publish>[1],
  prevSeal: string,
  primarySig: string,
  kernelSig: string
): PublishResult {
  const g = guard(proposal, prevSeal, primarySig, kernelSig)
  if (g.verdict !== 'EVIDENCE') {
    return { manifest: {} as VerifiedManifest, seal: g.seal, verdict: 'SILENCE', reason: g.reason }
  }
  const e = examine(g, examiner_witness, bundle.state_commitment)
  if (e.verdict !== 'EVIDENCE') {
    return { manifest: {} as VerifiedManifest, seal: e.seal, verdict: 'SILENCE', reason: e.reason }
  }
  return publish(e, bundle)
}