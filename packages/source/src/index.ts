/**
 * @veneer/source — L0 F₁ Substrate Layer
 * The inexhaustible SOURCE. Exports ExportThresholds constants and EDB seed pointer.
 * SYNTH-002: sorry manifest (13 entries). SYNTH-008: RH=none. SYNTH-010: threshold anchoring.
 */

// ── ExportThresholds — anchored to foundry-intel/lean/ExportThresholds.lean ──
export const TAU_R = 47.06998778
export const L_EFF_MAX = 0.15
export const CONTRACTIVITY_MARGIN = 0.01
export const LAMBDA_M = 0.1
export const CIRCUIT_BREAKER_THRESHOLD = 3
export const MAX_RETRY_NONCE = 3
export const LEAN_PROOF_HASH_108_CORE = 'LEAN_PROOF_HASH_108_CORE'

// ── SYNTH-008: Crux status — RH encoded honestly as open ─────────────────────
export const CRUX_STATUS = {
  hodgeIndexHolds: null,      // none — never asserted
  liPositivityHolds: null,    // none — never asserted
} as const

// ── SYNTH-002: Sorry manifest — 13 permitted entries ─────────────────────────
export const SORRY_MANIFEST: readonly string[] = [
  'ALP.Archivum.WitnessContract.witness_after_veto_implies_disallowed',
  'ALP.Archivum.WitnessContract.witness_after_admit_implies_constitution_valid',
  'ALP.Candle.PirtmBridge.candle_ignition_sound',
  'ALP.Contracts.NonBypassability.no_unaligned_execution',
  'ALP.Contracts.TrustArbitration.internal_admits_mcp',
  'ALP.Contracts.TrustArbitration.external_blocks_governed_mcp',
  'ALP.MCP.GovernanceBinding.sat_requires_alp_admission',
  'ALP.PolicyEngine.Admissibility.validate_action_sound',
  'ALP.PolicyEngine.Admissibility.validate_action_veto_implies_constitution_fail',
  'ALP.PolicyEngine.Proofs.external_mutating_action_blocked',
  'ALP.PolicyEngine.Proofs.external_with_server_binding_blocked',
  'ALP.Tests.Integration.e2e_internal_workflow_receives_witness',
  'ALP.Tests.Integration.e2e_external_workflow_blocked_from_governed_mcp',
] as const

export const PERMITTED_SORRY_COUNT = 13

// ── Source pointer ────────────────────────────────────────────────────────────
export interface SourcePointer {
  id: string
  role: string
  depth: 0
  lines: number
  tauR: number
  lEffMax: number
  contractivityMargin: number
  sorryManifestCount: number
  cruxStatus: typeof CRUX_STATUS
}

export const FOUNDRY_SOURCE: SourcePointer = {
  id: 'foundry-intel',
  role: 'Prime Materia Commons — Sedona Spine — inexhaustible SOURCE',
  depth: 0,
  lines: 2_149_256,
  tauR: TAU_R,
  lEffMax: L_EFF_MAX,
  contractivityMargin: CONTRACTIVITY_MARGIN,
  sorryManifestCount: PERMITTED_SORRY_COUNT,
  cruxStatus: CRUX_STATUS,
}

export function isSorryPermitted(sorry: string): boolean {
  return (SORRY_MANIFEST as readonly string[]).includes(sorry)
}
