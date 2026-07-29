{- Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
   Licensed under Business Source License 2.0 (BSL-2.0).
   Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
   See LICENSE for complete terms.
-}

module Main where

import Test.Tasty
import Test.Tasty.HUnit

import Veneer.Convergence
import Veneer.Contractivity
import Veneer.Trust
import Veneer.BobGate

main :: IO ()
main = defaultMain tests

tests :: TestTree
tests = testGroup "lh-theorems"
  [ convergenceTests
  , contractivityTests
  , trustTests
  , bobGateTests
  ]

-- ── Convergence ───────────────────────────────────────────────────────────────

convergenceTests :: TestTree
convergenceTests = testGroup "Veneer.Convergence"
  [ testCase "cycle108Canonical = 108" $
      cycle108Canonical @?= 108

  , testCase "banachFixedPoint positive when k < 1" $
      let fp = banachFixedPoint 1.0 0.5
      in assertBool "fixed point > 0" (fp > 0.0)

  , testCase "banachFixedPoint = F/(1-k)" $
      banachFixedPoint 2.0 0.5 @?= 4.0

  , testCase "recursiveTensorStability: tensorUpdate f 0 f = f" $
      tensorUpdate 5.0 0.0 5.0 @?= 5.0

  , testCase "hodgeIndexHolds = Nothing (crux open, SYNTH-008)" $
      hodgeIndexHolds @?= (Nothing :: Maybe Bool)

  , testCase "cruxIsOpen witness" $
      cruxIsOpen @?= ()

  , testCase "assertsRhViolation = False" $
      assertsRhViolation @?= False

  , testCase "tauR = 47.06998778" $
      tauR @?= (47.06998778 :: Double)
  ]

-- ── Contractivity ─────────────────────────────────────────────────────────────

contractivityTests :: TestTree
contractivityTests = testGroup "Veneer.Contractivity"
  [ testCase "checkContractivity: score=0.5 is contractive" $ do
      let r = checkContractivity 0.5 0.1 1.0
      assertBool "contractive" (crContractive r)
      assertBool "banach guaranteed" (crBanachGuaranteed r)

  , testCase "checkContractivity: score=1.0 is contractive but no banach" $ do
      let r = checkContractivity 1.0 0.1 1.0
      assertBool "contractive at boundary" (crContractive r)
      assertBool "no banach at k=1" (not (crBanachGuaranteed r))

  , testCase "checkContractivity: fixedPoint = F/(1-k)" $ do
      let r = checkContractivity 0.5 0.1 2.0
      crFixedPoint r @?= Just 4.0

  , testCase "isWithinTauR: 47.0 < 47.07" $
      assertBool "47.0 within tauR" (isWithinTauR 47.0)

  , testCase "isWithinTauR: 47.07 not within tauR" $
      assertBool "47.07 not within tauR" (not (isWithinTauR 47.07))

  , testCase "phiModulate depth 0 = 1" $
      Veneer.Contractivity.phiModulate 0 @?= 1.0
  ]

-- ── Trust ─────────────────────────────────────────────────────────────────────

trustTests :: TestTree
trustTests = testGroup "Veneer.Trust"
  [ testCase "alpGate: external+mutating = denied" $ do
      let ctx = AlpGateContext "action-1" External True False 0.5 (replicate 64 '0')
      let r = alpGate ctx
      assertBool "denied" (not (agrPermitted r))
      assertBool "has violation" (not (null (agrViolations r)))

  , testCase "alpGate: internal+mutating = permitted" $ do
      let ctx = AlpGateContext "action-2" Internal True False 0.5 (replicate 64 '0')
      let r = alpGate ctx
      assertBool "permitted" (agrPermitted r)

  , testCase "alpGate: external server_binding = denied" $ do
      let ctx = AlpGateContext "action-3" External False True 0.5 (replicate 64 '0')
      let r = alpGate ctx
      assertBool "denied" (not (agrPermitted r))

  , testCase "SYNTH-005 theorem: externalMutationBlocked = False" $
      externalMutationBlocked External True @?= False

  , testCase "circuitBreakerThreshold = 3" $
      Veneer.Trust.circuitBreakerThreshold @?= 3

  , testCase "maxRetryNonce = 3" $
      Veneer.Trust.maxRetryNonce @?= 3
  ]

-- ── BobGate ───────────────────────────────────────────────────────────────────

bobGateTests :: TestTree
bobGateTests = testGroup "Veneer.BobGate"
  [ testCase "pearlGate: all constraints pass = EVIDENCE" $ do
      let ctx = validCtx
      let r = pearlGate ctx
      gvVerdict r @?= EVIDENCE

  , testCase "pearlGate: asserts_rh = SILENCE (SYNTH-008)" $ do
      let ctx = validCtx { acAssertsRh = True }
      let r = pearlGate ctx
      gvVerdict r @?= SILENCE

  , testCase "pearlGate: external mutation = SILENCE (SYNTH-005)" $ do
      let ctx = validCtx { acTrustLevel = BGExternal, acMutating = True }
      let r = pearlGate ctx
      gvVerdict r @?= SILENCE

  , testCase "pearlGate: alp_gate not cleared = SILENCE (SYNTH-001)" $ do
      let ctx = validCtx { acAlpGateCleared = False }
      let r = pearlGate ctx
      gvVerdict r @?= SILENCE

  , testCase "pearlGate: proof_hash mismatch = SILENCE (SYNTH-010)" $ do
      let ctx = validCtx { acProofHash = "wrong" }
      let r = pearlGate ctx
      gvVerdict r @?= SILENCE
  ]

-- ── Test fixture ──────────────────────────────────────────────────────────────

validCtx :: ActionContext
validCtx = ActionContext
  { acId                  = "test-action"
  , acAlpGateCleared      = True
  , acSorryViolations     = []
  , acContractivityScore  = 0.5
  , acConsecutiveFailures = 0
  , acTrustLevel          = BGInternal
  , acMutating            = False
  , acHasServerBinding    = False
  , acGuardianWitness     = "GUARDIAN-WITNESS:ok"
  , acExaminerWitness     = "EXAMINER-WITNESS:ok"
  , acStatus              = "ACCEPTED"
  , acRetryNonce          = 0
  , acAssertsRh           = False
  , acPrimarySig          = "sha256:primary"
  , acSecondarySig        = "sha256:secondary"
  , acProofHash           = "LEAN_PROOF_HASH_108_CORE"
  }
