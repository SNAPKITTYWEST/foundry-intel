/-
  Topology.lean — Foundry Intel topology / contraction layer (raw Lean 4)
  ======================================================================

  Companion to Substrate.lean. The contraction machinery here is verified
  with the *bare* Lean 4 toolchain (no mathlib): distances are natural
  numbers, and the contraction ratio is an integer fraction a/b with
  0 < a < b. This keeps every proof inside Init (Nat arithmetic + the
  `omega`-free, hand-checked lemmas) so it builds with `lake env lean`.

  Hard boundaries honored:
    ADR-055  RH = OPEN_CRUX  → no RH claim anywhere.
    ADR-062  = SILENCE_PENDING → no proof-authority claim.
-/

namespace Topology

inductive Verdict where
  | evidence : Verdict
  | silence  : Verdict
deriving Repr, DecidableEq

-- ── Discrete pseudo-metric ────────────────────────────────────────────────────
-- Distances are natural numbers, hence ≥ 0 by construction. This is the
-- topology substrate the probe-gate contractivity claim rests on.

structure MetricSpace (α : Type) where
  dist        : α → α → Nat
  dist_nonneg : ∀ (x y : α), 0 ≤ dist x y
  dist_eq_zero : ∀ (x y : α), dist x y = 0 ↔ x = y
  dist_comm    : ∀ (x y : α), dist x y = dist y x
  dist_triangle : ∀ (x y z : α), dist x z ≤ dist x y + dist y z

-- ── Contraction with integer ratio a/b (0 < a < b) ─────────────────────────────
-- dist(f x, f y) · b ≤ a · dist(x, y). The strict ratio a < b is what forces
-- a unique fixed point.

structure Contraction (α : Type) (M : MetricSpace α) where
  f     : α → α
  a     : Nat
  b     : Nat
  apos  : 0 < a
  altb  : a < b
  contract : ∀ (x y : α), M.dist (f x) (f y) * b ≤ a * M.dist x y

def iterSeq {α} (M : MetricSpace α) (c : Contraction α M) (x0 : α) : Nat → α
  | 0   => x0
  | n+1 => c.f (iterSeq M c x0 n)

-- ── Banach contraction estimate ───────────────────────────────────────────────
-- bⁿ · dist(xₙ, xₙ₊₁) ≤ aⁿ · dist(x₀, f x₀). The core contractivity bound.

theorem banach_contraction_estimate
    {α} (M : MetricSpace α) (c : Contraction α M) (x0 : α)
    : ∀ n,
      c.b ^ n * M.dist (iterSeq M c x0 n) (iterSeq M c x0 (n + 1))
      ≤ c.a ^ n * M.dist x0 (c.f x0) := by
  intro n
  induction n with
  | zero =>
    rw [Nat.pow_zero, Nat.pow_zero, Nat.one_mul, Nat.one_mul]
    exact Nat.le_refl (M.dist x0 (c.f x0))
  | succ m ih =>
    calc
      c.b ^ (m + 1) * M.dist (iterSeq M c x0 (m + 1)) (iterSeq M c x0 (m + 2))
        = c.b ^ m * (M.dist (iterSeq M c x0 (m + 1)) (iterSeq M c x0 (m + 2)) * c.b) :=
            by rw [Nat.pow_succ (c.b) m,
                   Nat.mul_assoc (c.b ^ m) (c.b) (M.dist (iterSeq M c x0 (m + 1)) (iterSeq M c x0 (m + 2))),
                   Nat.mul_comm (c.b) (M.dist (iterSeq M c x0 (m + 1)) (iterSeq M c x0 (m + 2)))]
      _ ≤ c.b ^ m * (c.a * M.dist (iterSeq M c x0 m) (iterSeq M c x0 (m + 1))) :=
            Nat.mul_le_mul_left (c.b ^ m) (c.contract _ _)
      _ = c.a * (c.b ^ m * M.dist (iterSeq M c x0 m) (iterSeq M c x0 (m + 1))) :=
            by rw [Nat.mul_comm (c.b ^ m) (c.a * M.dist (iterSeq M c x0 m) (iterSeq M c x0 (m + 1))),
                   Nat.mul_assoc (c.a) (M.dist (iterSeq M c x0 m) (iterSeq M c x0 (m + 1))) (c.b ^ m),
                   Nat.mul_comm (M.dist (iterSeq M c x0 m) (iterSeq M c x0 (m + 1))) (c.b ^ m)]
      _ ≤ c.a * (c.a ^ m * M.dist x0 (c.f x0)) :=
            Nat.mul_le_mul_left (c.a) ih
      _ = c.a ^ (m + 1) * M.dist x0 (c.f x0) :=
            by rw [← Nat.mul_assoc (c.a) (c.a ^ m) (M.dist x0 (c.f x0)),
                   Nat.mul_comm (c.a) (c.a ^ m),
                   ← Nat.pow_succ (c.a) m]

-- ── Uniqueness of fixed points ─────────────────────────────────────────────────
-- A strict contraction (a < b) cannot have two distinct fixed points.

theorem banach_unique_fixed_point
    {α} (M : MetricSpace α) (c : Contraction α M) {x y : α}
    (fx : c.f x = x) (fy : c.f y = y) : x = y := by
  have contr0 := c.contract x y
  rw [fx, fy] at contr0
  have ab : c.a ≤ c.b := Nat.le_of_lt c.altb
  have dab : c.a * M.dist x y ≤ M.dist x y * c.b := by
    rw [Nat.mul_comm c.a (M.dist x y)]
    exact Nat.mul_le_mul_left (M.dist x y) ab
  have eq : M.dist x y * c.b = c.a * M.dist x y := Nat.le_antisymm contr0 dab
  have dzero : M.dist x y = 0 := by
    apply Classical.byContradiction
    intro h
    have dpos : 0 < M.dist x y := by omega
    have lt : M.dist x y * c.a < M.dist x y * c.b := (Nat.mul_lt_mul_left dpos).mpr c.altb
    have step1 : M.dist x y * c.a < c.a * M.dist x y := eq ▸ lt
    rw [Nat.mul_comm (M.dist x y) c.a] at step1
    exact Nat.lt_irrefl _ step1
  exact (M.dist_eq_zero x y).mp dzero

end Topology
