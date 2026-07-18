# T-270/T-271 cursor-digest conservation self-review

## Scope

This checkpoint implements only the accepted conservation amendment in
`M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md`:

- copy the existing `CProgramExecutionCursor.cursorDigest` into the existing
  atom request basis;
- seal that exact value into the existing atom receipt;
- require exact cursor-ref and cursor-digest equality at replay admission.

No F_H checkpoint, event field, schema capability, public identity, registry,
store, or selector was added.

## Constructability correction

The first implementation exposed a latent replay-coordinate defect. The cursor
had been hashing the caller's whole replay set, including future receipts. A
fresh run therefore produced a different cursor digest from a replay of the
same locus. `invokeLeaf` now derives its replay basis only from the already
consumed replay receipts followed by receipts admitted during the current run.
That is the canonical predecessor prefix already owned by `ExecutionContext`;
it is not a new authority surface.

## Independent-review repair

Independent review found that the first prefix correction still selected the
global admitted-receipt list. A completed sibling `C.batch` task could therefore
change another task's cursor digest even though neither task is a causal
predecessor of the other. The current coordinator is serial, so delay reversal
cannot yet reorder completion, but changing only one sibling's admitted output
reproduced the authority leak. The same defect would become timing-dependent if
the coordinator later executes tasks concurrently.

The repair projects the current leaf's causal predecessors from the sealed
compiled-plan tree. Ordered sequence predecessors remain visible; sibling batch
tasks do not; and receipts from earlier coordinates of an enclosing retry remain
visible through the existing retry path. The selected causal receipt set is
ordered by its already-sealed receipt digest, so completion or replay-array order
cannot become cursor authority. No path, task, retry, or receipt identity is
authored a second time.

## Adversarial check

The focused proof covers fresh execution, partial replay, and a resealed receipt
whose cursor ref is unchanged but whose cursor digest is forged. The mutation
is rejected before any atom effect. A second differential uses two batch tasks
containing sequential leaves, reverses which task is delayed, changes only the
non-causal sibling output, and supplies that sibling's partial replay in reverse
order. The target task retains the same cursor digests. A three-stage causal
path also replays effect-free when its complete receipt array is reversed.
Receipt sealing includes the digest, so a raw post-seal mutation remains
invalid.

## Authority and Prime result

Authority sources before and after remain the compiled plan, current execution
cursor, admitted atom result, and sealed replay receipt. The amendment adds no
source of truth: one already-derived coordinate is conserved through one
existing carrier family. The predecessor-prefix helper is a projection of the
existing consumed/admitted receipt state and owns no identity or lifecycle.

## Verification

- `npm run build:host`: passed
- `npm run test:t271`: GTL 82/82, focused lane 59/59, packed proof 1/1
- `npm run test:t267`: focused lane 59/59, packed proof 1/1
- `git diff --check`: passed

Verdict: scoped implementation is lawful and ready for independent review.
