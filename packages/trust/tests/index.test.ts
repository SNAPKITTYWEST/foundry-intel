import { TrustLevel, alpGate, TrustBoundaryEnforcer, TAU_R, CIRCUIT_BREAKER_THRESHOLD } from '../src/index.js'

describe('@veneer/trust — L4 Sedona Spine', () => {
  const ZERO_SEAL = '0'.repeat(64)

  // SYNTH-001: internal mutating action must be permitted by AlpGate
  test('SYNTH-001: internal mutating action is permitted and carries a valid WORM seal', () => {
    const r = alpGate({ action_id: 'act-001', trust_level: TrustLevel.Internal,
      mutating: true, has_server_binding: false, contractivity_score: 0.5, prev_seal: ZERO_SEAL })
    expect(r.permitted).toBe(true)
    expect(r.violations).toHaveLength(0)
    expect(r.worm_seal).toMatch(/^[0-9a-f]{64}$/)
    expect(r.prev_seal).toBe(ZERO_SEAL)
  })

  // SYNTH-005: external mutation must be unconditionally blocked
  test('SYNTH-005: external mutating action is denied with a sealed violation record', () => {
    const r = alpGate({ action_id: 'act-005a', trust_level: TrustLevel.External,
      mutating: true, has_server_binding: false, contractivity_score: 0.5, prev_seal: ZERO_SEAL })
    expect(r.permitted).toBe(false)
    expect(r.violations.some(v => v.includes('SYNTH-005'))).toBe(true)
    expect(r.worm_seal).toMatch(/^[0-9a-f]{64}$/)
  })

  // SYNTH-005: external server_binding must be blocked (governed MCP bypass)
  test('SYNTH-005: external actor with server_binding is denied', () => {
    const r = alpGate({ action_id: 'act-005b', trust_level: TrustLevel.External,
      mutating: false, has_server_binding: true, contractivity_score: 0.8, prev_seal: ZERO_SEAL })
    expect(r.permitted).toBe(false)
    expect(r.violations.some(v => v.includes('server_binding'))).toBe(true)
  })

  // SYNTH-004: zero contractivity must be rejected (Banach FP undefined)
  test('SYNTH-004: contractivity_score of 0 is denied', () => {
    const r = alpGate({ action_id: 'act-004', trust_level: TrustLevel.Internal,
      mutating: false, has_server_binding: false, contractivity_score: 0, prev_seal: ZERO_SEAL })
    expect(r.permitted).toBe(false)
    expect(r.violations.some(v => v.includes('SYNTH-004'))).toBe(true)
  })

  // WORM chain: seal must advance and link correctly across successive enforce calls
  test('WORM seal chain: each verdict links prev_seal to prior worm_seal (SYNTH-009)', () => {
    const enforcer = new TrustBoundaryEnforcer()
    const v1 = enforcer.enforce({ id: 'chain-1', trust_level: TrustLevel.Internal,
      mutating: false, has_server_binding: false, contractivity_score: 0.7 })
    const v2 = enforcer.enforce({ id: 'chain-2', trust_level: TrustLevel.Internal,
      mutating: false, has_server_binding: false, contractivity_score: 0.7 })
    expect(v2.prev_seal).toBe(v1.worm_seal)
    expect(enforcer.prevSeal).toBe(v2.worm_seal)
  })
})
