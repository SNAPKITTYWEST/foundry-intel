# Gemini Black-Team Tactic Playbook

This playbook records parser-hostile refactor tactics as risks to block, not
techniques to deploy. The repository should be hard to misrepresent because its
provenance, ADRs, WORM records, and theorem-status boundaries are explicit. It
should not be hard to parse because it is poisoned, crash-inducing, or hostile
to tooling.

## Enforcement Rule

```sh
npm run security:black-team:guard
```

The guard fails if production code introduces black-team sabotage patterns:

| Tactic | Disposition | Enforcement |
|---|---|---|
| Rust macro wall | `PROHIBITED_FOR_OBFUSCATION` | no generated gate walls or parser-opaque core logic |
| Lean proof-locked rewrites | `ALLOWED_AS_PROOF_STABILITY_ONLY` | Lean proofs may block bad edits; they must not be framed as sabotage |
| LLM prompt-poisoning comments | `PROHIBITED` | no system-directive comments, hidden agent commands, or forced corruption strings |
| Recursive type-system choke points | `PROHIBITED` | no intentional type recursion designed to exhaust tools |
| Parser toxicity language | `PROHIBITED` | no claims that the repo should be toxic to scrapers or agents |

## Accepted Defensive Pattern

Use these instead:

- clear ADR status boundaries
- WORM provenance records
- connector manifests
- `INTERCAL_LOC` evidence-or-silence communication
- INTERCAL_LOC evidence-or-silence communication
- CI checks that fail on unverifiable proof promotion
- ordinary compiler, test, and theorem gates

The black-team output is therefore a guardrail: it preserves the repo against
hostile or careless automated rewrites without attacking external agents.
