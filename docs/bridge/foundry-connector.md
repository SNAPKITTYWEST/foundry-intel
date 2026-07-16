# Foundry Connector Contract

This document connects the scattered proof engines into one operational lane:

- `SNAPKITTYWEST/gkn-i4-e7-lean` owns the Lean quantum bridge latch.
- `SNAPKITTYWEST/foundry-intel-2026-07-11` owns ADR governance, Q(phi)
  theorem posture classification, and Foundry Intel hardening.
- `SNAPKITTYWEST/foundry-f1` owns the C++/C/NASM runtime substrate,
  sorry-engine receiver, and Claude-facing operator handoff.

The trust/rebrand track is governed by ADR-302. The current repo name remains
`foundry-intel-2026-07-11` until an explicit GitHub rename, while the target
public identity is `THE SHARED PRIMORDIAL FOUNDATION - Foundry Intel, in care
of Bel Esprit D'Accord`.

ADR-303 promotes this repository to the main umbrella monorepo for THE SHARED
PRIMORDIAL FOUNDATION. Foundry Intel remains the governance subsystem, and
Foundry F1 remains an external legacy receiver until specific artifacts are
ported with manifests and validation.

The WASM frontend is now docked inside the umbrella through
`apps/wasm-frontend/dist/` and published from `docs/pages/wasm/`. The frontend
is a governed surface: ADR, Q(phi), WORM, BOB, and open-crux boundaries remain
the source of truth.

The machine-readable contract is
`tools/foundry-connector/connector-manifest.json`.

Agent-to-agent instructions move through XML handoff envelopes. The protocol is
defined in `docs/protocols/xml-handoff-envelope.md`, and the active Foundry
Intel envelope is `docs/handoff/foundry-intel-agent-contract.xml`.
The Primordial Foundation transition envelope is
`docs/handoff/primordial-foundation-agent-contract.xml`.

Incoming agents also get a committed metadata tour:

- `docs/agents/metadata-tour.md`
- `docs/agents/metadata-tour.json`

README branding uses local institutional trust SVG badges under `docs/brand/`.

## Active Anchors

| Engine | Anchor | Status |
|---|---|---|
| GKN quantum bridge | `de968509b5fc695f2d33e665959c6b86f5456be1` | Latch commit pushed; repo re-archived |
| GKN source scan head | `0e3cd5c0a0e01f24a8604882513640f42327cff8` | Source hash captured inside latch manifest |
| TypeScript to Liquid Haskell | `GKN-TYPE-LIQUID-HANDOFF-20260716` | `READY_FOR_CLAUDE` |
| Q(phi) ADR parser | `tools/q5-adr-parser/adr_manifest.json` | 11 ADR records |
| Q(phi) roll-up | `8 + 3*phi` | Metadata classification only |
| Foundry F1 receiver | `SNAPKITTYWEST/foundry-f1` | Runtime/sorry-engine receiver |
| Primordial Foundation rebrand | `ADR-302` | Transition track active |
| Umbrella monorepo | `ADR-303` | Main repo transition active |
| WASM frontend ingress | `apps/wasm-frontend/` | Built and manifest-sealed |
| WASM Pages dock | `docs/pages/wasm/index.html` | Published by Prolog Pages generator |

## Non-Negotiable Boundaries

- Q(phi) weights are metadata classifications, not independent proof claims.
- ADR-055 keeps the RH/Zeta crux open; infrastructure evidence is not a proof
  of the Riemann Hypothesis.
- ADR-062 remains `SILENCE_PENDING` until the Sigma Kernel governance gap is
  closed by explicit theorem evidence.
- Liquid Haskell refinements may reference Lean theorem names as anchors, but
  they do not replace Lean proofs.
- Foundry F1 receives and executes runtime/sorry-engine work. It does not
  silently promote an open bridge into a closed theorem.
- Foundry/F1 is wired into Foundry Intel through connector, XML handoff, ADR,
  WORM, and BOB lanes. It is not silently vendored into this repository.
- Rebrand metadata does not rename the GitHub repo or amend legal instruments
  without explicit external action.

## Claude Handoff

Claude should start at the Foundry F1 receiver document:

`SNAPKITTYWEST/foundry-f1/docs/bridge/CLAUDE_HANDOFF.md`

Then read the GKN latch artifacts:

- `bridge/quantum-latch-manifest.json`
- `bridge/type-liquid-handoff.json`

Then read this Intel connector manifest and Q(phi) outputs:

- `tools/foundry-connector/connector-manifest.json`
- `tools/q5-adr-parser/adr_manifest.json`
- `docs/architecture/adr-q5-theorem-classification.md`

## Local Check

```sh
npm install
npm run adr:q5:fallback
npm run connector:check
npm run handoff:check
npm test --workspace @veneer/wasm-frontend
npm run verify
```
