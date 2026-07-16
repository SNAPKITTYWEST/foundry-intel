# Q(phi) Golden-Ratio ADR Parser

Exact golden-ratio field parsing for the Veneer / foundry-intel ADR registry.

A field element is represented in Janet as `@[a b] = a + b*phi`, with `a,b in Q`
and `phi^2 = phi + 1`. Janet owns the exact rational and Q(phi) arithmetic.
R orchestrates Janet execution and emits a CSV index.

The manifest classifies ADR theorem/proof posture as metadata. It does not
independently prove the underlying mathematics, and it must not convert an open
crux into a proof claim.

## Run

```sh
Rscript tools/q5-adr-parser/parse_adrs.R \
  tools/q5-adr-parser/ADR_REGISTRY.txt \
  tools/q5-adr-parser/adr_manifest.json \
  tools/q5-adr-parser/golden_adr.janet
```

If Janet or R is unavailable, the repository fallback mirrors the same status
and Q(phi) weight rules:

```sh
node tools/q5-adr-parser/generate_manifest.mjs
```

Outputs:

- `tools/q5-adr-parser/adr_manifest.json`
- `tools/q5-adr-parser/adr_manifest_index.csv`

Statuses:

- `OPEN_CRUX`
- `SILENCE_PENDING`
- `PROVEN_NO_SORRY`
- `SPECIFIED`

Weights:

- `OPEN_CRUX = -1 + phi`
- `SILENCE_PENDING = phi`
- `PROVEN_NO_SORRY = 1 + phi`
- `SPECIFIED = 1`
