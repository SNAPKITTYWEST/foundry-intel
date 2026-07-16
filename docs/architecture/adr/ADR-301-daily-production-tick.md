# ADR-301: Daily Production Tick — Sedona Spine Hardening Clock

**Status:** Accepted
**Date:** 2026-07-16
**Author:** SNAPKITTYWEST
**Governed by:** ADR-200, ADR-300
**Tick time:** 07:16 UTC daily
**Mode:** Non-mutating production verification

---

## Context

The Veneer SYNTH layers now build, test, smoke, and expose a user-facing
`veneer-probe-gate` CLI. Production readiness must not depend on a human
remembering to rerun the gate. The system needs a daily tick that verifies the
Sedona Spine remains hatchable: installable, buildable, testable, smokeable,
and honest about open cruxes.

This ADR makes that tick explicit and stiff: the daily clock is a verification
clock, not a spam or mutation clock.

## Decision

Create a daily GitHub Actions production tick at `07:16 UTC` in
`.github/workflows/veneer-verify.yml`.

The tick runs:

```sh
npm ci
npm run verify
```

`npm run verify` runs:

1. Q(phi) ADR manifest generation.
2. Foundry connector validation.
3. XML handoff envelope validation.
4. TypeScript build for the active Node workspaces.
5. TypeScript lint/typecheck.
6. No-cache Jest tests for the active SYNTH packages.
7. Built-package production smoke test.
8. Phase Mirror commit/promotion gate.
9. ADR production tick summary.

The tick summary is produced by `tools/adr-production-tick.mjs`. In GitHub
Actions it writes a single job summary through `$GITHUB_STEP_SUMMARY`. Locally
it prints the same summary to stdout.

`tools/formal/phase_mirror_commit_gate.mjs` runs immediately before the ADR
tick. It scans workflow and tool surfaces for repository mutation paths, blocks
Phase Mirror proof-promotion language, and reports Phase Mirror as
`BLOCKED_FROM_MUTATION`. If Lean build evidence is absent, proof promotion
remains `BLOCKED_NO_LEAN_BUILD_EVIDENCE`.

`tools/formal/phase_mirror_force_invoke.mjs` then reads
`docs/protocols/phase-mirror-force-invoke.trap` and validates the final
regression trap. The ADR tick must see `FORCE_INVOKED_TRAP_ACTIVE` before it can
emit a passing summary.

## Non-Mutating Rule

The daily tick must not:

- push commits
- open issues
- post PR comments
- post discussion comments
- write repository files
- mutate or auto-commit Phase Mirror state
- promote open cruxes into proof claims

Any future workflow that writes commits or comments requires a separate ADR.
This prevents comment storms and keeps the tick as a hard verification pulse,
not an attention mechanism.

## Production Gate

The canonical production gate is:

```sh
npm run verify
```

The CLI user path is:

```sh
npm install
npm run build
npx veneer-probe-gate probe_results/example.json
```

## Crux Boundaries

- ADR-055 remains `OPEN_CRUX`.
- ADR-062 remains `SILENCE_PENDING`.
- Q(phi) weights remain metadata classifications only.
- Liquid Haskell refinements do not supersede Lean proof authority.
- Phase Mirror/PIRTM scanner checks do not become kernel-verified Lean claims
  without recorded Lean build evidence.
- WORM remains write-once/read-many ledger semantics.

## Consequences

**Pros**

- Production status is checked every day without manual intervention.
- Local and CI gates use the same command.
- The daily tick leaves an auditable Actions summary without comment noise.
- Open mathematical gaps remain visible and blocked from accidental promotion.

**Cons**

- The daily tick consumes CI minutes.
- Liquid Haskell remains an explicit optional theorem lane until Cabal/LH are
  provisioned in CI by a later ADR.

---

## Law Engine Verdict

```
Engine:       law-engine.pl v2.0 (ADR-200 Protocol)
Agent:        builder
Trust:        medium
Gate:         npm run verify
Schedule:     16 7 * * *

VERDICT:      EVIDENCE
SEAL:         adr-301-daily-production-tick — law-engine v2.0
```
