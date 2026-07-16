# ADR-304: Repository Freeze and Autonomous ADR Hardening

**Status:** Accepted
**Date:** 2026-07-16
**Author:** SNAPKITTYWEST
**Governed by:** ADR-200, ADR-300, ADR-301, ADR-303
**Mode:** Read-only autonomous hardening

---

## Context

Foundry Intel is now the umbrella governance repo for THE SHARED PRIMORDIAL
FOUNDATION. The repo needs a frozen autonomous posture: agents and scheduled
jobs may verify, summarize, and harden ADR posture, but they must not silently
write commits, push branches, post comments, open issues, mutate Phase Mirror,
or promote open cruxes.

## Decision

Adopt `docs/governance/repo-freeze-policy.json` as the active repository freeze
policy.

Add `tools/formal/repo_freeze_guard.mjs` as the executable freeze gate. The
guard verifies:

- repo freeze policy status is `FROZEN`
- autonomous mode is `READ_ONLY_AUTONOMOUS`
- `npm run verify` includes `repo:freeze:guard`
- `npm run adr:harden:daily` includes the hardening gates
- workflow `contents` permission remains `read`
- no workflow or production tool path contains autonomous commit, push, PR
  comment, issue, or repository-write behavior

Add `.github/workflows/adr-daily-hardening.yml` as the autonomous daily ADR
hardening tick at `07:21 UTC`.

## Non-Mutating Rule

Autonomous hardening may:

- regenerate ADR manifest posture inside the CI workspace
- verify connector contracts
- verify XML handoff envelopes
- verify repo freeze, reverse-engineer tensor, black-team blocklist, and Phase
  Mirror gates
- write GitHub Actions job summaries

Autonomous hardening must not:

- commit
- push
- comment
- open issues
- mutate repository files persistently
- promote ADR-055 or ADR-062
- convert scanner output into Lean proof claims

## Production Gate

```sh
npm run repo:freeze:guard
npm run adr:harden:daily
npm run verify
```

## Consequences

The repo remains usable for explicit user-directed commits, but autonomous
agents now fail closed if they acquire write permissions or mutation paths.

---

## Law Engine Verdict

```
Engine:       law-engine.pl v2.0 (ADR-200 Protocol)
Agent:        sentinel
Trust:        sovereign
Gate:         npm run repo:freeze:guard
Schedule:     21 7 * * *

VERDICT:      EVIDENCE
SEAL:         adr-304-repo-freeze-autonomous-hardening — law-engine v2.0
```
