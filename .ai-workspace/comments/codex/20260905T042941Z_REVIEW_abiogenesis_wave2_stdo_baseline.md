# REVIEW: ABIogenesis Wave 2 STDO Baseline

**Author**: codex
**Date**: 2026-09-05T04:29:41Z
**Addresses**: T-287, Wave 2 baseline and active A5-F10 worksite repair
**Status**: Open — recommendation accepted for planning; B01-B07 remain open
**Source review completed**: 2026-09-05T03:30:58Z

## Product Frame

ABIogenesis 5.0 still selects the 16 families A5-F01 through A5-F11 and
A5-F13 through A5-F17. Wave 2 covers F01 exact Product/install/workspace/catalog,
F09 catalog semantics, F05 one Public contract authority, F06 thin SDK/CLI,
and bounded early F17 portability. The active worksite repair carries F10
event-sourced runtime truth. F12 and S04 remain planned 5.1 work.

[Product](../../../specification/PRODUCT.md),
[Intent](../../../specification/INTENT.md), and
[requirements](../../../specification/requirements/README.md) fix the outcome:
one source-independent installed consumer follows GTL meaning, direct HoG
traversal, exact owner effects, ABG admission, and fresh replay. GraphFunction
is the constructive carrier. Public parses, admits, transports, and projects;
it owns no alternate controller or runtime truth.

Product, Program, GraphFunction, lock, Catalog, and WorkspaceBinding are
immutable definition/basis carriers. Catalog views and declaration applications
are deterministic, eventless tool values. Physical workspace changes are
effects; their observations and receipts are evidence. Only the exact owner and
ABG admission make them runtime truth. Replay projects admitted truth and does
not manufacture it. A catalog's use of an exact existing prefix for readiness
does not confer a new event lifecycle on its deterministic construction.

The reviewed boundary excludes a rival Program, executor, Public controller,
private event writer, required process-local runtime authority, fabricated
closure, and installed Product mutation masquerading as worksite construction.
The mandatory native installed path is not qualified by a binding-only test,
schema census, typecheck, or historical artifact. odd_glc's release is not an
ABIogenesis 5.0 dependency.

## Summary And Disposition

The baseline is `HOLD`. The graph-native constructive path is materially
present, but the installed Public boundary, C0 post-publication failure truth,
C2 environment-independent validation, and current proof surface do not yet
support integrated Wave 2 acceptance.

The Executive priorities are P1 for B01-B03, P2 for B04-B06, and retained P3
for B07. The corresponding technical severities are S1, S2, and S3. No P0 is
supported by this review. Severity describes the technical defect; priority
records the Executive's planning disposition.

