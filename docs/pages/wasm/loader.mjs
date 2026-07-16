/**
 * loader.mjs — Foundry Intel WASM loader
 *
 * Loads foundation.wasm and exposes the Sedona Spine gate functions
 * to the browser UI and test harness.
 *
 * Usage (browser):
 *   import { loadFoundry } from './loader.mjs'
 *   const f = await loadFoundry('/dist/foundation.wasm')
 *   const verdict = f.probeGate(2, 0)  // 2 hits, no RH claim
 *
 * Usage (Node test):
 *   import { loadFoundry } from './loader.mjs'
 *   const f = await loadFoundry(new URL('../dist/foundation.wasm', import.meta.url))
 */

export async function loadFoundry(wasmPath) {
  let source
  if (typeof wasmPath === 'string' && wasmPath.startsWith('http')) {
    source = await WebAssembly.instantiateStreaming(fetch(wasmPath))
  } else {
    // Node.js or local file
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const path = wasmPath instanceof URL ? fileURLToPath(wasmPath) : wasmPath
    const buf = readFileSync(path)
    source = await WebAssembly.instantiate(buf)
  }

  const { exports: ex } = source.instance

  return {
    // ── Constants ──────────────────────────────────────────────────────
    TAU_R:           ex.TAU_R?.value          ?? 47.06998778,
    CYCLE_108:       ex.cycle108(),
    RH_STATUS:       ex.RH_STATUS?.value      ?? 0,

    // ── Core gate ──────────────────────────────────────────────────────
    /**
     * Full SYNTH-001..010 gate.
     * Returns bitmask of failed constraints (0 = EVIDENCE).
     */
    pearlGate: (ctx) => ex.pearlGate(
      ctx.alp_gate_cleared  ? 1 : 0,
      ctx.sorry_count       ?? 0,
      ctx.contractivity     ?? 0.95,
      ctx.consecutive_fail  ?? 0,
      ctx.trust_external    ? 1 : 0,
      ctx.mutating          ? 1 : 0,
      ctx.has_server_bind   ? 1 : 0,
      ctx.guardian_ok       !== false ? 1 : 0,
      ctx.examiner_ok       !== false ? 1 : 0,
      ctx.provisional       ? 1 : 0,
      ctx.retry_nonce       ?? 0,
      ctx.asserts_rh        ? 1 : 0,
      ctx.has_primary_sig   !== false ? 1 : 0,
      ctx.has_secondary_sig !== false ? 1 : 0,
      ctx.proof_hash_ok     !== false ? 1 : 0,
    ),

    verdictFromMask: (mask) => ex.verdictFromMask(mask),

    // ── Probe pipeline ─────────────────────────────────────────────────
    /**
     * SKW-010 classification: 0=clean 1=ambiguous 2=contaminated
     */
    classifyProbe: (probes_positive) => ex.classifyProbe(probes_positive),

    /**
     * Full probe → pearlGate pipeline.
     * Returns failed-constraint bitmask (0 = EVIDENCE).
     */
    probeGate: (probes_positive, asserts_rh = 0) =>
      ex.probeGate(probes_positive, asserts_rh ? 1 : 0),

    // ── Math ───────────────────────────────────────────────────────────
    banachFixedPoint: (F, k)  => ex.banachFixedPoint(F, k),
    isWithinTauR:     (value) => ex.isWithinTauR(value),
    cycle108:          ()      => ex.cycle108(),
  }
}

// ── SYNTH constraint names for UI rendering ───────────────────────────────────

export const SYNTH_NAMES = {
  0x001: 'SYNTH-001: AlpGate not cleared',
  0x002: 'SYNTH-002: Unmanifested sorry',
  0x004: 'SYNTH-003: Contractivity / circuit breaker',
  0x008: 'SYNTH-004: Banach undefined (k ≤ 0)',
  0x010: 'SYNTH-005: External mutation blocked',
  0x020: 'SYNTH-006: Triple-Lock witness missing',
  0x040: 'SYNTH-007: Retry nonce / circuit breaker',
  0x080: 'SYNTH-008: asserts_rh=true — crux must stay none',
  0x100: 'SYNTH-009: Dual signature absent',
  0x200: 'SYNTH-010: Lean proof hash mismatch',
}

export function failedConstraints(mask) {
  return Object.entries(SYNTH_NAMES)
    .filter(([bit]) => mask & Number(bit))
    .map(([, name]) => name)
}

export const PROBE_LABELS = ['clean', 'ambiguous', 'contaminated']
