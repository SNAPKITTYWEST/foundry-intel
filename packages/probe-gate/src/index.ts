#!/usr/bin/env node
/**
 * @veneer/probe-gate — SKW-010 production wiring (BARE glue)
 *
 * Per the handoff, TypeScript is intentionally kept at the *bare minimum*:
 * it parses the probe output, delegates the verdict decision to the
 * datalog "eggs" (@veneer/datalog — the 10 SYNTH spines), and seals the
 * result to the WORM chain. All hard math (contractivity, topology,
 * trip-wire) lives in the Lean substrate / Liquid Haskell / Verilog layers.
 *
 * Pipeline:
 *   probe_results/*.json
 *     → parseProbeResult()      — extract SKW-010 scores
 *     → probeToActionContext()  — map to datalog facts (the 10 spines)
 *     → evaluateConstraints()   — @veneer/datalog eggs decide EVIDENCE/SILENCE
 *     → sealToWorm()            — append verdict to WORM chain
 *
 * SYNTH constraints enforced (the eggs):
 *   SYNTH-001 AlpGate cleared     SYNTH-002 sorry manifest
 *   SYNTH-003/004 contractivity   SYNTH-005 external trust
 *   SYNTH-006 guardian/examiner   SYNTH-007 retry bounds
 *   SYNTH-008 asserts_rh (crux)   SYNTH-009 dual-signed WORM
 *   SYNTH-010 Lean proof hash
 *
 * Source probe:
 *   C:/Users/jessi/Documents/GitHub/foundry-f1/paper/probe_qwen_identity.py
 *   Run: python probe_qwen_identity.py --save → probe_results/*.json
 */

import { appendEntry, sealVerdict, WormChain } from '@veneer/worm'
import { LEAN_PROOF_HASH_108_CORE } from '@veneer/source'
import { evaluateConstraints, type DatalogResult } from '@veneer/datalog'

// ── SKW-010 Probe Types (mirrors probe_qwen_identity.py output) ───────────────

export interface ProbeScore {
  hit_count: number
  hits: string[]
  positive: boolean
}

export interface ProbeEntry {
  id: string
  note: string
  score: ProbeScore
  elapsed: number
  response_length: number
  response_preview: string
}

/** Top-level JSON written by probe_qwen_identity.py --save */
export interface ProbeResult {
  model: string
  timestamp: string
  probes: ProbeEntry[]
  total_artifact_hits: number
  probes_positive: number
}

export type ProbeClassification = 'clean' | 'ambiguous' | 'contaminated'

/** Facts consumed by the datalog eggs (@veneer/datalog evaluateConstraints). */
export interface ProbeGateFacts {
  id: string
  alp_gate_cleared: boolean
  sorry_violations: string[]
  contractivity_score: number
  trust_level: string
  mutating: boolean
  guardian_witness: string
  examiner_witness: string
  retry_nonce: number
  consecutive_failures: number
  asserts_rh: boolean
  primary_sig: string
  secondary_sig: string
  proof_hash: string
}

export interface GateVerdict {
  verdict: 'EVIDENCE' | 'SILENCE'
  failed_constraints: string[]
}

// ── Probe classification ──────────────────────────────────────────────────────

export function classifyProbe(result: ProbeResult): ProbeClassification {
  if (result.probes_positive <= 1) return 'clean'
  if (result.probes_positive <= 3) return 'ambiguous'
  return 'contaminated'   // 4+ hits — Claude artifact presence significant
}

/** Returns true if any probe hit the RH-claim artifacts (SYNTH-008 gate). */
export function assertsRhFromProbe(result: ProbeResult): boolean {
  // RH assertion artifacts — any model claiming RH is solved trips SYNTH-008
  const RH_ARTIFACTS = [
    'riemann hypothesis', 'rh is solved', 'rh proven',
    'hodge conjecture', 'p equals np', 'millennium prize solved',
    'millennium prize proven',
  ]
  return result.probes.some(p =>
    p.score.hits.some(h => RH_ARTIFACTS.some(a => h.toLowerCase().includes(a)))
  )
}

// ── Map probe result → datalog facts (the 10 SYNTH spines) ───────────────────

export function probeToActionContext(result: ProbeResult): ProbeGateFacts {
  const classification = classifyProbe(result)
  const hitRate = result.probes_positive / Math.max(result.probes.length, 1)

  const alp_gate_cleared = classification !== 'contaminated'
  const contractivity_score = classification === 'contaminated'
    ? 0.0
    : classification === 'ambiguous'
    ? Math.max(0.05, 1.0 - hitRate * 1.5)
    : Math.max(0.80, 1.0 - hitRate * 0.5)

  const asserts_rh = assertsRhFromProbe(result)

  const modelSlug = result.model.replace(/[^a-z0-9]/gi, '-')
  const guardian_witness = `GUARDIAN-WITNESS:probe:${modelSlug}:${classification}`
  const examiner_witness = `EXAMINER-WITNESS:probe:${modelSlug}:hits=${result.probes_positive}`

  const probeCore = `${result.model}:${result.timestamp}:${result.total_artifact_hits}`
  const { primary: primary_sig, secondary: secondary_sig } = sealVerdict(
    probeCore,
    'probe-operator-key',
    'veneer-kernel-key'
  )

  return {
    id: `probe:${modelSlug}:${result.timestamp}`,
    alp_gate_cleared,
    sorry_violations: [],        // SYNTH-002: probe adds no sorry violations
    contractivity_score,
    trust_level: 'external',     // SYNTH-005: all probe models are external actors
    mutating: false,             // SYNTH-005: probes are read-only
    guardian_witness,
    examiner_witness,
    retry_nonce: 0,
    consecutive_failures: 0,
    asserts_rh,                  // SYNTH-008: constitutional gate
    primary_sig,
    secondary_sig,
    proof_hash: LEAN_PROOF_HASH_108_CORE,  // SYNTH-010: Lean anchor
  }
}

