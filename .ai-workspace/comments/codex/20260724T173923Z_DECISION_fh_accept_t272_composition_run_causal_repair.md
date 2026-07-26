# F_H Decision - Accept T-272 Composition And Run-Causal Repair

## Authority

Direct human `F_H` instruction from Jim on 2026-07-25 Australia/Sydney:

> continue

Before proceeding, Codex stated that the exact-cut review of candidate
`686d18bf31eb0dd5881dea9e031eca2a47a128ea` was clean and that the instruction
would be recorded only as acceptance of that bounded repair, not as acceptance
of broader S03 semantics.

This is direct human authority recorded by Codex. It is not a proxy grant or an
agent-authored expansion of the instruction.

## Exact Subject

| Field | Value |
|---|---|
| implementation and design candidate | `686d18bf31eb0dd5881dea9e031eca2a47a128ea` |
| evidence checkpoint | `52f7c8e6b2ef1f9899f0b401ad27464ab513eb25` |
| complete M05 design SHA-256 | `d1be9081198d47f31e9b2de58451c7e73ec2ce6afee2505c5035635152f49cb0` |
| bounded M5 gate | `test:m5` `88/88` |
| retained root gate | `test:m4` `26/26` |
| external Product gate | `test:m5:external` `17/17` |
| package SHA-256 | `b215d75566e82cb2be701cc9fb3a083f05f559835afe83e6c695bcc2dde21ffe` |

## Decision

Accept the exact T-272 composition and run-causal authority repair. Release its
affected-design hold and continue within T-272 to the next consumer-visible
S03 slice:

```text
gap_stop
  -> replay-derived public read
  -> exact public re-entry
  -> convergence
```

## Boundaries

This decision accepts the Program-published four-authority construction
composition, exact observation and action-evaluation bases, admitted evaluation
fold, run-causal closure law, post-resume failure totalization, and their
installed mutations at the exact subject above.

It does not close `ABG5-S03`, accept future design or implementation bytes,
authorize a new public operation or ticket, or authorize a compiler, lowered
carrier, Public controller, alternate runtime, generic workflow engine, or
horizontal completion of the remaining conservation matrix.
