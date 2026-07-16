# Foundry Intel Agent Memory

This file is the persistent memory for incoming Codex, Claude, and other
agents. Read it before touching files.

## Repo Identity

- Local path: `C:\Users\jessi\veneer-deploy`
- GitHub repo: `SNAPKITTYWEST/foundry-intel-2026-07-11`
- Branch: `master`
- Role: Foundry Intel governance, connector, ADR, Q(phi), XML handoff,
  Datalog, TypeScript workspace, Liquid Haskell lane, WORM and BOB gate hub.

## Do Not Confuse With

- `C:\Users\jessi\foundry-f1`
  - Repo: `SNAPKITTYWEST/foundry-f1`
  - Role: C++/C/NASM runtime substrate, sorry-engine receiver, Claude
    operator handoff.
- `C:\Users\jessi\Desktop\bobs control repo\shadow-orchestrator`
  - Repo: `SNAPKITTYWEST/grisp-shadow-fleet`
  - Role: separate Shadow Orchestrator / RANSOM.WORM repo.

If the task says Foundry Intel, work in `C:\Users\jessi\veneer-deploy`.

## Active Big Picture

Foundry Intel is the intelligence and governance hub in the three-repo bridge:

```text
gkn-i4-e7-lean
  Lean theorem anchors and quantum latch
        |
        v
foundry-intel-2026-07-11
  ADR governance, Q(phi) classification, XML handoff, Datalog/TS gates,
  WORM memory, BOB evidence/silence, Liquid Haskell lane
        |
        v
foundry-f1
  native runtime/sorry-engine receiver and Claude-facing handoff
        |
        v
Foundry Intel ADR governance receives evidence back before claims become final.
```

## Must-Read Files

1. `README.md`
2. `AGENT_MEMORY.md`
3. `docs/agents/metadata-tour.md`
4. `docs/handoff/foundry-intel-agent-contract.xml`
5. `docs/bridge/foundry-connector.md`
6. `tools/foundry-connector/connector-manifest.json`
7. `docs/architecture/ADR-INDEX.md`
8. `docs/architecture/adr-q5-theorem-classification.md`

## Hard Boundaries

- ADR-055 remains `OPEN_CRUX`; do not claim RH is proved.
- ADR-062 remains `SILENCE_PENDING`; do not claim Sigma Kernel governance is
  closed without theorem evidence.
- Q(phi) weights are metadata classifications, not proof claims.
- Liquid Haskell refines runtime types; it does not supersede Lean proof
  authority.
- WORM means append-only evidence memory.
- XML envelopes are the agent communication protocol.
- Stage only files in scope. Do not revert unrelated dirty or untracked files.

## Production Gate

```sh
npm install
npm run verify
```

For docs/connector-only work, at minimum run:

```sh
npm run adr:q5:fallback
npm run connector:check
npm run handoff:check
```

## Current Known Local State

An untracked Lean file may be present:

```text
lean-substrate/src/Topology.lean
```

Do not delete or stage it unless the user explicitly asks for that file.