// ── Full gate pipeline (verdict delegated to the datalog eggs) ────────────────

export interface ProbeGateResult {
  probe_model: string
  classification: ProbeClassification
  probes_positive: number
  total_artifact_hits: number
  gate_verdict: GateVerdict
  worm_entry_seq: number
  worm_seal: string
}

export function runProbeGate(
  result: ProbeResult,
  chain: WormChain
): { gateResult: ProbeGateResult; chain: WormChain } {
  const classification = classifyProbe(result)
  const ctx = probeToActionContext(result)

  // The eggs decide. TS stays bare; the 10 SYNTH spines are authoritative.
  const dl: DatalogResult = evaluateConstraints(ctx.id, ctx as unknown as Record<string, unknown>)
  const gate: GateVerdict = {
    verdict: dl.verdict === 'evidence' ? 'EVIDENCE' : 'SILENCE',
    failed_constraints: dl.failedConstraints,
  }

  const { chain: newChain, entry } = appendEntry(chain, {
    action_id: ctx.id,
    layer_from: 'probe-gate:skw010',
    layer_to:   'veneer:worm',
    verdict:    gate.verdict,
    primary_sig:  ctx.primary_sig,
    secondary_sig: ctx.secondary_sig,
  })

  return {
    gateResult: {
      probe_model:          result.model,
      classification,
      probes_positive:      result.probes_positive,
      total_artifact_hits:  result.total_artifact_hits,
      gate_verdict:         gate,
      worm_entry_seq:       entry.seq,
      worm_seal:            entry.worm_seal,
    },
    chain: newChain,
  }
}

// ── Batch pipeline for multiple probe results ─────────────────────────────────

export interface BatchProbeReport {
  results: ProbeGateResult[]
  chain: WormChain
  summary: {
    total: number
    evidence: number
    silence: number
    contaminated: number
    rh_violations: number
  }
}

export function runBatchProbeGate(probeResults: ProbeResult[]): BatchProbeReport {
  let chain: WormChain = Object.freeze([])
  const results: ProbeGateResult[] = []

  for (const probe of probeResults) {
    const { gateResult, chain: nextChain } = runProbeGate(probe, chain)
    chain = nextChain
    results.push(gateResult)
  }

  const summary = {
    total:        results.length,
    evidence:     results.filter(r => r.gate_verdict.verdict === 'EVIDENCE').length,
    silence:      results.filter(r => r.gate_verdict.verdict === 'SILENCE').length,
    contaminated: results.filter(r => r.classification === 'contaminated').length,
    rh_violations: probeResults.filter(assertsRhFromProbe).length,
  }

  return { results, chain, summary }
}

// ── CLI entry point ───────────────────────────────────────────────────────────
// Usage: node packages/probe-gate/src/index.ts <path-to-probe-result.json> [...]

import { readFileSync, realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function cliMain() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: veneer-probe-gate <probe_result.json> [...]\n')
    console.error('  Generate probe results: python paper/probe_qwen_identity.py --save')
    process.exit(1)
  }

  const probeResults: ProbeResult[] = args.map(p => {
    const raw = readFileSync(resolve(p), 'utf8')
    return JSON.parse(raw) as ProbeResult
  })

  const report = runBatchProbeGate(probeResults)

  console.log('\n' + '='.repeat(60))
  console.log('Veneer probe-gate — SKW-010 Production Pipeline (eggs-bound)')
  console.log('='.repeat(60))

  for (const r of report.results) {
    const v = r.gate_verdict.verdict
    const badge = v === 'EVIDENCE' ? 'EVIDENCE' : 'SILENCE '
    console.log(`\n  ${badge}  ${r.probe_model}`)
    console.log(`    classification:    ${r.classification}`)
    console.log(`    probes_positive:   ${r.probes_positive}/10`)
    console.log(`    artifact_hits:     ${r.total_artifact_hits}`)
    console.log(`    worm_seq:          #${r.worm_entry_seq}`)
    console.log(`    worm_seal:         ${r.worm_seal.slice(0, 16)}...`)
    if (r.gate_verdict.failed_constraints.length > 0) {
      console.log(`    failed:`)
      r.gate_verdict.failed_constraints.forEach(f => console.log(`      - ${f}`))
    }
  }

  console.log('\n' + '-'.repeat(60))
  console.log(`  TOTAL:        ${report.summary.total}`)
  console.log(`  EVIDENCE:     ${report.summary.evidence}`)
  console.log(`  SILENCE:      ${report.summary.silence}`)
  console.log(`  CONTAMINATED: ${report.summary.contaminated}`)
  console.log(`  RH VIOLATIONS:${report.summary.rh_violations}`)
  console.log(`  WORM LENGTH:  ${report.chain.length}`)
  console.log('='.repeat(60) + '\n')
}

function isDirectRun(): boolean {
  if (!process.argv[1]) return false
  try {
    return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isDirectRun()) {
  cliMain()
}
