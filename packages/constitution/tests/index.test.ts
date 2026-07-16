import { ConstitutionModel, CIRCUIT_BREAKER, MAX_RETRY_NONCE, LAMBDA_M_THRESHOLD } from '../src/index.js'

const goodSeal = { prev_seal: '0'.repeat(64), context_seal: 'test' }

const baseInput = {
  state_norm: 1.0,
  drift_rate: 0.05,
  critique_results: Array.from({ length: 10 }, (_, i) => ({ critique_id: i, passed: true })),
  prime_gates: [{ action_name: 'act', gate_value: 7 }],
  contractivity_score: 0.9,
  kill_switch_active: false,
  active_anchors: [],
  consecutive_failures: 0,
  retry_nonce: 0,
  seal: goodSeal,
}

test('L0-valid: all nine checks pass, worm_seal is 64-hex', () => {
  const result = new ConstitutionModel(baseInput).validate()
  expect(result.valid).toBe(true)
  expect(result.failed_checks).toHaveLength(0)
  expect(result.worm_seal).toMatch(/^[0-9a-f]{64}$/)
})

test('SYNTH-007/L0-7: circuit breaker trips at consecutive_failures >= CIRCUIT_BREAKER', () => {
  const m = new ConstitutionModel({ ...baseInput, consecutive_failures: CIRCUIT_BREAKER }).validate()
  expect(m.valid).toBe(false)
  expect(m.failed_checks.some(c => c.includes('L0-7'))).toBe(true)
})

test('SYNTH-007/L0-7: retry_nonce > MAX_RETRY_NONCE is rejected', () => {
  const m = new ConstitutionModel({ ...baseInput, retry_nonce: MAX_RETRY_NONCE + 1 }).validate()
  expect(m.valid).toBe(false)
  expect(m.failed_checks.some(c => c.includes('SYNTH-007'))).toBe(true)
})

test('SYNTH-003/L0-2: drift_rate >= lambda_m fails', () => {
  const m = new ConstitutionModel({ ...baseInput, drift_rate: LAMBDA_M_THRESHOLD }).validate()
  expect(m.valid).toBe(false)
  expect(m.failed_checks.some(c => c.includes('L0-2'))).toBe(true)
})

test('WORM-seal: two calls with same input produce different seals (ts differs)', async () => {
  await new Promise(r => setTimeout(r, 2))
  const r1 = new ConstitutionModel(baseInput).validate()
  await new Promise(r => setTimeout(r, 2))
  const r2 = new ConstitutionModel(baseInput).validate()
  expect(r1.worm_seal).not.toBe(r2.worm_seal)
})