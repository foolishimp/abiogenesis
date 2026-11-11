# RC12 package B2a Return — recoverable child failure, generic runtime

Writer Return, commentary. Worktree `/private/tmp/abg-rc12-foldback-20261111`, branch
`claude/rc12-foldback`, base `62fd17271`. T = `build_tenants/abiogenesis/typescript`.
Committed: this Return only. All other work stays uncommitted in the worktree. Copies:
scratchpad `b2a-uncommitted.patch` and `t287-recursive-failure-foldback.test.mjs` under
`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/`.

## Verdict: stop

**Stop class.** A gap that predates this change needs a write outside the territory.

**What holds.** Declaration, form validation, admission of the `failed` foldback, parent
re-entry at attempt + 1 over the prior input, the bound stop, the undeclared path, the
parent-failure path and cold replay. None of the named falsifiers F1–F3 holds.

**Where it stops.** The fail-once Run reaches its terminal parent evaluation at attempt 3;
closure refuses (`runtime_basis_mismatch`) at the quiescence check `T/code/src/abg/closure.ts:542-549`
(`replay.ts:343-436`). Blockers: the frame-scoped `runtime_invocation_active` of the two
non-closed child frames, recursion child `root` and its workflow child `A`. The other held
fluents are the terminal step's own (`locus_active` of the last advance target, its judgment).
Only `frame_closed`, `runtime_failure_observed` or an interruption ends a frame probe
(`T/code/src/abg/calculus/axioms.ts:345-348, 366-369, 983-1001`); a stopped
`child_foldback_admitted` ends `frame_*` and `graph_call_active` only (`1178-1205`). `A` leaks
through the unchanged workflow failed foldback. Unreachable before: every failed child ended the Run.

## The member

`failedChildDiagnosticClassRefs`: optional on the `recurse` foldback; non-empty, duplicate-free
diagnostic class refs; never materialized when absent. Example:
`foldback: { mode: "rebind", binding: "$", requiresParentEvaluation: true, failedChildDiagnosticClassRefs: ["diagnostic://abiogenesis/worksite/native-work/transport_failure@5"] }`.

**Class read.** The failed child's judgment `reasonRef` is the class. For a retained JSON diagnostic, the class is its subject's `diagnosticClassRef`; this mirrors `runtime_failure.ts:202`. A non-canonical retained ref counts as undeclared.

**Requirement.** `REQ-L-GTL3-RECURSE-009` (drafted, uncommitted).

## Changes (uncommitted; +/− lines)

| File | +/− |
|---|---|
| `specification/requirements/gtl/REQ-L-GTL3-RECURSE.md` (P1, `-009`) | +2 |
| `specification/PRODUCT.md` (P2, exact sentence) | +2 |
| `T/design/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` (P3, D11 after D10) | +45 |
| `T/code/src/gtl/serialization_contracts.ts` | +1 |
| `T/code/src/gtl/graph_applications.ts` | +10 −1 |
| `T/code/src/validator/validation.ts` | +21 |
| `T/code/src/abg/graph_application.ts` | +51 −7 |
| `T/code/src/abg/traversal_route.ts` | +10 −3 |
| `T/code/src/abg/traversal_cursor.ts` | +5 −2 |
| `T/code/src/hog/recursion_lifecycle.ts` | +12 −7 |
| `T/test_env/tests/t287-recursive-failure-foldback.test.mjs` (new) | +210 |

Regenerated, uncommitted: `gtl-serialization.schema.json`, the language corpus (only `schema.contentDigest`, `c9ff3782…` → `f4a58c61…`), `capability-definition-graph.json`, `product-toolchain-manifest.json`.

## T1 Consumers of the disposition

| Owner | Reading | Change |
|---|---|---|
| `abg/graph_application.ts` (body check, route projection, recursive admission) | admits `failed` only for a declared class; projection takes `routeKinds`; a failed route needs `frame_failed` and no run stop | changed |
| `abg/traversal_route.ts` `recursionRouteCausation` advance | declared `failed` → target input = source cursor input; blocked branch untouched | changed |
| `abg/traversal_cursor.ts` cold ancestry (recursion advance) | failed fold → `current.inputRef/inputDigest` | changed |
| `hog/recursion_lifecycle.ts` `completeRecursionChildUsing` | declared → foldback; undeclared → existing `admitRuntimeFailure`, byte-identical | changed |
| `route_proposal.ts:1170`, `construction_continuation.ts:256`, `event_store.ts:3293`, `axioms.ts:1178`; workflow/fan-out readers (`c_call.ts`, `child_lifecycle.ts`, `worksite_input_provenance.ts` ×5, `fan_out_projection.ts`, `traversal_route.ts:4304`) | disposition-agnostic, already admit `failed`, or not recursion | none |
| `abg/closure.ts` + `replay.ts` quiescence + axioms probe end | **blocker**: failed child frame probe never ends | needs owner write |

## T2 Where the originating class is read

| Site | Source | Check |
|---|---|---|
| HoG `completeRecursionChildUsing` | `child.diagnosticRef` (= judgment `reasonRef`, enforced by `projectFailedRecursionChildTruth`) | `declaresFailedChildFoldback` |
| ABG foldback admission | child `c_call_judged.payload.reasonRef` | same, plus closure null |
| ABG route admission | `foldback.childReasonRef` | same |
| Lift chain (B1 Q1) | leaf `diagnosticRef` → workflow lift keeps `childReasonRef` → recursion boundary | observed: the fixture's declared leaf class was admitted at the recursion foldback |

