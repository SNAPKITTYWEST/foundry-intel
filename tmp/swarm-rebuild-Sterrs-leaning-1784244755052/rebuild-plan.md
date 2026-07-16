# Rebuild Plan: Sterrs/leaning

## 1. What to Keep

- `elaborate/add_comm.lean` — keep verbatim; verified sorry-free with full term-mode proof using `mynat.rec` and `eq.rec`
- `elaborate/add_comm_0.lean` — keep verbatim; same status
- `elaborate/add_comm_2.lean` — keep if contents match verified pattern (no sorry); flag for manual review
- All `.stripped.lean` variants — keep as pedagogical companions
- README philosophy/framing — keep

## 2. What to Rewrite

**`mynat` base definitions** — reconstruct from scratch using only what elaborated proofs imply:
```lean
inductive mynat : Type
| zero : mynat
| succ : mynat → mynat
def add : mynat → mynat → mynat
| m zero     := m
| m (succ n) := succ (add m n)
```
This is the only definition shape consistent with the `mynat.rec`-based `add_comm` proofs.

**`mul_comm.lean`** — the original is unverified. Do not preserve. Rebuild from scratch (see §3).

## 3. Sorry Targets to Attempt

| Theorem | Tactic Plan | Honest Status |
|---|---|---|
| `add_zero : add m zero = m` | `rfl` or `cases` | Likely closes; attempt first |
| `add_succ : add m (succ n) = succ (add m n)` | `rfl` by definition | Closes trivially |
| `add_comm` | Replicate existing term-mode proof exactly | Already closed |
| `mul_zero : mul m zero = zero` | `rfl` | Attempt |
| `mul_succ : mul m (succ n) = add (mul m n) m` | `rfl` or `simp` | Attempt |
| `mul_comm` | `induction m; induction n; simp [mul_zero, mul_succ, add_comm]` | **Uncertain — leave with `sorry` if induction step does not close automatically** |

Do NOT claim `mul_comm` closes without running Lean. Mark it explicitly `-- OPEN` in comments.

## 4. New File Structure

```
leaning/
  mynat/
    definition.lean       # inductive type + add + mul definitions
    add_lemmas.lean       # add_zero, add_succ, add_comm (term-mode)
    mul_lemmas.lean       # mul_zero, mul_succ, mul_comm (sorry-marked if unproven)
  elaborate/
    add_comm.lean         # kept verbatim
    add_comm_0.lean       # kept verbatim
    add_comm_2.lean       # kept pending review
    add_comm.stripped.lean
    add_comm_0.stripped.lean
  README.md
  OPEN_PROBLEMS.md        # explicit list of unproven targets
```

## 5. Honestly Left Open

- `mul_comm` — file exists but marked `sorry` until Lean confirms closure
- Any theorem in files whose contents were never surfaced (e.g., `add_comm_2.lean` unverified)
- No claims about `ring` tactic closing anything; that