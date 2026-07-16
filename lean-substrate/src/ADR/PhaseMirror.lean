set_option linter.unusedVariables false
set_option linter.unusedSimpArgs false

namespace ADR.ALP.PhaseMirror

structure SystemState where
  artaDefect : Int
  multiplicityMeasure : Int
deriving Repr

def CnlSource : Type := String

inductive AlpRule where
  | increaseMultiplicity (delta : Int)
  | decreaseArtaDefect (delta : Int)
  | noOp
deriving Repr

structure AlpPolicy where
  name : String
  rules : List AlpRule
deriving Repr

def rtaMetric (s : SystemState) : Int :=
  s.multiplicityMeasure - s.artaDefect

def applyRule (s : SystemState) (r : AlpRule) : SystemState :=
  match r with
  | AlpRule.increaseMultiplicity d => { s with multiplicityMeasure := s.multiplicityMeasure + d }
  | AlpRule.decreaseArtaDefect d => { s with artaDefect := s.artaDefect - d }
  | AlpRule.noOp => s

def applyPolicyList (s : SystemState) : List AlpRule -> SystemState
  | [] => s
  | r :: rs => applyPolicyList (applyRule s r) rs

def applyPolicy (s : SystemState) (p : AlpPolicy) : SystemState :=
  applyPolicyList s p.rules

def AlpRule.preservesRta : AlpRule -> Prop
  | AlpRule.increaseMultiplicity d => 0 <= d
  | AlpRule.decreaseArtaDefect d => 0 <= d
  | AlpRule.noOp => True

theorem step_preserves (s : SystemState) (r : AlpRule)
    (h : AlpRule.preservesRta r) : rtaMetric (applyRule s r) >= rtaMetric s := by
  cases r with
  | increaseMultiplicity d =>
      unfold AlpRule.preservesRta at h
      unfold applyRule rtaMetric
      omega
  | decreaseArtaDefect d =>
      unfold AlpRule.preservesRta at h
      unfold applyRule rtaMetric
      omega
  | noOp =>
      unfold applyRule rtaMetric
      exact le_refl (s.multiplicityMeasure - s.artaDefect)

theorem alp_preserves_rta_list (s : SystemState) (rs : List AlpRule)
    (h_valid : forall r, r ∈ rs -> AlpRule.preservesRta r) :
    rtaMetric (applyPolicyList s rs) >= rtaMetric s := by
  induction rs generalizing s with
  | nil =>
      simp [applyPolicyList]
  | cons r rs ih =>
      have hr : AlpRule.preservesRta r := h_valid r (List.Mem.head rs)
      have hrs : forall r', r' ∈ rs -> AlpRule.preservesRta r' := by
        intro r' hr'
        exact h_valid r' (List.Mem.tail r hr')
      have hstep := step_preserves s r hr
      have htail := ih (applyRule s r) hrs
      exact le_trans hstep htail

theorem alp_preserves_rta (s : SystemState) (p : AlpPolicy)
    (h_valid : forall r, r ∈ p.rules -> AlpRule.preservesRta r) :
    rtaMetric (applyPolicy s p) >= rtaMetric s :=
  alp_preserves_rta_list s p.rules h_valid

theorem cnl_evaluation_deterministic
    (f : SystemState -> CnlSource -> Option (AlpPolicy × Int))
    (s : SystemState) (cnl : CnlSource)
    (x y : AlpPolicy × Int)
    (h1 : f s cnl = some x)
    (h2 : f s cnl = some y) :
    x = y := by
  rw [h1] at h2
  exact Option.some.inj h2

structure LlmDraft where
  raw : String
deriving Repr

def LlmDraft.toCnl (d : LlmDraft) : CnlSource := d.raw

def CnlCompiler.parse (_s : CnlSource) : Option AlpPolicy := none

def LlmDraft.normalize (d : LlmDraft) : Option AlpPolicy :=
  CnlCompiler.parse (LlmDraft.toCnl d)

theorem llm_normalize_eq_parse_toCnl (d : LlmDraft) :
    LlmDraft.normalize d = CnlCompiler.parse (LlmDraft.toCnl d) := by
  rfl

end ADR.ALP.PhaseMirror
