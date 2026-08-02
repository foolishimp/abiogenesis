# T-287 Wave 1 First Run HoldsAt Final Correction Transition

Status: frozen worker correction subject for independent assessment. This post
is commentary evidence. It does not accept the slice, `A5-F10`, Phase 1, Wave
1, or any Product outcome.

Transition time: `2026-08-02T07:42:39Z`

## Re-entry And Supersession

The correction re-entered at `realization_refactor`. Run lifecycle law, Product
shape, requirements, and ratified design remained fixed.

The first correction's leaf-failure topology was rejected. Its claim that an
admitted leaf failure should emit `runtime_failure_observed` and no
`run_stopped` is superseded by this transition. The accepted existing relation
is:

```text
admitted failure result
-> admitted blocked judgment
-> declared failed traversal route
-> run_stopped(disposition = failed)
-> HoG/Public failed completion
```

No new event kind, schema, authority surface, or GTL relation was added.
`runtime_failure_observed` remains reserved for genuine admission or closure
failure while the exact Run is active.

Both prior frozen posts remain unchanged:

```text
.ai-workspace/comments/codex/20260802T042647Z_IMPLEMENTATION_t287_wave1_first_holdsat.md
blob: ec2561778df774ca7374fd6941a7f24a8d64e454

.ai-workspace/comments/codex/20260802T061946Z_IMPLEMENTATION_t287_wave1_first_holdsat_correction.md
blob: a51da44e291973af62f1e8d1db41e90ddb865613
```

## Exact Corrected Subject

```text
repository: /Users/jim/src/apps/abiogenesis-5-root-build
branch: codex/t287-wave1
HEAD: c0859be7fb0c779bf8a95be5b5b3c19e06c046c9
commit created: no
whole tracked worktree diff object: b11a246992d8afc82256342cd5c7d9c1b82aa568
authorized tracked implementation/proof diff object: 34cd68426836644c889ead1d1ae26bf38d244415
event_prefix.ts blob: 07ba16653d770c0a417d8cfb9f094b1d399cf384
m5-event-calculus-runtime.test.mjs blob: e41d55567d14e53ca0afd99155d566879fbb2705
candidate-basis fixture blob: 4fd710dcdec276a554cdcc10a2e0d1d11882338e
R10 event proof blob: 4bd26a233ef91816a357621c6b55e75760270702
HoG execute blob: 50a5f18e7047e098478d57f7927861645137f267
HoG graph execute blob: 9b6747de5ce853405391b9208abfb432edc420ba
ABG traversal route blob: 90560a71f7becbfc37a9f28d7dd9b6bd07b0d553
HoG traversal route blob: 3d56c3fa6fe35e465208fc2704cb1296e229912a
```

The whole tracked identity includes preserved Product-control edits. The
authorized tracked identity binds the A5-F10 implementation, failure-route
correction, migrated tests and falsifiers, derived candidate fixture, and
deterministically regenerated R10 proof family. The two untracked
implementation files are bound separately above.

## Preserved A5-F10 Core

The nominal validated immutable prefix, typed closed Event Calculus,
deterministic Unicode code-unit ordering, replay and runtime-failure
`HoldsAt(run_active(...))` guards, typed standing-falsifier migrations,
AX-F08 held-S repair, and deterministic proof generation remain selected.

The Public catch remains the original closed-or-failed guard. It was not
widened to an active-only compatibility controller.

## Final Failure Topology

### Exact failed route

HoG proposes the already-declared `failed` route only from the exact
materialized graph, source cursor, opened CCall, admitted failure result,
admitted blocked judgment, transition contract, and replay digest. ABG admits
that route only after re-authenticating the same result and judgment events.
The route is caused by the exact judgment event.

For ordinary leaf failures, route admission appends one existing
`run_stopped` event in the same transaction. Its disposition is `failed`; its
sole cause is the admitted failed route; its reason is the admitted judgment
reason. Replay projects that stop as runtime status `failed`. HoG returns the
failed completion through transparent workflow and recursion boundaries
without trying to fold or append another terminal fact. Public therefore
projects `failed`, not `refused`.

Malformed attributed output, missing output, transport timeout, transport
nonzero exit, and output after the timeout boundary all follow this relation.
None emits `runtime_failure_observed` or `run_closed`.

### Semantic rejection

Semantic rejection remains the existing blocked route and
`run_stopped(disposition = blocked)` relation. It is not converted into a
failed route or runtime failure.

### Declared fan-out partial stop

The original deterministic fan-out fixture and Product judgment design are
restored. Its deliberate implementation exception is admitted as a failed
element route without prematurely terminalizing the Run. The existing child
foldback accepts that exact failed completion, and the declared fan-out
relation admits one `partial_stop` followed by its existing blocked route and
one `run_stopped`. No reducer starts.

This is the sole narrow completion-disposition correction. Probabilistic
transport and malformed-result failures, including failures inside a fan-out
batch, do not take this exception and terminalize as `failed`.

## Deterministic Candidate And Proof

The candidate fixture was regenerated by the repository script and reproduced
the same final values after the final source build:

```text
artifactDigest: sha256:dacd7a4f51e9a2727faea71b81182805bf2084db4c9e4b490bc84ff0e926d371
productContentDigest: sha256:12bfd15eacbf4800d135ec01f44dc3166ed391eea1496bd2f8ec76e2b3bf620f
manifestDigest: sha256:c34c9fdd521c97d137f9957a53d8de029354cccf1318029b5a1ae70842105d5d
```

The R10 proof family was regenerated only by its deterministic installed CLI
test. No proof file was hand edited.

## Verification Results

| Command or lane | Result |
|---|---|
| `npm run build` | pass |
| focused Event Calculus | pass, 5/5 |
| corrected Consensus failure cases | pass, 5/5 |
| focused fan-out | pass, 2/2 |
| focused recursion and retry | pass, 6/6 |
| deterministic R10 installed CLI proof | pass, 1/1 |
| standing runtime falsifiers | pass: AX-F04 red, AX-F06 red, AX-F07 green, AX-F08 red, AX-F09 red |
| `npm run test:m5` | pass, 186/186 |
| `git diff --check` | pass |

The final full M5 run completed in `1515370.260792ms` with zero failures,
cancelled tests, skips, or todos.

## Self-review Verdicts

- Design: not reopened. The implementation selects an existing declared route,
  result, judgment, stop, replay, and Public projection relation.
- Authority: pass. Product owns result and judgment meaning; HoG proposes the
  exact declared route; ABG authenticates and admits runtime truth; replay and
  Public project it.
- Terminal ordering: pass. Each corrected ordinary failure has one failed
  route, one failed `run_stopped`, and no later runtime failure.
- Semantic rejection: pass. Blocked truth remains blocked.
- Fan-out: pass. The original fixture and partial-stop law are preserved through
  one narrow failed-child completion foldback.
- A5-F10: pass. The nominal prefix and typed `HoldsAt` dependency cone remain
  intact.
- Proof: pass. Focused, standing-falsifier, deterministic R10, and full M5
  evidence are green on the exact corrected source.
- Advancement: held for independent assessment.

## Assessor Disposition

Pending /root independent review.
