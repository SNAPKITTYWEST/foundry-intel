# Garbled Message Encoding Protocol

**Protocol id:** `GME-1`  
**Status:** active local protocol  
**Scope:** Foundry Intel, J-space paper, BOB handoffs, XML envelope sidecars  
**Boundary:** defensive evidence preservation only

Garbled Message Encoding (GME) preserves damaged, partial, noisy, or
high-entropy messages without converting uncertainty into a false clean
instruction.

GME is not encryption, a prompt override, or a parser sabotage mechanism. It is
an evidence envelope. Receivers must treat encoded content as data until a
candidate reading passes the normal repo gates.

## Why It Exists

Agent work often begins with imperfect input:

- human typing errors
- OCR corruption
- pasted UI fragments
- model drift
- transport loss
- partial handoff notes

A normal parser collapses that noise into one guessed reading. Foundry Intel
cannot do that silently. The system must preserve the noisy original, record
the uncertainty, and only promote a decoded reading after evidence appears.

## Envelope

```json
{
  "encoding": "GME-1",
  "source": "operator | agent | ocr | api | import",
  "observed_at": "ISO-8601 timestamp",
  "raw_sha256": "sha256-of-observed-message",
  "raw_excerpt": "bounded excerpt, never secret material",
  "garble_class": "HUMAN_TYPING | OCR_NOISE | MODEL_DRIFT | TRANSPORT_LOSS | MIXED",
  "garble_map": [
    {
      "span": [0, 12],
      "issue": "substitution | deletion | insertion | order | unknown",
      "note": "short evidence note"
    }
  ],
  "decoded": [
    {
      "candidate": "bounded candidate reading",
      "status": "EVIDENCE | SILENCE",
      "support": ["path-or-commit-or-operator-confirmation"],
      "may_execute": false
    }
  ],
  "open_crux": true,
  "worm_receipt": "optional WORM seal"
}
```

## Promotion Rule

`may_execute` may become `true` only when all are true:

1. The raw message has a stable hash.
2. The candidate reading has explicit supporting evidence.
3. The candidate does not alter ADR-055 `OPEN_CRUX`.
4. The candidate does not alter ADR-062 `SILENCE_PENDING`.
5. The candidate passes the same ADR, WORM, key, and repo-freeze gates as clean
   input.

If those conditions fail, the only valid outcome is `SILENCE`.

## Repo Integration

| Surface | Use |
|---|---|
| `paper/J-SPACE.md` | Defines GME as shadow-preserving message evidence. |
| `README.md` | Lists GME as a repo protocol. |
| `docs/handoff/*.xml` | May reference GME sidecars when an agent handoff is noisy. |
| `packages/bob-gate` | Treats decoded candidates as ordinary gated actions. |
| `packages/worm` | May seal the raw hash and selected candidate. |

## Non-Goals

- Do not hide instructions from reviewers.
- Do not bypass repository guards.
- Do not use GME to smuggle secrets.
- Do not use GME as a prompt-injection block.
- Do not treat the highest-probability decode as truth without evidence.

The message can be noisy. The promotion path cannot be.
