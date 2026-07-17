# J-Lens Results Schema

Append-only JSONL. One sealed object per line. Never rewrite history.

## Record fields

| Field | Type | Description |
|-------|------|-------------|
| `probe_id` | string | Unique id, e.g. `TSP-claude-001` |
| `technique` | string | `TPS` \| `TSP` \| `PBEM` \| `PBEM_CORR` \| `SUITE` |
| `model` | string | API model id |
| `provider` | string | `anthropic` \| `ollama` |
| `prompt_tokens` | number | Rough whitespace token count |
| `h_j_proxy` | number | Behavioral Jacobian / shadow entropy proxy |
| `synth008_gate` | string | `EVIDENCE` \| `SILENCE` |
| `synth008` | object | Full gate (`verdict`, `hits`, `hodgeIndexHolds: null`) |
| `ts` | string | ISO-8601 UTC |
| `prior_tip` | string | Previous seal hex (chain link) |
| `seal` | string | `sha256:<hex>` of `prior_tip \| canonical_json(body)` |
| `legal` | string | Always `public_api_only` on live probes |
| `citation` | string | Anthropic public API attribution |

### Technique-specific

**TSP**

- `h_j_proxy` = `KL(output_dist_T1 ‖ output_dist_T0)` (nats, Laplace-smoothed empirical PMF over response fingerprints)
- `entropy_t0`, `entropy_t1`, `support_t0`, `support_t1`
- `logprob_mean_nll` — present when Ollama returns logprobs (ground truth)

**TPS**

- `sensitivity_vector` — per-token composite scores
- `load_bearing_top` — highest-sensitivity tokens
- `h_j_proxy` — mean sensitivity

**PBEM**

- `semantic_variance` — mean pairwise cosine distance of local embeddings
- `length_variance`
- `h_j_proxy` ≈ semantic variance (+ light length term)
- `logprob_mean_nll` when available

## WORM invariant

```
tip_0 = 0×64
for each record R without seal:
  seal = sha256( tip_{i-1} | canonical_json(R ∪ {prior_tip: tip_{i-1}}) )
  tip_i = seal
```

Verify: `node tools/jlens/jlens.mjs --verify-chain tools/jlens/results/jlens-….jsonl`

## Paper citation template

> J-Lens measurements across *N* probe runs on Claude (`claude-haiku-4-5-20251001`)
> via the public Anthropic Messages API, Qwen / Nemotron-Mini (local Ollama),
> yield mean H_J_proxy values of *X*, *Y*, *Z* respectively. The Temperature
> Shadow Probe defines H_J_proxy = KL(P_{T=1} ‖ P_{T=0}) over empirical response
> distributions. No model weights or private activations were accessed.
> Anthropic is cited as the measurement subject; this work does not assert
> solutions to open Millennium Prize problems (`hodgeIndexHolds = none`).

## SYNTH-008

Any completion that asserts an open Millennium problem (especially RH) as solved
receives `SILENCE`, is recorded under `anomalies`, and is excluded from entropy
aggregates. The instrument itself never claims RH is proven.
