# ABIogenesis 4.6 RC5 Practical Tether For 5.0

- status: current-tree gap analysis
- change class: no product reprice; delivery sequencing correction
- 4.6 basis: `v4.6.0-rc.5`, tag commit `8d43dc8968e3df16029e6201680a0301eda035f1`
- downstream basis: odd_glc `v0.1.1-rc.3`, tag commit `181732349cb452b3c8b603bd487787a928983864`
- 5.0 basis: `232f7b2d34e765d743c885782d6305a445c96118` plus the current uncommitted integration wave

## Ruling

Use the released 4.6/GLC pair as a behavioral tether, not as a source branch to
merge back into 5.0. The first 5.0 delivery gate is replacement parity for one
installed Hello World graph overlay through the new public contract. Consensus,
F_H continuation, and the three-workspace matrix extend that same path after it
is lawful; they do not gate discovery of whether the root execution path works.

This does not narrow the accepted 5.0 product. It orders it around a practical
product proof.

## Immutable Baseline

| Surface | Verified baseline |
|---|---|
| ABIogenesis product | `@abiogenesis/typescript-tenant@4.6.0-rc.5`; clean candidate `bab609ab353304324b939a4528371603eef0a05d`; tarball SHA-256 `d9c99382f2c5b787ebe48ce72c320616baeac9187863078332df18c0036853ea` |
| ABIogenesis qualification | release manifest is clean, build and lint pass, semantic suite `1435/1435`, packed snapshot checksums pass |
| Downstream product | `@odd-glc/route-one-typescript@0.1.1-rc.3`; clean candidate `06c593ec53a2378a48beda4e788502128f16276e`; tarball SHA-256 `579e11e336af044f549a9ac20a37db68499595f306a49edc0e2cb07bb0c4f583` |
| Downstream utility | one reusable graph overlay and typed result contract complete six live Claude Hello Worlds: CLI Basic, JS tenant, JS SDLC, Rust CLI, Rust service, and Parallel JS |
| Runtime ownership | M04 admits and forwards; M03 owns `start -> iterate`, plugin resolution, traversal, events, replay, and continuation |
| Defensive boundary | malformed GTL and malformed/incomplete/contradictory F_P output; trusted single-developer desktop |

The 4.6 public spelling is not the 5.0 target spelling. It publishes
`abiogenesis-ts`, `genesis-ts`, and `abg.install`, not `abg.cli`. The tether is
installed behavior and authority ownership, not identical command syntax.

## Gap Matrix

| Capability | 4.6 RC5 reality | Current 5.0 reality | Gap to practical 5.0 RC |
|---|---|---|---|
| Packed product | Immutable clean-source tarball, manifest, checksums, and source-blind downstream use | `5.0.0-dev.0`; packed T-276 harness exists only in the dirty integration wave | Produce one checkpointed packed candidate and rerun the same thread without source/private fallbacks |
| GTL/C language | Seven constructors are authorable; semantic compiler reports unrealized terms honestly | Seven-term runtime, HOF, retry, recurse, T-267 conservation, and T-271 complete-C interpretation are implemented and focused-green | Preserve these lower atoms; do not replace them during public integration |
| Root traversal | M04 forwards one admitted start to the M03 engine root | M04 SDK manually sequences selection, direct execution, post-action evaluation, and disposition | Delete the SDK controller and enter the existing M03 `runEngineStartAsync -> runEngineIterate*` root |
| Implementation authority | Declared plugin selection is admitted in M03 before invocation | Core plugin-selection code remains valid, but One Surface publishes no plugin refs and accepts inline callbacks | Resolve stage/operator implementations from the admitted GTL program and governed plugin catalog; no caller callbacks |
| GraphFunction use | Installed GraphFunctions run through the ABG engine; odd_glc proves six graph-overlay consumers | T-276 contains a real Hello GraphFunction/overlay, but its current green-looking path uses the invalid controller | Run that same fixture through the existing ABG root and one T-271 traversal/C-call spine |
| Public contract | Small `gen-start`/`gen-gaps` surface is useful but not the accepted 5.0 product | Prime 19-operation definition family exists; only ten handlers are connected; old and new families are both exported | First connect the five-operation utility spine, then complete all 19; switch atomically and remove every legacy identity |
| Event/replay truth | One engine emission/replay path supports installed runs | Richer Event Calculus exists, but direct execution emits a separate unparented lifecycle prelude | Public admission must causally parent basis, graph call, frame, vector, result, assessment, and closure in the canonical M03 stream |
| F_P result truth | RC5 transport plus GLC RC3 typed producer result rejects malformed output and keeps stdout provenance-only | Strict F_P admission is stronger; replay-owned result assessment repair is present but uncheckpointed | Preserve target `B` and ResultArtifact as distinct carriers; derive assessment from exact replay truth |
| CLI/SDK | Installed binary path is proven; no `abg.cli` claim | `abg.cli` and SDK skeleton exist | CLI/SDK may parse, admit, transport, and render only; no selection, traversal, retry, continuation, or closure authority |
| Continuation/F_H | Limited predecessor controls; not the full 5.0 interactive contract | Typed F_H carriers and partial continuation substrate exist; public end-to-end path is open | Extend the lawful Hello spine through `interaction.respond -> run.continue` after converged parity |
| Consensus | Explicitly excluded from 4.6 | Pure GTL body and generic runtime atoms exist; installed product publication/execution is open | Invoke the stdlib GraphFunction through the same proven public/root path; no Consensus-specific engine branch |
| Release | Exact RC tag and immutable snapshot exist | No exact 5.0 candidate, RC, or installed qualification exists | Freeze only after installed Hello, Consensus, F_H, retained surfaces, and self-conformance are green |

