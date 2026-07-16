# Architecture Analysis: Sterrs/leaning

## Project Purpose
A Lean proof assistant repository focused on **elaborated proof terms** for mathematical theorems, particularly induction-based proofs on natural numbers. The README references Gödel and playful mathematical philosophy ("Gödel Gang").

## Dependency Structure

### External Dependencies
- **Lean 3** (implied by syntax: `mynat.rec`, `eq.rec`, `λ` notation)
- **leanpkg.toml** exists but content not provided
- Likely depends on Lean standard library for basic types/tactics

### Internal Structure
```
elaborate/
  ├── Core theorems:
  │   ├── add_comm.lean (addition commutativity)
  │   ├── mul_comm.lean (multiplication commutativity)
  │   ├── mul_pow.lean (power properties)
  │   └── strong_induction.lean
  ├── List operations:
  │   ├── append_init_last_nat.lean
  │   ├── concat_empty_nat.lean
  │   └── rev_concat_nat.lean
  ├── Advanced:
  │   ├── mul_cancel_induction.lean
  │   └── mul_cancel_total_order_no_tactic.lean
  ├── Tooling:
  │   ├── strip.py (elaboration reduction)
  │   ├── make_comparison.py (comparison generation)
  │   └── Makefile
```

## Architectural Intent

**Primary Goal**: Extract and document *elaborated proof terms* — the fully explicit term-mode proofs underlying Lean tactics.

For each theorem, two versions exist:
- `.lean` — full elaborated output
- `.stripped.lean` — reduced/simplified form

This suggests a workflow: **generate elaborations → strip/optimize → analyze**.

## Abandonment Indicators

1. **No source proofs**: No `.v` files or tactic proofs found. Only elaborated terms exist.
2. **Incomplete elaborations**: `add_comm.lean` cuts off mid-proof (trunc