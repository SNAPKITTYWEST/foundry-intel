# XML Handoff Envelope Protocol

Foundry agents communicate cross-repo work through XML prompt envelopes. An
envelope is a small, committed contract that tells the next agent what repo it
is entering, what work is required, what must not be claimed, and how to verify
the result.

The active Foundry Intel envelope is:

`docs/handoff/foundry-intel-agent-contract.xml`

The structural schema is:

`docs/protocols/xml-handoff-envelope.xsd`

## Envelope Rules

- One envelope describes one agent mission.
- The root element is `agent_contract`.
- The root must carry `id` and `version` attributes.
- The envelope must name the target repo and local path.
- The envelope must list required work as explicit `task` elements.
- The envelope must list boundaries as explicit `boundary` elements.
- The envelope must list validation commands as explicit `command` elements.
- The envelope must preserve git staging and dirty-worktree rules.
- Open mathematical cruxes must stay open unless new theorem evidence closes
  them.

## Required Sections

| Section | Purpose |
|---|---|
| `role` | Defines the incoming agent identity and operating posture. |
| `repo` | Names the GitHub repo, local path, branch, and known commit anchor. |
| `current_state` | Records what is already done and which files matter. |
| `mission` | Gives the top-level objective. |
| `required_work` | Lists concrete tasks the agent should execute. |
| `hard_boundaries` | Lists claims, files, or behaviors the agent must not violate. |
| `validation` | Lists local commands and failure-reporting rules. |
| `git_rules` | Lists staging, commit, and push rules. |

## Transport

Commit XML envelopes into the repo under `docs/handoff/`. A receiving agent must
read the newest relevant XML envelope before reading prose handoff notes.

Suggested file name:

`docs/handoff/<repo-or-mission>-agent-contract.xml`

## Local Check

```sh
npm run handoff:check
```

The local checker validates Foundry's restricted XML envelope profile without
adding external parser dependencies.