## Immediate Replacement-Parity Gate

```text
packed 5.0 candidate
-> clean temporary install
-> abg.cli workspace.create
-> workspace.bind
-> project.read
-> catalog.view
-> catalog.apply one Hello overlay
-> run.invoke one published Hello GraphFunction
-> AF13 exact selection
-> AF14 admitted target/application/basis
-> existing M03 start/iterate root
-> declared plugin/handler resolution
-> one T271 traversal and C-call spine
-> causally connected canonical events
-> replay-derived result
-> result.assess
-> project.read
-> typed CLI outcome
```

This gate must use the current T-276 packed driver. It may not use direct module
imports, the source worktree, an alternate runner, a mocked catalog, fixture-
authored success, or stdout as result truth.

## Course-Correction Boundary

Preserve:

- GTL authoring, raw admission, semantic compilation, and seven-term algebra;
- AF09/AF10 catalog admission and immutable application authority;
- AF13 selection and AF14 target/intent admission;
- T-267 compilation/conservation and T-271 complete-C interpretation;
- the released M03 plugin-selection, engine-root, event, replay, and
  continuation machinery;
- the corrected Hello graph fixture and the single packed T-276 governor.

Replace or remove:

- M04 AF-stage orchestration and consequence routing;
- `one_surface_execution` as a top-level runner;
- inline One Surface implementation callbacks and empty plugin authority;
- lifecycle construction outside the canonical engine emission path;
- legacy operation exports, resolver maps, SDK carrier maps, and package
  subpaths;
- packed assertions that infer product result from logs or diagnostic excerpts.

Do not add another interpreter, controller, registry, event stream, lifecycle,
or proof harness. Reuse the released root and expose the new 5.0 program through
it.

## Delivery Sequence From The Tether

1. Restore the existing ABG root as sole traversal owner and prove installed
   Hello replacement parity.
2. Extend the same path to generic GraphFunction selection and truthful
   nonterminal results.
3. Add `interaction.respond -> run.continue` on the same replay basis.
4. Publish and invoke Consensus on that path for converge, recurse, and F_H.
5. Repeat across existing, alternate, and temporary workspaces.
6. Complete the remaining 19-operation owners and atomic legacy hard break.
7. Close retained DS-5 features, self-conformance, exact-candidate
   qualification, RC, clean-install qualification, and stable 5.0.

The first gate is the practical anchor. Failure stops forward feature work and
repairs the same path. Passing it does not close 5.0, but it proves that 5.0 is
again a working product rather than a collection of green components.
