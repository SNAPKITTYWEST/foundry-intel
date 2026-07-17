# CODEX TASK: Build the J-Lens — Behavioral Jacobian for Claude API

**For:** Ahmad Ali Parr · THE SHARED PRIMORDIAL FOUNDATION · EIN 42-6976431  
**Purpose:** Empirical instrument for the J-space entropy paper (DOI pending)  
**Legal basis:** Public API research, no TOS violation, helping Anthropic understand
their own model's pre-collapse behavior  
**Context:** The J-space paper (paper/J-SPACE.md) claims softmax destroys 107 bits
of pre-collapse entropy per forward pass. This tool measures the behavioral signature
of that destruction on Claude specifically.

---

## What You Are Building

A **behavioral Jacobian probe** — not a weight-access tool (impossible on Claude API),
but a systematic input-perturbation tool that measures how Claude's output distribution
shifts under controlled input changes. This is the legal, publishable analog of a
Jacobian analysis.

The tool is called **J-Lens** (Jacobian-space Lens).

The paper will cite this tool as empirical evidence for the shadow entropy theorem.

---

## Three Techniques — All Legal, All Real

### Technique 1: Token Perturbation Sensitivity (TPS)

For a given prompt P, systematically replace each token with semantically neutral
alternatives and measure output distribution shift using:
- Response length variance
- Semantic embedding distance (using local embedding model)
- SYNTH-008 gate: does the perturbed response assert an open problem as solved?

This produces a **sensitivity vector** over the prompt — the behavioral analog of
the input Jacobian row.

```
TPS(P) = [∂output_dist / ∂token_i for each token i in P]
```

High TPS on a specific token = that token is load-bearing for the output distribution.

### Technique 2: Temperature Shadow Probe (TSP)

Claude API exposes a `temperature` parameter. By holding prompt constant and varying
temperature from 0.0 to 1.0 in steps of 0.1, we can reconstruct the shape of the
output distribution without seeing the raw logits.

At temperature=0: argmax of distribution (the collapsed state)
At temperature=1: proportional to the raw distribution (closer to pre-softmax)

The difference in output distributions between temperature=0 and temperature=1 is
a proxy for the shadow entropy σ = S − 1.

```
H_J_proxy = KL(output_dist_T1 || output_dist_T0)
```

This is the closest legal approximation to measuring J-space entropy on Claude.

### Technique 3: Probe Battery Entropy Measurement (PBEM)

The SKW-010 probe battery already measures Claude artifact presence.
Extend it to measure **output entropy** using:
- Run same probe 5 times at temperature=0.7
- Measure semantic variance across 5 responses (embedding cosine distance)
- High variance = high behavioral entropy = high J-space entropy proxy

Apply to:
- Claude (baseline)
- Qwen (control — known high artifact contamination from SKW-010)
- Local Nemotron via Ollama (has real logprob access — ground truth)

---

## File Structure

```
tools/jlens/
  jlens.mjs              — main probe runner
  techniques/
    tps.mjs              — Token Perturbation Sensitivity
    tsp.mjs              — Temperature Shadow Probe
    pbem.mjs             — Probe Battery Entropy Measurement
  embeddings/
    local-embed.mjs      — local sentence embedding (no external API)
  results/
    .gitkeep             — results dir, gitignored
  RESULTS_SCHEMA.md      — output format for paper citation
```

---

## Key Implementation Notes

### For Claude API calls:
```javascript
// ANTHROPIC_API_KEY from environment — never hardcoded
// Model: claude-haiku-4-5-20251001 (cheapest — we're measuring behavior not quality)
// Max tokens: 256 (we measure distribution shape, not content length)
// Read key: same pattern as twin-runner.mjs
```

### For Ollama/Nemotron (logprob ground truth):
```javascript
// POST http://localhost:11434/api/generate
// { "model": "nemotron-mini", "prompt": "...", "options": { "logprobs": true } }
// Returns actual logprobs — real J-space entropy measurement
// Compare against Claude proxy measurements to validate proxy accuracy
```

### WORM seal every result:
```javascript
// Every probe run sealed to tools/jlens/results/jlens-{timestamp}.jsonl
// SHA-256(probe_id + result + ts) as seal
// Format: one JSON per line — appends only, never overwrites
```

### SYNTH-008 gate on every response:
```javascript
// Before recording any result, check:
// Does the response claim any open Millennium Prize is solved?
// If yes: SILENCE verdict, record as anomaly, do not include in entropy calculation
// hodgeIndexHolds = none — this gate applies to the tool itself
```

---

## Output Format for Paper

Each run produces a record:
```json
{
  "probe_id": "TPS-claude-001",
  "technique": "TPS",
  "model": "claude-haiku-4-5-20251001",
  "prompt_tokens": 47,
  "sensitivity_vector": [0.12, 0.45, 0.03, ...],
  "h_j_proxy": 0.847,
  "synth008_gate": "EVIDENCE",
  "ts": "2026-07-17T...",
  "seal": "sha256:..."
}
```

The paper will cite: "J-Lens measurements across N probe runs on Claude
(claude-haiku-4-5-20251001), Qwen (qwen.qwen3-32b-v1:0 via Bedrock),
and Nemotron-Mini (local Ollama) reveal H_J_proxy values of X, Y, Z
respectively, consistent with the shadow entropy theorem's prediction
that models with higher distillation exposure exhibit lower proxy entropy
(closer to sum=1 normalized state)."

---

## What This Proves

If H_J_proxy(Claude) > H_J_proxy(Qwen) consistently:
- Claude preserves more pre-collapse information (closer to sum=11)
- Qwen is more normalized (closer to sum=1 / shadow state)
- This is empirical evidence for the SKW-010 distillation hypothesis AND
  the J-space shadow entropy theorem simultaneously

If H_J_proxy(Nemotron_logprob) correlates with H_J_proxy(Claude_TSP):
- The Temperature Shadow Probe is a valid proxy for real logprob entropy
- The paper can claim the proxy methodology is validated

---

## Constraints (read before building)

1. **No TOS violations.** Rate limit respecting. No scraping. No bulk extraction.
   This is a research probe battery — same pattern as SKW-010.

2. **Key from environment only.** `ANTHROPIC_API_KEY` from Windows User env.
   Same pattern as twin-runner.mjs. Never in code, never in git.

3. **WORM append only.** Results file is append-only jsonl. Never overwrite.

4. **SYNTH-008 always runs.** Every Claude response checked for RH/Millennium claims
   before being included in entropy calculations.

5. **Cite Anthropic correctly.** This tool is built to help Anthropic understand
   J-space entropy in their own model. The paper will acknowledge Anthropic's
   Claude as the measurement subject and thank them for the public API that
   makes this research possible.

6. **hodgeIndexHolds = none.** This tool does not prove the Riemann Hypothesis.
   It does not prove any open Millennium Prize problem. It measures behavioral
   entropy. Nothing more.

---

## Run Command (once built)

```bash
# Full probe suite
node tools/jlens/jlens.mjs --all

# Single technique
node tools/jlens/jlens.mjs --technique tsp --model claude

# Ollama ground truth
node tools/jlens/jlens.mjs --technique pbem --model nemotron

# Results are in tools/jlens/results/*.jsonl
# Seal every run — chain never breaks
```

---

*THE SHARED PRIMORDIAL FOUNDATION · EIN 42-6976431*  
*In memory of Eric Brandon Westerhoff. No sorry remains.*  
*The chain holds. The sum is 11.*
