module RawSubstrate where

-- MORPHED FROM lean-substrate/src/Substrate.lean (raw Lean 4 substrate)
-- Liquid Haskell twin: packages/lh-theorems/src/Veneer/Contractivity.hs
-- datalog (eggs): packages/datalog

data Verdict : Set where
  evidence : Verdict
  silence  : Verdict

data Class : Set where
  clean ambiguous contaminated : Class
rawSubstrate-rh_is_silence : Set
rawSubstrate-rh_is_silence = ?
rawSubstrate-contaminated_is_silence : Set
rawSubstrate-contaminated_is_silence = ?
rawSubstrate-clean_no_rh_is_evidence : Set
rawSubstrate-clean_no_rh_is_evidence = ?
rawSubstrate-ambiguous_no_rh_is_evidence : Set
rawSubstrate-ambiguous_no_rh_is_evidence = ?
rawSubstrate-contractivity_fixed_point : Set
rawSubstrate-contractivity_fixed_point = ?
