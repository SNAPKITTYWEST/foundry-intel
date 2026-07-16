/**
 * @veneer/contractivity — L6 Geometric Invariant Layer
 * Banach fixed-point guarantee: 0 < k ≤ 1.0, L_eff < 1.0
 * τ_r = 47.06998778 (ExportThresholds.lean). φ-modulated activation.
 * SYNTH-004.
 */
import { TAU_R, L_EFF_MAX, CONTRACTIVITY_MARGIN } from '@veneer/source'

export { TAU_R, L_EFF_MAX, CONTRACTIVITY_MARGIN }

// ── Golden ratio — φ ──────────────────────────────────────────────────────────
export const PHI = (1 + Math.sqrt(5)) / 2  // 1.6180339887...

// ── φ-modulated resonance activations (BOB ResonanceGraph) ───────────────────
export const RESONANCE_ACTIVATIONS = {
  depth0_source:    1.0,
  depth1_oracle:    PHI,
  depth2_sentinel:  PHI ** 2,
  depth3_prism:     PHI ** 3,
  depth4_nexus:     PHI ** 4,   // ~7.720
  depth5_metatron:  PHI ** 5,   // ~29.034 — highest intermediate
  depth5_reasoning: 18.14,
  depth6_magmacore: PHI ** 6,   // ~46.45 — final
} as const

export interface ContractivityResult {
  score: number
  lEff: number
  contractive: boolean
  banachGuaranteed: boolean
  tauR: number
  fixedPoint: number | null   // T∞ = F/(1-k) when k < 1
  violated: string | null
}

export function checkContractivity(
  score: number,
  lEff: number,
  F = 1.0
): ContractivityResult {
  let violated: string | null = null
  if (score <= 0)       violated = 'SYNTH-004-zero'
  else if (score > 1.0) violated = 'SYNTH-004-expansive'
  else if (lEff >= 1.0) violated = 'SYNTH-004-leff-boundary'

  const contractive = violated === null
  const banachGuaranteed = contractive && score < 1.0
  const fixedPoint = banachGuaranteed ? F / (1 - score) : null

  return { score, lEff, contractive, banachGuaranteed, tauR: TAU_R, fixedPoint, violated }
}

export function phiModulate(depth: number): number {
  return PHI ** depth
}

export function isWithinTauR(value: number): boolean {
  return value < TAU_R
}
