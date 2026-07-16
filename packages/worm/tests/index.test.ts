/**
 * packages/worm/tests/worm.test.ts
 * @veneer/worm — invariant tests
 */

import { appendEntry, verifyChain, sealVerdict, SORRY_MANIFEST, GENESIS_SEAL } from '../src/index.js'
import type { WormChain } from '../src/index.js'
import crypto from 'crypto'

const OP_KEY     = 'operator-test-key'
const KERNEL_KEY = 'kernel-test-key'

function makeSigs(core: string) {
  return sealVerdict(core, OP_KEY, KERNEL_KEY)
}

describe('@veneer/worm — SYNTH-009 + SYNTH-002', () => {

  test('SYNTH-002: SORRY_MANIFEST has exactly 13 entries, all open', () => {
    expect(SORRY_MANIFEST.length).toBe(13)
    for (const r of SORRY_MANIFEST) {
      expect(r.status).toBe('open')
      expect(r.lean_path.startsWith('ALP.')).toBe(true)
    }
  })

  test('SYNTH-009: appendEntry rejects missing primary_sig', () => {
    const chain: WormChain = []
    expect(() =>
      appendEntry(chain, {
        action_id: 'a1', layer_from: 'L6', layer_to: 'L7',
        verdict: 'EVIDENCE', primary_sig: '', secondary_sig: 'k',
      })
    ).toThrow('SYNTH-009')
  })

  test('SYNTH-009: appendEntry rejects missing secondary_sig', () => {
    const chain: WormChain = []
    expect(() =>
      appendEntry(chain, {
        action_id: 'a2', layer_from: 'L6', layer_to: 'L7',
        verdict: 'EVIDENCE', primary_sig: 'p', secondary_sig: '',
      })
    ).toThrow('SYNTH-009')
  })

  test('SYNTH-009: grow-only — chain length only ever increases, genesis prev_seal is 64 zeros', () => {
    let chain: WormChain = []
    const { primary, secondary } = makeSigs('core-v1')
    const { chain: c1, entry } = appendEntry(chain, {
      action_id: 'tx-1', layer_from: 'L6', layer_to: 'L7',
      verdict: 'EVIDENCE', primary_sig: primary, secondary_sig: secondary,
    })
    expect(c1.length).toBe(1)
    expect(entry.prev_seal).toBe(GENESIS_SEAL)
    // original chain must be unaffected (G-Set immutability)
    expect(chain.length).toBe(0)
  })

  test('verifyChain detects tampered seal at seq > 0', () => {
    let chain: WormChain = []
    const sigs = makeSigs('core')
    const signed = { primary_sig: sigs.primary, secondary_sig: sigs.secondary }
    ;({ chain } = appendEntry(chain, { action_id: 'tx-a', layer_from: 'L5', layer_to: 'L7', verdict: 'EVIDENCE', ...signed }))
    ;({ chain } = appendEntry(chain, { action_id: 'tx-b', layer_from: 'L6', layer_to: 'L7', verdict: 'EVIDENCE', ...signed }))

    // Tamper: mutate the first entry's seal via spread (simulate corruption)
    const tampered: WormChain = [
      { ...chain[0], worm_seal: 'deadbeef'.repeat(8) },
      chain[1],
    ]
    const result = verifyChain(tampered)
    expect(result.valid).toBe(false)
    expect(result.broken_at).toBe(1)
  })

})
