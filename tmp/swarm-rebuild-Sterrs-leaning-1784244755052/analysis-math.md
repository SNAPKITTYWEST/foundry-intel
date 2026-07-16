# Mathematical Analysis: Sterrs/leaning Repository

## Overview
This is a **Lean theorem prover repository** focused on elaborated proofs of basic arithmetic properties on custom natural numbers (`mynat`).

## Identified Mathematical Content

### Proven Theorems
1. **`add_comm` (Addition Commutativity)**
   - Multiple elaborated versions: `add_comm.lean`, `add_comm_0.lean`, `add_comm_2.lean`
   - Status: **PROVEN** (no `sorry` statements visible)
   - Demonstrates: `∀ m n : mynat, add m n = add n m`
   - Shows elaborate term-mode proofs using `mynat.rec` (recursion principle) and `eq.rec` (equality reasoning)

2. **`mul_comm` (Multiplication Commutativity)**
   - File: `elaborate/mul_comm.lean`
   - Status: **PROVEN** (elaborated form provided)
   - Demonstrates: `∀ m n : mynat, mul m n = mul n m`

3. **Induction Principles**
   - `strong_induction.lean` - Strong induction framework
   - Status: **PROVEN** (elaborated)

4. **List Operations**
   - `append_init_last_nat.lean` - Append and list initialization
   - `rev_concat_nat.lean` - Reverse and concatenation
   - `concat_empty_nat.lean` - Concatenation identity
   - Status: **PROVEN** (elaborated forms present)

5. **Multiplicative Properties**
   - `mul_pow.lean` - Multiplication and exponentiation
   - `mul_cancel_induction.lean` - Cancellation laws
   - `mul_cancel_total_order_no_tactic.lean` - Total order properties
   - Status: **PROVEN** (elaborated, no tactics used)

## Structural Observations

**Key Pattern:** Files exist in paired forms:
- `.lean` (verbose, readable elaboration)
- `.stripped.lean` (compressed, single-line version)
- `make_comparison.py` and `strip.py` automate formatting

**Proof Architecture:** All proofs use:
- Recursion principles (`mynat.rec`)
- Equality reasoning (`eq.rec`, `eq.refl`)
- Propositional extensionality (`propext`)
- NO tactic mode (pure term mode)

## Status Summary

| Concept | Status |
|---------|--------|
| Addition Commu