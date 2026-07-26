# T-281 Native Definition-Key Repair Self-Review

**Disposition**: bounded design repair complete; candidate pending independent
re-review. P1 implementation and P2 publication remain prohibited.

## Basis

- reviewed exact candidate commit:
  `fc1a39a58e34f04f8dc103dc785b90740176234a`
- repair base after separately committed owner-contract inputs:
  `253a27b39e9a71b11208050db739b6f3f11541c4`
- rejected P1 design digest:
  `f4228920cbf91152be569604e9fa7586903feb7b92ef81b456457a3ea2252c8b`
- repaired candidate digest:
  `3cf2bfb274c27d553d9863353af2e8b3c4d177311042b7e9dd324b9f51e45d18`
- unchanged target: 19 operations, 35 non-read variants, 27
  `project.read` cases, and 62 definition keys

## Rejection And Repair

The rejected design used an object-valued `DefinitionKey` union as a mapped
property key. TypeScript reports TS2322 because a mapped property key must be a
string, number, or symbol. It also instantiated resolved and missing rows over
the whole `DefinitionKey` union without distribution. TypeScript therefore
accepted an operation paired with another operation's variant and a gap row
whose outer definition key differed from its missing-slot key.

The repair keeps the one authoritative family as a nested
operation-to-own-member object. Its operation and member keys are the already
accepted string discriminants. A flat `DefinitionKey` union derives
distributively from that relation. Resolved and missing rows also distribute
over one exact key and travel only in readonly discriminated collections.
Exact-set admission proves same-key slot conservation, uniqueness, 35/27/62
cardinality, and absence of extra or legacy members before the private family
can admit.

No serialized key, selector registry, parallel roster, public operation,
schema, handler, runtime path, controller, alias, or compatibility surface was
added. Owner-native schema authority, the M03-to-M04 import fence, private P1,
and the atomic P2 hard break are unchanged.

The TypeScript witness admits a valid local operation/member key and rejects
both a foreign variant and a foreign slot under `@ts-expect-error`; the witness
compiles with zero diagnostics. The rejected object-key formulation separately
reproduces TS2322, and the rejected non-distributive gap formulation compiles a
cross-key counterexample.

## T-274A Truth

The reconciliation receipt previously said T-274A closure truth was preserved.
The exact tree instead has a green T-274A implementation (`11/11` focused
tests) awaiting independent review. The receipt and ticket now state that
truth. `ticket_consensus` remains a P1 gap until that review accepts the
coordinate and T-281 supplies the generic read wrapper.

## Gates

- TypeScript in-memory witness: zero diagnostics; both negative
  `@ts-expect-error` relations are consumed.
- static current-authority census: 19 operations, 35 non-read variants, 27
  unique read cases, 62 total keys; PRODUCT and requirement sets equal.
- Mermaid: 32 files, 96 diagrams, passed.
- Prime: eight accepted designs plus T-281 as the sole pending design, passed.
- DS governance: 19 tickets and 77 comment references, passed.
- `git diff --check`: passed.

Independent re-review remains required because mechanical shape checks do not
prove native correlation by themselves.
