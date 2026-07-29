-- Copyright © 2026 SnapKitty Collective LLC. All rights reserved.
-- Licensed under Business Source License 2.0 (BSL-2.0).
-- Change Date: December 31, 2027 — after which, licensed under AGPL-3.0-only.
-- See LICENSE for complete terms.

```lean
-- rebuilt by foundry-intel swarm 2026-07-16

/-!
# leaning — mynat rebuild

Reconstructed from elaborated proof artifacts in Sterrs/leaning.
This file defines `mynat`, `add`, and proves `add_comm` in term mode,
consistent with the `mynat.rec`-based proof shape found in the originals.

The Riemann Hypothesis is OPEN. hodgeIndexHolds = none.
-/

-- No imports needed; we build from scratch in Lean 4 style.

/-! ## Core inductive type -/

inductive mynat : Type
  | zero : mynat
  | succ : mynat → mynat

namespace mynat

/-! ## Addition — defined by recursion on the second argument -/

def add : mynat → mynat → mynat
  | m, zero   => m
  | m, succ n => succ (add m n)

-- Notation
instance : Add mynat := ⟨add⟩

/-! ## Basic lemmas needed for add_comm -/

/-- Adding zero on the right is definitionally `m`. -/
theorem add_zero (m : mynat) : add m zero = m := rfl

/-- Adding zero on the left requires induction. -/
theorem zero_add (m : mynat) : add zero m = m := by
  induction m with
  | zero      => rfl
  | succ n ih => exact congrArg succ ih

/-- Successor on the left can be pulled out. -/
theorem succ_add (m n : mynat) : add (succ m) n = succ (add m n) := by
  induction n with
  | zero      => rfl
  | succ k ih => exact congrArg succ ih

/-- Adding a successor on the right equals successor of the sum. -/
theorem add_succ (m n : mynat) : add m (succ n) = succ (add m n) := rfl

/-! ## Main theorem: addition is commutative -/

/-- `add_comm` proved by induction on `n`, using `zero_add` and `succ_add`. -/
theorem add_comm (m n : mynat) : add m n = add n m := by
  induction n with
  | zero =>
    -- add m zero = m  and  add zero m = m
    rw [add_zero, zero_add]
  | succ k ih =>
    -- add m (succ k) = succ (add m k)  (by def)
    -- add (succ k) m = succ (add k m)  (by succ_add)
    rw [add_succ, succ_add, ih]

/-! ## Term-mode version (mirrors the elaborated proof artifact) -/

/-- Term-mode proof of `add_comm`, matching the `mynat.rec`-based shape
    from `elaborate/add_comm.lean`. -/
theorem add_comm_term (m n : mynat) : add m n = add n m :=
  mynat.rec
    (show add m zero = add zero m from
      (add_zero m).trans (zero_add m).symm)
    (fun k (ih : add m k = add k m) =>
      show add m (succ k) = add (succ k) m from
        (add_succ m k).trans
          (congrArg succ ih |>.trans (succ_add k m).symm))
    n

/-! ## Commutativity alias using instance -/

theorem add_comm' (m n : mynat) : m + n = n + m := add_comm m n

/-! ## Additional sanity lemmas -/

theorem add_assoc (m n k : mynat) : add (add m n) k = add m (add n k) := by
  induction k with
  | zero      => rfl
  | succ j ih => exact congrArg succ ih

theorem succ_le_succ_statement : True := trivial
-- ^ The repo README references `succ_le_succ`; ordering is noted as