## T3 Serializations and schemas

| Surface | Effect |
|---|---|
| `FOLDBACK_DECLARATION_SCHEMA` | `failedChildDiagnosticClassRefs: v.optional(v.pipe(refs, v.minLength(1)))` |
| `gtl-serialization.schema.json`, corpus digest | regenerated (uncommitted) |
| `owner_bindings/run_invocation.ts:351-367` | duplicate inline recurse foldback `strictObject`; refuses the member at Public module publication and catalog parsing; outside territory, unchanged |
| `child_foldback_admitted` payload | same keys; `childDisposition: "failed"` was already in its closed domain |

## T4 Changed identities and pins

| Identity | Absent member | Present member |
|---|---|---|
| foldbackRef, applicationRef | equal to base (`e7df59cd…`; fixture `bab45946…`, library `ac6f1ba5…`) | change |
| GraphFunction digest, canonical bytes | equal to base (fixture `b784f663…`/`0e991ec0…`, library `235f8c59…`/`ca78eb2f…`) | change |
| route `declarationDigest`, parent leaf `compositionRef` | unchanged | change |

How the base values were obtained: `git archive 62fd17271` was compiled in the scratchpad, and the same fixture and library were rerun against both builds.

## T5 Tests (`node --experimental-vm-modules --test --test-concurrency=1`, `TMPDIR=/private/tmp/abg-foldback-tmp`)

Counts are tests/pass/fail/skip.

| File | Base | After |
|---|---|---|
| `t287-recursive-registered-selection` (undeclared assertion ~147 unedited) | 7/6/0/1 | 7/6/0/1 |
| `m5-c-algebra-validation` | 22/19/0/3 | 22/19/0/3 |
| `t287-gtl-graph-law` | 9/9/0/0 | 9/9/0/0 |
| `t287-gtl-language-corpus` | 3/3/0/0 | 3/3/0/0 |
| `t287-gtl-serialization-publication` | 9/9/0/0 | 9/9/0/0 |
| `t287-runtime-failure-diagnostic` | 21/21/0/0 | 21/21/0/0 |

Not rerun after (base only): `t287-route-reconstruction` 13/8/**2**/3, `m5-event-calculus-runtime`
19/18/0/1, `t287-default-library` 37/34/0/3, `-fulfillment` 7/7/0/0, `-reviews` 7/7/0/0, and the
gated skips `t287-authenticated-owner-family`, `t287-generic-job-parent-foldback`.

**Pre-existing red**, confirmed alone at base, not repaired: `t287-route-reconstruction` `:539`
("the open store keeps the verified bodies…") and `:585` ("decodes at most once", `18 !== 22`).

**New file**, 6 tests: 5 pass, 1 fail. The four runtime cases come from the full-file run;
the two pure tests from a rerun after the E4 assertion-ordering fix, which touched only that test.
Pass: E4 pins and round trip; form validation; always-fail (two `failed` foldbacks, blocked
`bound-exhausted`, `run_stopped`, cold `blocked`; the cold re-entry check, attempt + 1 over the
source input, passes for both folds); undeclared (`runtime_failure_observed`, leaf diagnostic);
parent-fails (no child, no foldback). Warm and cold `run_replay` are equal in every scenario.
Fail: fail-once, the closure stop; its trace shows `failed` then `closed` foldbacks, parent
attempts 1, 2, 3, and no event kind outside the closed register.

**E4**: "a recurse foldback without failedChildDiagnosticClassRefs keeps its base bytes, refs and
definition digest". **E1**: build passes; `lint:imports`, `lint:calculus` at baseline.

## Repair options (Executive ruling)

- **(a) Foldback ends the probe.** A stopped-child `child_foldback_admitted` (blocked or failed) also terminates the child frame's probe scopes. This needs the `frameProbeScopes` history keyed by `childFrameId` in `axioms.ts`, and it changes the derived fluents of every existing log that holds a blocked or failed workflow foldback. It must cover both depths: a repair scoped to recursive foldback alone leaves `A` live.
- **(b) Quiescence treats the probe as historical.** Run quiescence counts a frame probe as historical once its frame has an admitted stopped foldback (`replay.ts`). Derived fluents are unchanged.
- **(c) A new lifecycle event.** Excluded by R5.

## Deviations

1. **No code, test or specification commit.** The evidence is not green, and REQ-009, the PRODUCT sentence and the D11 exit proof all assert a Run that closes.
2. **Re-entry input.** Per the ruling, the re-entry input is the source cursor's admitted input, not B1 route R's "parent's prior Result".
3. **E3 narrowed.** The broad suite is deferred to a green close.

## Notes for the library Writer

- Declare B1 Q1's opaque class `diagnostic://abiogenesis/worksite/native-work/transport_failure@5` on the executive's foldback; its application, foldback and definition digests then change.
- Public start needs `run_invocation.ts:351-367` to consume `FOLDBACK_DECLARATION_SCHEMA`.

## Residual risks

- A parent whose prior input came through a registered-selection route fails closed on re-entry (`advanced-result-basis-absent`); not the library executive's case.
- A fan-out partial-stop lift can carry a blocked reason other than the original diagnostic (reads as undeclared).
- The class extractor repeats the `runtime_failure.ts:202` reading; the fixture child uses a disclosed process-local counter.
