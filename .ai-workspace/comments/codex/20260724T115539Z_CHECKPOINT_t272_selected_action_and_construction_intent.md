# T-272 Selected Action And Construction Intent Checkpoint

## Subject

Implementation commit:
`771e82e531d4b4bf91a3710d43525527dc3a4e3c`.

This checkpoint advances the existing independently packed developer Product
path. It does not close `ABG5-S03`.

## Product Outcome

The installed supervised Program now executes:

```text
synthesizeModel
  -> evalGap
  -> evaluateNext
  -> ABG ConstructionIntent admission
  -> F_H hold
  -> project.read
  -> interaction.respond
  -> run.continue
  -> evaluateAction
  -> replay-derived closure
```

The developer Product owns distinct model, gap, next-action, approval, and
action-evaluation contracts and values. `evaluateNext` emits one canonical
`NextActionProjection`. ABG admits it only when it selects the exact current
Program, GraphFunction, and successor F_H locus, then derives one
`ConstructionIntent` over the exact workspace, invocation, execution basis,
runtime scope, source result and judgment, and target cursor.

The existing `traversal_route_admitted` event carries the projection and
intent. `fh_interaction_opened` consumes that exact intent availability.
Replay-derived `project.read` renders the admitted projection; Public does not
select or recompute it. A Product-valid response naming another intent refuses
before response or closure truth is admitted.

## Exact Candidate

- artifact SHA-256:
  `3ed3142c0e7b29f78bd17de9c693619e936a2b3cca8b6fd98582b5b34453d845`
- Product content digest:
  `sha256:1f80f715f27b13f455576b78861e7b3f84cc0325c1ac395c66dace9ffe4da6e7`
- manifest digest:
  `sha256:9967bac4560781456bbbb47a83ba2923a1df330b2fc65b59edf48b397512d0cb`

Two independent `npm pack --ignore-scripts` runs reproduced the exact artifact
digest.

## Verification

- installed external Product: `4/4`
- full M5: `75/75`
- retained M4 and `ABI5-ROOT-001`: `26/26`
- live Claude F_P: `1/1`
- conservation projection: `44` pass, `18` explicit `todo`
- `git diff --check`: green
- no developer-Product identifier in ABIogenesis core
- no compiled plan, lowering carrier, public controller, second runtime, or
  new ticket

## Remaining Frontier

`ABG5-S03` remains open. The next bounded Product outcome is post-evidence
refresh through the same external Program, followed by its remaining
scenario-owned consequence, runtime-disposition, and public-control behavior.
The forty-row qualification matrix remains evidence, not the implementation
queue.
