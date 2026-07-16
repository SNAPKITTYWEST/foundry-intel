# Repository Freeze Policy

**Status:** `FROZEN`
**Mode:** `READ_ONLY_AUTONOMOUS`
**Governed by:** ADR-304

The repository is frozen against autonomous mutation. Scheduled jobs may verify,
harden ADR posture, and write ephemeral CI summaries. They must not commit,
push, comment, open issues, mutate Phase Mirror, or promote open cruxes.

## Operator Commands

```sh
npm run repo:freeze:guard
npm run adr:harden:daily
npm run verify
```

## Daily Hardening

The autonomous daily ADR hardening tick is:

```text
.github/workflows/adr-daily-hardening.yml
07:21 UTC daily
npm run adr:harden:daily
```

It uses `contents: read` permissions only. It verifies:

- Q(phi) ADR manifest posture
- connector contract
- XML handoff envelopes
- reverse-engineer tensor and INTERCAL LOC guard
- Gemini black-team defensive blocklist
- repo freeze policy
- Phase Mirror non-mutation and force-invoke gates
- ADR-301 tick summary

## Boundary

This freeze does not prevent explicit user-directed commits. It prevents
autonomous jobs and agent tooling from silently writing to the repository or
turning evidence checks into proof claims.
