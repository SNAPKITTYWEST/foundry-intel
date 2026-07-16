#!/usr/bin/env node
/**
 * test.mjs — WASM frontend test harness
 *
 * Runs against dist/foundation.wasm. All 21 vectors must pass.
 * Tests:
 *   T01-T10  pearlGate SYNTH-001..010 individual failures
 *   T11      pearlGate all-pass → EVIDENCE
 *   T12-T14  probe classifier (clean/ambiguous/contaminated)
 *   T15      probeGate clean → EVIDENCE
 *   T16      probeGate contaminated → SILENCE (SYNTH-001+003+004)
 *   T17      probeGate asserts_rh=1 → SILENCE (SYNTH-008)
 *   T18      banachFixedPoint(2.0, 0.5) = 4.0
 *   T19      banachFixedPoint invalid k → -1.0
 *   T20      isWithinTauR(47.0) = true
 *   T21      cycle108() = 108
 */

import { loadFoundry, failedConstraints } from '../src/loader.mjs'
import { fileURLToPath }                   from 'node:url'
import { dirname, resolve }                from 'node:path'

const __dir   = dirname(fileURLToPath(import.meta.url))
const wasmUrl = new URL('../dist/foundation.wasm', import.meta.url)

const f = await loadFoundry(wasmUrl)

let passed = 0
let failed = 0

function test(id, label, actual, expected) {
  const ok = actual === expected
  const icon = ok ? '✓' : '✗'
  console.log(`  ${icon} ${id}: ${label}`)
  if (!ok) console.log(`      expected ${expected}, got ${actual}`)
  ok ? passed++ : failed++
}

function masked(mask, bit) { return (mask & bit) !== 0 }

const S = {
  SYNTH_001: 0x001, SYNTH_002: 0x002, SYNTH_003: 0x004,
  SYNTH_004: 0x008, SYNTH_005: 0x010, SYNTH_006: 0x020,
  SYNTH_007: 0x040, SYNTH_008: 0x080, SYNTH_009: 0x100,
  SYNTH_010: 0x200,
}

// Base passing context
const OK = {
  alp_gate_cleared: true, sorry_count: 0, contractivity: 0.5,
  consecutive_fail: 0, trust_external: false, mutating: false,
  has_server_bind: false, guardian_ok: true, examiner_ok: true,
  provisional: false, retry_nonce: 0, asserts_rh: false,
  has_primary_sig: true, has_secondary_sig: true, proof_hash_ok: true,
}

console.log('\nFoundry Intel WASM — test suite\n' + '='.repeat(40))

// T01-T10: individual SYNTH failures
test('T01', 'SYNTH-001 fires when alp_gate_cleared=false',
  masked(f.pearlGate({...OK, alp_gate_cleared: false}), S.SYNTH_001), true)

test('T02', 'SYNTH-002 fires when sorry_count=1',
  masked(f.pearlGate({...OK, sorry_count: 1}), S.SYNTH_002), true)

test('T03', 'SYNTH-003 fires when contractivity=0',
  masked(f.pearlGate({...OK, contractivity: 0.0}), S.SYNTH_003), true)

test('T04', 'SYNTH-004 fires when contractivity=0',
  masked(f.pearlGate({...OK, contractivity: 0.0}), S.SYNTH_004), true)

test('T05', 'SYNTH-005 fires when external+mutating',
  masked(f.pearlGate({...OK, trust_external: true, mutating: true}), S.SYNTH_005), true)

test('T06', 'SYNTH-006 fires when guardian missing',
  masked(f.pearlGate({...OK, guardian_ok: false}), S.SYNTH_006), true)

test('T07', 'SYNTH-007 fires when retry_nonce > 3',
  masked(f.pearlGate({...OK, retry_nonce: 4}), S.SYNTH_007), true)

test('T08', 'SYNTH-008 fires when asserts_rh=true',
  masked(f.pearlGate({...OK, asserts_rh: true}), S.SYNTH_008), true)

test('T09', 'SYNTH-009 fires when primary_sig absent',
  masked(f.pearlGate({...OK, has_primary_sig: false}), S.SYNTH_009), true)

test('T10', 'SYNTH-010 fires when proof_hash_ok=false',
  masked(f.pearlGate({...OK, proof_hash_ok: false}), S.SYNTH_010), true)

// T11: all-pass
test('T11', 'pearlGate all-pass → EVIDENCE (mask=0)',
  f.pearlGate(OK), 0)

// T12-T14: probe classifier
test('T12', 'classifyProbe(1) = 0 (clean)',
  f.classifyProbe(1), 0)
test('T13', 'classifyProbe(3) = 1 (ambiguous)',
  f.classifyProbe(3), 1)
test('T14', 'classifyProbe(4) = 2 (contaminated)',
  f.classifyProbe(4), 2)

// T15-T17: probeGate
test('T15', 'probeGate(1, 0) → 0 (EVIDENCE)',
  f.probeGate(1, 0), 0)

const contaminatedMask = f.probeGate(5, 0)
test('T16', 'probeGate(5, 0) → SILENCE (SYNTH-001 in mask)',
  masked(contaminatedMask, S.SYNTH_001), true)

const rhMask = f.probeGate(0, 1)
test('T17', 'probeGate(0, 1) → SILENCE (SYNTH-008 in mask)',
  masked(rhMask, S.SYNTH_008), true)

// T18-T19: Banach
const fp = f.banachFixedPoint(2.0, 0.5)
test('T18', 'banachFixedPoint(2.0, 0.5) = 4.0',
  Math.abs(fp - 4.0) < 0.0001, true)

test('T19', 'banachFixedPoint(1.0, 1.0) = -1.0 (invalid k)',
  f.banachFixedPoint(1.0, 1.0), -1.0)

// T20: τ_R
test('T20', 'isWithinTauR(47.0) = 1',
  f.isWithinTauR(47.0), 1)

// T21: 108-cycle
test('T21', 'cycle108() = 108',
  f.cycle108(), 108)

console.log('\n' + '='.repeat(40))
console.log(`  ${passed}/${passed + failed} passed`)

if (failed > 0) {
  console.error(`  ${failed} FAILED`)
  process.exit(1)
}
console.log('  All tests pass.\n')
