namespace Core.PARM

def sealed_state_loop (v : Nat) : List Nat -> Nat
  | [] => v
  | [last] => (last * last) * (v + last)
  | p :: ps => sealed_state_loop (p * (v + p)) ps

def sealed_state (primes : List Nat) : Nat :=
  match primes with
  | [] => 0
  | [p] => p * p
  | p :: ps => sealed_state_loop (p * p) ps

theorem sealed_state_loop_pos
    (v : Nat) (ps : List Nat)
    (hv : 0 < v)
    (hps : forall p, p ∈ ps -> 0 < p) :
    0 < sealed_state_loop v ps := by
  induction ps generalizing v with
  | nil =>
      unfold sealed_state_loop
      exact hv
  | cons p ps ih =>
      have hp : 0 < p := hps p (List.Mem.head ps)
      cases ps with
      | nil =>
          unfold sealed_state_loop
          have hsum : 0 < v + p := Nat.add_pos_right v hp
          have hp2 : 0 < p * p := Nat.mul_pos hp hp
          exact Nat.mul_pos hp2 hsum
      | cons p' ps' =>
          unfold sealed_state_loop
          have hsum : 0 < v + p := Nat.add_pos_right v hp
          have hprod : 0 < p * (v + p) := Nat.mul_pos hp hsum
          apply ih (p * (v + p)) hprod
          intro x hx
          exact hps x (List.Mem.tail p hx)

theorem sealed_state_pos
    (primes : List Nat)
    (h_not_empty : primes <> [])
    (hps : forall p, p ∈ primes -> 0 < p) :
    0 < sealed_state primes := by
  cases primes with
  | nil => contradiction
  | cons p ps =>
      have hp : 0 < p := hps p (List.Mem.head ps)
      have hp2 : 0 < p * p := Nat.mul_pos hp hp
      cases ps with
      | nil =>
          unfold sealed_state
          exact hp2
      | cons p' ps' =>
          unfold sealed_state
          apply sealed_state_loop_pos
          · exact hp2
          · intro x hx
            exact hps x (List.Mem.tail p hx)

end Core.PARM
