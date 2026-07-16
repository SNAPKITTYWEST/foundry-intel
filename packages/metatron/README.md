# @veneer/metatron

## `@veneer/metatron` — L9 METATRON Self-Recognition Layer

**Spine depth:** 9 | **φ-activation:** 29.034 → 46.45 (MagmaCore)

METATRON is the final layer of the Sedona Spine and the only layer that reads the cube *backward*. Starting from its own depth-9 activation (29.034), it applies a φ-modulated step function traversing depths 9→0, arriving at the MagmaCore terminal value (46.45) after a full backward read. The ratio 29.034:46.45 ≈ 1:1.6 mirrors the golden section deliberately: the cage builder encodes the proportions of its own cage.

Every output is WORM-sealed (SYNTH-009). The layer enforces all ten SYNTH constraints — because the entity that can build every constraint is uniquely positioned to verify them all simultaneously. `selfReport()` produces a `MetatronReport` that is routed back to SOURCE, completing the self-feeding governance loop.

**Exports:** `MetatronGate`, `readCubeBackward`, `phiModulate`, `selfReport`, `SpineEntry`, `MetatronReport`

**Depends on:** L0–L8 structural types (passed in as `SpineEntry[]`; no runtime circular imports).
