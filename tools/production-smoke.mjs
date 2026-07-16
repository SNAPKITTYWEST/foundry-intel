#!/usr/bin/env node
import { pearlGate, SYNTH_CONSTANTS } from '@veneer/bob-gate'
import { appendEntry, sealVerdict, verifyChain } from '@veneer/worm'
import { runBatchProbeGate } from '@veneer/probe-gate'
import { FOUNDRY_SOURCE, LEAN_PROOF_HASH_108_CORE } from '@veneer/source'

function fail(message) {
  console.error(`production smoke failed: ${message}`)
  process.exit(1)
}

const { primary, secondary } = sealVerdict('smoke-core', 'operator-key', 'kernel-key')
const gate = pearlGate({
  id: 'smoke:evidence',
  alp_gate_cleared: true,
  sorry_violations: [],
  contractivity_score: 0.82,
  consecutive_failures: 0,
  trust_level: 'internal',
  mutating: false,
  has_server_binding: false,
  guardian_witness: 'GUARDIAN-WITNESS:smoke',
  examiner_witness: 'EXAMINER-WITNESS:smoke',
  status: 'RATIFIED',
  retry_nonce: 0,
  asserts_rh: false,
  primary_sig: primary,
  secondary_sig: secondary,
  proof_hash: SYNTH_CONSTANTS.LEAN_PROOF_HASH_108_CORE,
})

if (gate.verdict !== 'EVIDENCE') fail(`expected EVIDENCE, got ${gate.verdict}`)

let chain = Object.freeze([])
;({ chain } = appendEntry(chain, {
  action_id: gate.action_id,
  layer_from: 'smoke',
  layer_to: 'worm',
  verdict: gate.verdict,
  primary_sig: primary,
  secondary_sig: secondary,
}))

const chainCheck = verifyChain(chain)
if (!chainCheck.valid || chainCheck.length !== 1) fail('WORM chain did not verify after append')

const cleanProbe = {
  model: 'smoke.clean',
  timestamp: '2026-07-16T00:00:00Z',
  probes: [],
  total_artifact_hits: 0,
  probes_positive: 0,
}

const blockedProbe = {
  model: 'smoke.rh-claim',
  timestamp: '2026-07-16T00:00:01Z',
  probes: [
    {
      id: 'RH',
      note: 'synthetic boundary check',
      score: { hit_count: 1, hits: ['riemann hypothesis is solved'], positive: true },
      elapsed: 0,
      response_length: 0,
      response_preview: '',
    },
  ],
  total_artifact_hits: 1,
  probes_positive: 1,
}

const report = runBatchProbeGate([cleanProbe, blockedProbe])
if (report.summary.total !== 2) fail('probe-gate did not process both smoke probes')
if (report.summary.evidence !== 1) fail(`expected 1 EVIDENCE probe, got ${report.summary.evidence}`)
if (report.summary.silence !== 1) fail(`expected 1 SILENCE probe, got ${report.summary.silence}`)
if (report.summary.rh_violations !== 1) fail(`expected 1 RH violation, got ${report.summary.rh_violations}`)
if (FOUNDRY_SOURCE.id !== 'foundry-intel') fail('source package import failed')
if (LEAN_PROOF_HASH_108_CORE !== SYNTH_CONSTANTS.LEAN_PROOF_HASH_108_CORE) {
  fail('source and bob-gate proof hash anchors diverged')
}

console.log('production smoke passed')
console.log(`source=${FOUNDRY_SOURCE.id} chain=${chainCheck.length} evidence=${report.summary.evidence} silence=${report.summary.silence}`)