The user accepted the recommendation to repair this bounded baseline and
directed that it be saved and tracked. That accepts work-wave direction only.
It does not accept code, a design amendment, a candidate, an installed artifact,
or a release. [T-287](../../tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#current-baseline-selection-and-documentation-grant)
is the sole durable umbrella; [GOALS](../../../specification/GOALS.md#current-selection)
records completed W2-BL-DOCS and the bounded baseline plan. The Executive
accepted the documentation for accurate recording/tracking only; its write
grant is exhausted and no Writer activation is open. Four blocking streams
remain planned and not activated; B07 is retained deferred assurance.

## Snapshot And Governing Basis

The review evaluated the dirty source worktree in
`/Users/jim/src/apps/abiogenesis`, HEAD
`9eb0e92f81fea23a4bf6a2d7b74684d460e5b6be`. It did not evaluate a released
Product or accept the ambient dirty tree as a release artifact.

The 797 selected regular-file set had aggregate SHA-256
`a95cc774874af13c13be7e32c5d35a7b3a4859975f1957d351af6f3b91e65eb3`.
It was unchanged from 03:18:10Z through 03:30:58Z on 2026-09-05. The Executive
rechecked the same hash at 04:30:38Z before this documentation update.
Selection used sorted, deduplicated
`git ls-files --cached --others --exclude-standard`, restricted to
`specification/`, `build_tenants/abiogenesis/typescript/`, `AGENTS.md`,
`CLAUDE.md`, `stdo_abiogenesis.json`, and T-287. Existing regular files were
hashed individually; JSON `[path, sha256]` rows were hashed as one member set.
These coordinates identify the pre-documentation review snapshot.

The [Product Definition Overlay](../../../stdo_abiogenesis.json) selects
immutable STDO `v2.5.0-rc.4`. The Executive freshly verified that exact install:
manifest SHA-256
`4fa2556d0127bebce8f7184cc4a3cb708a175b2e40552c55cb211f2426d5049e`;
standards member-set SHA-256
`504db879867f60e46ed4dea60509d12056d10cdd8c3460dc94abf7bc56542656`.
The installed standards at
`/Users/jim/Library/Application Support/STDO/releases/v2.5.0-rc.4/standards`
supplied the method reads.

The governing evaluation context is the
[Project Reference-Frame Basis](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md)
and [realization constitution](../../../build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md)
5.3/5.3.1. Frames are evaluation perspectives, not runtime entities.
The exact installed DESIGN_MODULE_METHOD lines 75-280 require typed carriers,
explicit transforms, ingress admission, and effects at declared boundaries.
Its lines 770-820 require complete transformation admission and partial-
publication failure law. STDO ontology and Prime reasoning do not make each
file, export, endpoint, or function an independent semantic atom. Singularity
attaches to the complete decision relation.

Bounded review returns were conjoined by the Executive:

| Review context | Exact source coverage | Stable interval end |
|---|---|---|
| `/root/worksite_causality_review` | 593 files; `8a5df69b47ea7d77da90dfa8016b526002f8450b64f5900fcfd79f74f2641330` | 03:19:38Z-03:27:43Z |
| `/root/public_install_review` | 741 files; `0757b6805e017fa97633373075ab88f2f3192b2423daa6a336f28b55843d37d3` | unchanged through 03:29:48Z |
| `/root/command_runtime_review` | 17 named paths; `c6cbec4b89bd7f6c2746375228e50185173c947a28146865af5843d1f0dc54dc` | unchanged through 03:30:12Z |

Their affected claim evaluations were `falsified` by the counterexamples below;
none supplied whole-Product acceptance. This post publishes the completed
review evidence; the documentation Writer did not rerun its diagnostics.

## Architectural And Functional Assessment

The strongest implemented structure is C1's candidate-to-authority join,
followed by GTL C0 children and a reducer. The Worker supplies bytes; Product
carries authority. C1 copies full A and derives each C0 request's W coordinates
from its exact task. C0 is the physical mutation owner.

C3 preserves the 1/0/1 declaration shape: a nonterminal root F_D, a zero-binding
`C.batch(workflow.C(C1))` child composition, and the terminal reducer. Mixed
A/W/grant vectors refuse before branch dispatch. A declared ordered branch DAG
does not become a hidden scheduler.

C2 executes declared manifest commands at a physical shell boundary. It is not
an alternate graph scheduler. The source-result join in
`abg/execution_basis.ts:584` binds admitted C1-root or C3-reducer closure and
full A/W authority. Its task/launch/helper seams retain useful exact joins.
B05 concerns the ambient executable input to validation, not the mere presence
of imperative process execution at an effect boundary.

Current `abg/execution_basis.ts:449-511` and
`implementation/worksite_file_replace.ts:290-335` contain Program-owner
unity and unique-install checks. The older missing-owner-unity finding was
not reproduced. That is evidence for explicit reassessment, not full closure.
Overlapping checks alone do not establish rival semantic authority.

Catalog construction remains deterministic and eventless where declared.
The material gaps are at exact common admission, installed CLI routing,
reachable legacy Public composition, and preservation of physical-commit
evidence. Correctness repair should reuse existing owner and common-binding
surfaces. No whole-project reset or new controller is indicated.

## Findings

Source references below use paths relative to
`build_tenants/abiogenesis/typescript/code/src/`; test references use
`build_tenants/abiogenesis/typescript/test_env/tests/`. Line coordinates name
the review snapshot.

### B01 — Reachable Legacy Public Controller

**Priority P1; severity S1; workstream W2-BL-PUBLIC.**

`public/cli.ts:171-224` chooses between installed DefinitionCall transport and
legacy RootPublicInvocation. `public/index.ts:10-17` exports
`applyRootPublicInvocation`. In `public/operations.ts:887-956`, the install
path performs Product installation, ABG admission, mutation of
`context.prefix`, and Public outcome construction. Its operation switch
remains reachable at line 4021 onward.

That concrete path contradicts Product's thin Public boundary and
REQ-P-PUBLIC-CONTRACTS-010. Constitution 5.6.4, lines 2977-2985, explicitly
classifies `operations.ts` as a deletion input, never an accepted owner path.
The counterexample is reachable semantic orchestration through the legacy
export/CLI branch, independent of whether replacement bindings also exist.

This is retained migration debt. The review did not establish that the current
canonical-root patch introduced it. The bounded repair closes the replacement
path and retires legacy Public on one coherent subject. A new fallback or
controller would preserve the failed authority relation.

### B02 — Install/Catalog Binding Entry Omits Common Exact-Call Admission

**Priority P1; severity S1; workstream W2-BL-PUBLIC.**

`public/installed_definition_call_transport.ts:185,265` selects and invokes
the installed callable by definition key. The install entry at
`product/install_definition_bindings.ts:240` checks resources; the catalog
entry at `product/catalog_definition_bindings.ts:594` checks structure and
readiness. Neither consumes the common `admitExactDefinitionCall` boundary.
That shared boundary already exists at
`shared/definition_binding_mechanics.ts:337`; the static owner construction
surface exists at `shared/static_definition_bindings.ts:106`.

Wrong definition and invocation digests therefore are not consumed by the
selected common entry before owner work. The governing requirements are
REQ-P-PUBLIC-CONTRACTS-009/010 and constitution 5.6.2C.

The diagnostic supplied only invocation kind and definition key, with the
transport's required resource/acquisition control, through the exact transport
in memory. It reached a selected-owner sentinel. Execution stopped before the
production owner or effects. This establishes an ingress bypass, not a
successful unauthorized filesystem write.

Acceptance requires the full malformed-envelope matrix before owner/effect
entry, including wrong/missing/recomputed-crossed definition, invocation,
request, schema, and authority coordinates and digests. Reuse the existing
common exact-call owner boundary and prove valid calls reach the owner once.

### B03 — Lawful Eventless DefinitionCalls Cannot Enter The CLI Path

**Priority P1; severity S1; workstream W2-BL-PUBLIC.**

`public/installed_definition_call_transport.ts:125-130` requires
`resources.eventResource` when recognizing a DefinitionCall. The legal
verify, resolve, catalog-view, and declaration-apply resource contracts do not
contain that member; their closed shapes prohibit adding it.
`public/cli.ts:171` consequently sends those calls to its legacy parser.

The source diagnostic tested four legal eventless resource shapes: all four
candidate checks returned false. An event-bearing control returned true.
The lawful installed CLI path is thus unconstructable for those operations.
Direct native binding use is a workaround for local diagnosis, not CLI
qualification under F01/F05/F06/F09 or REQ-P-PUBLIC-CONTRACTS-009/010.

Use operation-indexed resource routing and conserve each exact effect class.
Do not fabricate an event resource for a pure operation. Acceptance must run
through the actual installed CLI, including both eventless legal shapes and
event-bearing controls, rather than invoking bindings directly.

### B04 — C0 Erases Physical-Commit Evidence On Later Failure

**Priority P2; severity S2; workstream W2-BL-C0.**

`product/worksite_operations.ts:745` publishes an absent target with
`link`. A staging-unlink error at lines 751-757 may delete the published
target; the outer catch at lines 803-808 reports failure "before commit".
A failed successor observation at lines 764-786 returns a plain refusal.
`implementation/worksite_file_replace.ts:460-500` also drops an existing
receipt on post-inventory or re-observation failure.
`abg/c_call_outcome.ts:698` derives specialized worksite evidence only for
success.

The exact function was transpiled in memory, with pre-effect and filesystem
helpers mocked. After successful link publication, injected successor-read EIO
left the simulated target published with no receipt. Injected staging-unlink
EIO caused publication, target unlink, unrecorded compensation, and staging
residue. There were no real filesystem effects and no adversarial namespace
race. These are post-publication failure counterexamples, not the C0
syscall-window P3.

F10 and the Product runtime contract require truthful effect/evidence/ABG/replay
causality. DESIGN_MODULE_METHOD 770-820 requires a complete partial-publication
law. The [C0 candidate](../../../build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md)
lines 256-270 leave intervening cleanup/observation/inventory failures
incomplete, while lines 296-307 explicitly preserve receipt and unadmitted
physical commit after failed append. That design gap comes before retaining a
code repair.

Re-enter design to preserve known commit, receipt, compensation, and residue
facts at each boundary. Do not fabricate O1 or infer rollback. Then prove
cleanup, successor observation, inventory, re-observation, and append failures
through physical evidence and fresh replay on the exact repaired subject.

### B05 — C2 Historical Carrier Validation Depends On process.execPath

**Priority P2; severity S2; workstream W2-BL-C2.**

`product/worksite_command_execution.ts:473-505` constructs the helper command
from ambient `process.execPath` and validates a recorded helper plan by
reconstructing that plan. The observation guard calls it at line 1676;
`product/builtin_semantics.ts:243` delegates observation admission to that
guard.

The pure current-source diagnostic used actual constructors. Fixed task, plan,
and observation were initially valid. Changing only `process.execPath` to
`/virtual/second-node/bin/node` left task validity true but made plan and
observation validity false. Restoring the path restored both to true. The
carrier bytes remained unchanged.

Product's immutable evidence and fresh-process boundary, the accepted
[C2 design](../../../build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md)
claim of retained observation/replay truth, and the functional discipline of
closed explicit inputs prohibit ambient process state from silently becoming
historical validity authority.

The diagnostic did not perform ABG admission or demonstrate failure of the
core replay loop. `abg/replay.ts:527` projects the stored result value.
The finding is narrower: the current Product carrier validator changes its
judgment solely with the process executable.

Resolve an explicit stable executable basis and historical-validation law.
Re-enter design if the carrier/contract decision is missing, then realize and
prove capture-at-A/validate-at-B, exact owner admission, and fresh replay.
Retain task/launch/helper joins and the separate same-user substitution P3.

### B06 — Current Proof Surface Does Not Qualify The Baseline

**Priority P2; severity S2; workstream W2-BL-PROOF.**

The Executive's `tsc --noEmit --incremental false` check passed. The existing
`m5-c-algebra-validation.test.mjs` suite ran through an in-memory TypeScript
module hook over 150 current source modules: 21 tests, 5 passed, 16 failed.

Its helper at line 86 passes `publication` and omits the current
`programPublication`, `declarationBasisDigest`, evaluators, and rules
required by `validator/validation.ts:466,665`. The mismatch is already present
at HEAD. These are not 16 independently established engine bugs or proof of a
canonical-root patch regression.

The proof reach also differs from the Product claim.
`t287-w2-05-install-catalog-owner-chain.test.mjs:216` invokes bindings
directly and line 71 constructs grant coordinates. It cannot prove CLI
routing or common ingress admission. Root fixtures such as
`t287-worksite-file-replace-owner.test.mjs:318` still use `productRoot`
for authored targets, consistent with unfinished pre-baseline Stage 2 work.

Product's source-blind native root outcome, distinct-root evidence, and the
constitution Proof frame require current causal witnesses. Repair the bounded
fixtures against the fixed contracts, then run the real installed consumer and
root-separation path after accepted Public/C0/C2 source exists. Typecheck and
binding-only tests cannot replace those witnesses. No package or live run is
authorized by this documentation selection.

### B07 — C1 Response Schema Does Not Match Accepted Exact-Vector Design

**Priority P3; severity S3; capsule W2-BL-C1-P3.**

The accepted [C1 design](../../../build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md)
lines 245/342 requires exact vector cardinality and ordinal target refs.
`product/worksite_construction.ts:714-752` instead emits `minItems: 1`,
a shared target enum, and no exact maximum or order. The fake transport in
`t287-worksite-construction.test.mjs:51` rejects tuple/exact-cardinality
schema forms.

Pure raw-validator checks accepted [A,B] and refused missing, reversed,
duplicate, and extra rows before effects. The mismatch did not demonstrate
an authority escape; it makes the accepted schema promise stronger than the
real supported transport constraint.

Reconcile the design promise with the supported transport subset, or supply a
supported exact schema while retaining raw admission. T-287 records the stable
capsule, Design Component/Proof owner, exact evidence, no-block rationale,
design-reframe trigger, next C1 schema/transport or baseline-assurance review,
closure falsifier, and acceptance evidence. Its status is deferred, not lost.

## Retained Nonclaims And Review Limits

The two old P3 nonclaims remain distinct and retain their existing disposition:

- C0 does not prevent ungoverned external or same-user target/parent namespace
  mutation after final pre-effect validation and before the publication syscall.
  Atomic namespace publication is not expected-inode CAS. B04 concerns later
  failure evidence and neither reopens nor closes this syscall-window P3.
- C2 does not pre-effect authenticate a fully recomputed coherent same-user
  replacement of task, launch, and derived sibling coordinates. Later
  exactExchange refusal does not undo earlier arbitrary shell effects.
  B05 concerns ambient executable validation and neither reopens nor closes
  this substitution P3.

The baseline did not build, pack, install, publish, run a live model, run
odd_glc, qualify a release, or accept an artifact. In-memory diagnostics stopped
at their stated causal boundaries. No real unauthorized installation,
filesystem mutation, ABG admission, or replay-loop failure is inferred beyond
the stated evidence. The old owner-unity finding remains explicitly
unreproduced and awaiting reassessment, not silently closed. C0 remains an
unaccepted candidate; accepted C1/C2 design identities and accepted predecessor
C3 behavior are conserved.

## Recommended Action And Next Decision

Keep the fixed 16-feature Product and repair the bounded baseline. Treat
B01-B03 as one Public family: exact common admission, correct resource routing,
and retirement of reachable legacy semantics must close together. Complete C0
post-publication failure design before implementation. Resolve C2's explicit
basis decision at its smallest lawful owner boundary.

Proof may prepare static fixture changes against already fixed contracts once
separately activated. Final installed evidence depends on accepted exact
Public/C0/C2 source. The next decision is the smallest dependency-ready bounded
Writer activation under those existing authorities, followed by the applicable
independent review. It is not a wholesale reset, all-later-Wave gate, odd_glc
release gate, or automatic owner-unity repair.

W2-BL-DOCS is completed. T-287 records its exact preimages, three-path scope,
checks, Executive acceptance for accurate documentation/tracking only, and
exhausted write grant. The authority is conversation direction; no runtime
admission receipt is invented. No Writer or repair activation is open. The
Executive retains every later work selection.

## Documentation Return Evidence

The Executive accepted the exact three-path documentation subject after
scoped whitespace, link-target, finding-coverage, current-selection, and
historical-identity preservation checks. T-287 identifies the reviewed
pre-finalization hashes; those are not the identities of this finalization. All 46 pre-existing SHA-256 identities
across GOALS and T-287 are retained. No other source, design, test, package,
installed Product, commentary, or Git bytes are selected by this operation.

The Executive independently confirmed that all 2,423 pre-existing outside-grant
paths were unchanged. One unrelated concurrent new comment was left untouched;
excluding that addition reproduced the original protected digest. HEAD was
unchanged. This finalization records completion and grant exhaustion only;
it does not validate B01-B07 repairs or initiate another review cycle. Wave 2
and M5 closure remain withheld; four repair streams stay planned and B07 stays
deferred.
