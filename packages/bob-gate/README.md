# @veneer/bob-gate

## L8 — `@veneer/bob-gate`

**The BOB EVIDENCE/SILENCE gate. Spine depth 8.**

This is where governance becomes execution. Every action submitted to the Sedona Spine must pass `pearlGate()` before it proceeds. The function evaluates all 10 SYNTH constraints sequentially — alignment (001), sorry manifest (002), L0 constitutional checks (003), Banach contractivity (004), trust boundary (005), triple-lock chain of custody (006), bounded adversarial window (007), honest crux encoding (008), WORM G-Set dual signature (009), and Lean-Rust hash anchoring (010).

Any failure in any constraint yields `SILENCE`. All 10 passing yields `EVIDENCE`. Every verdict — pass or fail — is SHA-256 WORM-sealed so the decision is tamper-evident and append-only.

Constants are anchored to `ExportThresholds.lean` via `LEAN_PROOF_HASH_108_CORE`. The 108-cycle (2²×3³) is the canonical contractive word. Riemann Hypothesis fields are `none` throughout — never asserted, always honest (SYNTH-008).

**Depends on:** `@veneer/worm-core` (L1), `@veneer/f1-constants` (L0). No layer above L7 may be imported.
