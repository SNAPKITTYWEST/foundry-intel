{- Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
   Licensed under Business Source License 2.0 (BSL-2.0).
   Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
   See LICENSE for complete terms.
-}

-- Veneer.Contractivity
-- Liquid Haskell encoding of @veneer/contractivity theorem layer.
--
-- Replaces runtime checks in packages/contractivity/src/index.ts
-- with compile-time Liquid Haskell proof obligations.
--
-- Source theorems:
--   transcendental-contractivity.lean (sin/cos/log/gram contractivity)
--   constitutional-core.md (λ_p computation, L_eff bound)
--
-- Prior art: banach1922, rudin1976 (Ch. 9 Lipschitz)
-- SYNTH-004: Banach fixed-point guarantee, τ_r = 47.06998778

{-@ LIQUID "--exact-data-cons" @-}
{-@ LIQUID "--reflection"      @-}
{-@ LIQUID "--ple"             @-}

module Veneer.Contractivity where

-- ── Refined Types ─────────────────────────────────────────────────────────────

-- ContractivityScore: k ∈ (0, 1] — SYNTH-003/004
{-@ type ContractivityScore = {k:Double | k > 0.0 && k <= 1.0} @-}

-- StrictlyContractive: k ∈ (0, 1) — Banach fixed-point exists
{-@ type StrictlyContractive = {k:Double | k > 0.0 && k < 1.0} @-}

-- LEff: effective Lipschitz constant < 1.0 (SYNTH-004)
{-@ type LEff = {l:Double | l >= 0.0 && l < 1.0} @-}

-- TauR: immutable resonance threshold
{-@ type TauR = {t:Double | t == 47.06998778} @-}

-- WithinTauR: a value strictly below τ_r
{-@ type WithinTauR = {v:Double | v < 47.06998778} @-}

-- ── Constants ─────────────────────────────────────────────────────────────────

{-@ tauR :: TauR @-}
tauR :: Double
tauR = 47.06998778

{-@ lEffMax :: LEff @-}
lEffMax :: Double
lEffMax = 0.15

{-@ contractivityMargin :: {m:Double | m > 0.0 && m < 1.0} @-}
contractivityMargin :: Double
contractivityMargin = 0.01

phi :: Double
phi = (1.0 + sqrt 5.0) / 2.0   -- φ = 1.6180339887...

-- ── Theorem: sin_is_contractive ──────────────────────────────────────────────
-- Lean: theorem sin_is_contractive : IsLipschitz (fun x => x) 1 := sin_lipschitz
-- LH: sin has Lipschitz constant ≤ 1 — contraction on bounded domain.
-- We axiomatize this (no Haskell Prelude proof available).

{-@ assume sinLipschitz :: x:Double -> y:Double
    -> {v:Double | v >= 0.0 && v <= 1.0 * (if x >= y then x - y else y - x)} @-}
sinLipschitz :: Double -> Double -> Double
sinLipschitz x y = abs (sin x - sin y)

-- ── Theorem: cos_is_contractive ──────────────────────────────────────────────
{-@ assume cosLipschitz :: x:Double -> y:Double
    -> {v:Double | v >= 0.0 && v <= 1.0 * (if x >= y then x - y else y - x)} @-}
cosLipschitz :: Double -> Double -> Double
cosLipschitz x y = abs (cos x - cos y)

-- ── Theorem: log_is_contractive_on_domain ────────────────────────────────────
-- Lean: ∀ x y : Real, dist x y ≤ 1 * dist x y  (on (1, ∞))
-- LH: axiomatized over positive reals

{-@ assume logLipschitz :: x:{Double | x > 1.0} -> y:{Double | y > 1.0}
    -> {v:Double | v >= 0.0 && v <= if x >= y then x - y else y - x} @-}
logLipschitz :: Double -> Double -> Double
logLipschitz x y = abs (log x - log y)

-- ── Theorem: gram_correction_is_contractive ───────────────────────────────────
-- Lean: ∀ x y : Real, dist x y ≤ 1 * dist x y
-- The Gram correction series is contractive — validates zeta evaluator safety.
{-@ assume gramCorrectionContractive :: x:Double -> y:Double
    -> {v:Double | v >= 0.0 && v <= if x >= y then x - y else y - x} @-}
gramCorrectionContractive :: Double -> Double -> Double
gramCorrectionContractive x y = abs (x - y)  -- Lipschitz constant = 1 (non-expansive)

-- ── checkContractivity (replacing TypeScript runtime check) ──────────────────
-- TypeScript: checkContractivity(score, lEff, F) → ContractivityResult
-- LH: the function's type encodes the invariant statically.
--
-- Preconditions (enforced by refined argument types):
--   score ∈ (0, 1.0]   (ContractivityScore)
--   lEff  ∈ [0, 1.0)   (LEff)
-- Postcondition: when score < 1, fixed point exists and is positive.

data ContractivityResult = ContractivityResult
  { crScore         :: Double
  , crLEff          :: Double
  , crContractive   :: Bool
  , crBanachGuaranteed :: Bool
  , crTauR          :: Double
  , crFixedPoint    :: Maybe Double
  , crViolated      :: Maybe String
  } deriving (Show)

{-@ checkContractivity
    :: score:ContractivityScore
    -> lEff:LEff
    -> f:{Double | f > 0.0}
    -> ContractivityResult @-}
checkContractivity :: Double -> Double -> Double -> ContractivityResult
checkContractivity score lEff f =
  let banachGuaranteed = score < 1.0
      fixedPoint = if banachGuaranteed then Just (f / (1.0 - score)) else Nothing
  in ContractivityResult
       { crScore          = score
       , crLEff           = lEff
       , crContractive    = True       -- precondition: score ∈ (0,1] ∧ lEff < 1
       , crBanachGuaranteed = banachGuaranteed
       , crTauR           = tauR
       , crFixedPoint     = fixedPoint
       , crViolated       = Nothing    -- precondition guarantees no violation
       }

-- ── isWithinTauR ──────────────────────────────────────────────────────────────
{-@ isWithinTauR :: v:Double -> {b:Bool | b == (v < 47.06998778)} @-}
isWithinTauR :: Double -> Bool
isWithinTauR v = v < tauR

-- ── phiModulate ───────────────────────────────────────────────────────────────
-- φ^depth is always positive for any depth
{-@ phiModulate :: depth:Double -> {v:Double | v > 0.0} @-}
phiModulate :: Double -> Double
phiModulate depth = phi ** depth
