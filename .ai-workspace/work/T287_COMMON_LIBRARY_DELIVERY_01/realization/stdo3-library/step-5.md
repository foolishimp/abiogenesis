# Step 5. Select family

Plan: `.ai-workspace/comments/claude/20261021T162409Z_PLAN_library_consolidation_pen.md`, step 5.
Executive: Claude Fable. Worker: Opus 5.5, xhigh, fresh context, Writer grant. No review at this step.

## Activation

**Role and outcome.** You are the Worker holding the Writer grant for step 5.
Outcome: `shared/select/` carries the whole `select` family of the design
(`resolveExactMatch` over an `ExactMatchSource`, `exactMatchCardinality`,
`onlyExactMatch`, `exactMatchOutcome`, `checkExactRecord`); every local `one`
helper is gone; every ABG reader that selects one event by predicate and then
projects or digest-checks it decides cardinality through the family; the
`product/exact_match.ts` re-export shim is gone. Change class:
`realization_refactor`: no selection site changes its admitted input set, its
multiplicity decision, its failure channel or its output. One commit on
`main`, no push.

**Subject and frame.** `/Users/jim/src/apps/abiogenesis`, branch `main`, head
= the step 4 commit in the plan's ledger row. Tenant root:
`build_tenants/abiogenesis/typescript`; source: `code/src`. Frames: `f-law`,
`f-checks`, `f-claim` from
`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`.
Design authority: `build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
§3 (carrier set: `Outcome`, `ExactMatch`, `ExactMatchSource`, `RecordCheck`,
`CheckedRecord`), §4.2 (`select`), §10.2 D2 (digest leg after projection),
§10.4 first row (declaration closure stays Product-owned), §10.5 P-SELECT,
P-RECORD and P-INGRESS. Read those, not the whole document. `shared/refusal.ts`
(step 2) supplies `Outcome`, `ok`, `refused`, `andThen`.

**Law that binds every migrated site** (design §4.2): selection preserves
every occurrence, predicate order and predicate exception; it has no early
exit, deduplication, default or first-match substitution. `ExactMatch<T>` is
the closed codomain `absent | one | many`; the library never returns
`T | null`. An owner maps `absent` and `many` into its own union exactly once
at its boundary (§3), so a reader that returns `null` today may keep
returning `null` at its boundary while the cardinality decision comes from
the family. The owner supplies `project` and `digest` of a `RecordCheck` as a
module constant per reader, never as a runtime argument (constitution
§5.6.2C). The digest leg runs after projection (D2).

**Census the Executive already made (at `97b1200bc`; re-verify cheaply and
complete it).**

- Local `one` helpers, ten, not the design's "2": `product/declaration_application.ts:83`
  (throws a catalog refusal code), `abg/project_read_ports.ts:223` (throws
  `TypeError`), and eight `T | null` variants: `abg/native_worksite_execution.ts:20`,
  `abg/c_call_outcome.ts:226`, `abg/worksite_construction_recovery.ts:47`,
  `abg/worksite_input_provenance.ts:40`, `abg/worksite_revision.ts:52`
  (takes a `{ filter() }` view, not an array), `abg/runtime_liveness.ts:42`,
  `abg/qualification_proof.ts:57`, `abg/native_work_reacquisition.ts:41`.
- `length === 1` sites: 213 in `code/src` (abg 123, product 32, gtl 27,
  implementation 16, validator 12, shared 1, owner_bindings 1, hog 1). The
  design migrates these "as touched"; this step touches `abg/` and the two
  helpers outside it, nothing in gtl, implementation, validator, hog or
  owner_bindings.
- Checked-record readers (select one event, project its payload, compare a
  digest): `abg/execution_basis.ts:1094` and `:1192` are two; the design's
  count is thirteen. Census the rest in `abg/` by that shape before touching
  any.
- `abg/` files by `length === 1` count: c_call 11, retry 11, execution_basis
  11, open_call 8, c_call_outcome 6, traversal_route 6, replay 6,
  traversal_cursor 5, qualification_proof 5, semantic_revision 5,
  project_read_ports 5, semantic_job 4, semantic_stage 4,
  instruction_assembly 4, fan_out_projection 4, then 15 files with 1 to 3.

**What changes.**

1. `shared/select/exact_match.ts` (moved there in step 2) gains
   `ExactMatchSource<T>` = `readonly T[] | Readonly<{ filter(predicate: (value: T) => boolean): readonly T[] }>`,
   and `resolveExactMatch` accepts it. Arrays already satisfy it; no
   behavior change. Add `exactMatchCardinality(length: number)`,
   `onlyExactMatch<T>(selected: readonly T[])`,
   `exactMatchOutcome<T>(match: ExactMatch<T>): Outcome<T>` (refusal
   `family: "select"`, reason `absent` or `many`, as `shared/refusal.ts`
   types it), and `checkExactRecord<E, P>(match, check)` with `RecordCheck`
   and `CheckedRecord` exactly as design §4.2 types them. Put the record
   check in `shared/select/exact_record.ts` and export both from
   `shared/select/index.ts`. Pure, frozen outputs, no I/O, no classes, no
   export takes `unknown` (P-INGRESS).
2. Retire the ten local `one` helpers. Each call site decides cardinality
   through `resolveExactMatch` or `onlyExactMatch` and keeps its own
   boundary mapping (`null`, the catalog refusal code, the `TypeError`)
   exactly as today. Where a helper's callers only ever test `!== null`,
   the reader may keep a one-line boundary adapter over the union inside
   its own module; the adapter is the owner's mapping, not a library
   export.
3. Migrate every checked-record reader your census finds to
   `checkExactRecord` with a module-constant `RecordCheck` per reader. Each
   reader maps `absent`, `many` and `invalid` to the refusal or `null` it
   returns today (P-RECORD: the execution-basis adapter maps `invalid` to
   its existing refusal). If a reader's check cannot be stated without a
   runtime-argument `project` or `digest`, leave that reader and name it in
   Return with the reason.
4. Migrate the remaining `abg/` sites of the exact shape
   `filter(p)` then `length === 1` then `[0]` (with `null`, a throw or a
   refusal otherwise) to `resolveExactMatch` or `onlyExactMatch`. Leave a
   `length === 1` that is not a selection (a count clause inside a composite
   condition, an arity check, `installs.length === 1 && rows.every(...)` at
   `execution_basis.ts:662` and its kin) unless `exactMatchCardinality`
   replaces it one for one; count both groups in Return.
5. Do not migrate a `find`, `[0]`, `some` or first-match site: changing
   first-match to exact is a behavior change outside this class. List each
   such site that reads admitted events in Return as a residual for the
   owner.
6. `product/declaration_closure.ts::locateRequired` keeps its Product-owned
   multiplicity decisions (`all.length === 0 → absent`; no eligible result
   → `missing_dependency`); use the family there only if the mapping is one
   for one, else leave it.
7. Delete `product/exact_match.ts` (the step 2 shim). Update any importer
   that still names it, including test import lines through `build/`.
8. Unit lane, one file: `test_env/tests/t287-select-family.test.mjs` over
   the built atoms. P-SELECT: cardinality for zero, one, two and duplicate
   matches, for an array source and for a `{ filter() }` view source;
   predicate order and a throwing predicate propagate; no deduplication.
   P-RECORD atoms: `checkExactRecord` yields `absent`, `many`, `one`,
   `invalid` with reason `record_projection` when `project` refuses, and
   `invalid` with reason `record_digest` on a digest mismatch; both
   malformed null-digest partitions (a non-record singleton; an unencodable
   record) yield `invalid`; the digest leg receives the projected value
   (D2). Under ten cases; no fixtures from disk.

**Grant.** Under `build_tenants/abiogenesis/typescript`: `code/src/shared/select/**`,
the `abg/` files your census names, `code/src/product/declaration_application.ts`,
`code/src/product/declaration_closure.ts` (rule 6 only),
`code/src/product/exact_match.ts` (delete), any importer of the deleted shim
(list each in Return), `test_env/tests/t287-select-family.test.mjs` (new),
existing test files' import lines only where the shim deletion requires, and
the build outputs the gate regenerates (`build/**`, `contracts/**/*.json`,
`product-toolchain-manifest.json`), committed with the source because the
tree tracks them. Plus this file's `## Return`. Nothing else: no design
text, no ticket, no GOALS, no `shared/` module outside `select/`, no file in
gtl, implementation, validator, hog or owner_bindings.

**Gate** (run in `build_tenants/abiogenesis/typescript`, in this order, all
must pass): `npm run build`; `npm run lint:imports`;
`node --test test_env/tests/t287-select-family.test.mjs`;
`npm run test:installed:language`. Record each command's exit code and wall
time in Return.

**Self-check before the commit:** (1) `grep -rn 'function one\b\|const one = \|function one<' code/src` returns nothing; (2) `test -e code/src/product/exact_match.ts` fails and `grep -rn "product/exact_match" code/src test_env` returns nothing; (3) no export of `code/src/shared/select/` takes `unknown`; (4) every `RecordCheck` passed to `checkExactRecord` is a module-level constant, none built inside a function body with runtime values; (5) the gate passed; (6) the census table in Return accounts for every `length === 1` in `abg/` at head: migrated, not a selection, or first-match residual.

**Return contract.** Stage by path (never `git add -A`), commit on `main`, no
push. Message first line `Step 5: select family; local one helpers and checked-record readers retired`,
short body with the counts, last line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
Append to this file:

```
## Return
- commit: <hash>
- atoms: <exports of shared/select/index.ts with signatures>
- one helpers retired: 10, <file per line with the boundary mapping kept>
- checked-record readers: <count found>, <file:line per line, migrated or left with reason>
- abg length === 1 census at head: migrated <n>; not a selection <n>; first-match residual <n> (<file:line per line>)
- declaration_closure: <used the family / left, one line>
- shim: deleted; importers updated: <path per line>
- gate: build <rc, s>; lint:imports <rc>; unit lane <rc, pass/fail>; test:installed:language <rc, s, pass/fail counts>
- self-check: 1..6 with result
- residuals: anything you could not do inside the grant, with the exact reason
- return route: this file
```

Final report to the Executive: at most eight lines.

**Stop contract.** Stop without committing and write the reason under
`## Return` if: (a) the gate fails after one bounded fix attempt; (b) a
migration you cannot make without changing a site's multiplicity decision,
failure channel or output, and the step's outcome cannot be met by leaving
that site and recording it; (c) `checkExactRecord` as typed in §4.2 cannot
express the execution-basis readers at `execution_basis.ts:1094` and
`:1192` without a signature change.

ACTION: execute step 5 as activated.

## Executive note (2026-10-22, after steps 2 and 3)

Steps 2 and 3 are in: `shared/refusal.ts` exports `ok`, `refused`, `andThen`
(not `then`); `shared/select/exact_match.ts` holds `resolveExactMatch` with
`product/exact_match.ts` as the shim you delete; `shared/admit/` holds
`isRecord` and `hasExactKeys`; the binding family lives in `public/binding/`.
`code/src` and `test_env` already have no reference to `product/exact_match`
except the shim itself. Three design documents still name the old path as a
realization coordinate; two are history (the library design §2 move list
and the constitution §16.14 record) and stay. The third joins your grant:
`design/M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
lines about 2170, 2174 and 2296 name `product/exact_match.ts`; change those
location strings to `shared/select/exact_match.ts`, nothing else in that
document. List the lines in Return.

## Return

- commit: the commit that carries this Return, first line `Step 5: select family; local one helpers and checked-record readers retired` (hash in the Worker's report).
- atoms (`shared/select/index.ts`):
  - `resolveExactMatch<T>(values: ExactMatchSource<T>, predicate: (value: T) => boolean): ExactMatch<T>`. It is now `onlyExactMatch(source.filter(predicate))`.
  - `exactMatchCardinality(length: number): "absent" | "one" | "many"`. A negative or non-integral length throws `RangeError`; that is a defect, not a refusal.
  - `onlyExactMatch<T>(selected: readonly T[]): ExactMatch<T>`.
  - `exactMatchOutcome<T>(match: ExactMatch<T>): Outcome<T>`. `absent` and `many` become `StructuralRefusal` with `stage: "select"`, `code` set to `absent` or `many`, `path: []` and `evidence: { matches: n }`. `shared/refusal.ts` names the fields `stage` and `code`, not `family` and `reason`.
  - `checkExactRecord<E, P>(match: ExactMatch<E>, check: RecordCheck<E, P>): CheckedRecord<E, P>`, in `exact_record.ts`.
  - Types: `ExactMatch`, `ExactMatchSource`, `RecordCheck`, `CheckedRecord`, as design §4.2 types them.
  - Every output is frozen.
  - Null-digest decision: with `digest: null`, the projected value must be a record (`isRecord`) that `admitJson` admits. Otherwise the result is `invalid` with reason `record_projection`. This covers both malformed partitions of §4.2. No migrated reader uses a null digest.
- one helpers retired: 13, not 10. The activation's census missed three, marked † below. The † helper in `worksite_command_forward` is written `const one=` with no spaces, so self-check 1's pattern does not match it; a wider grep (`\bone\s*=`) finds it. Each line gives the boundary mapping kept and, in brackets, the number of call sites and the atom they use.
  - `product/declaration_application.ts:83`: `exactOrFail` throws `CatalogApplicationConstructionError` with the call's refusal code and message [9; `onlyExactMatch`].
  - `abg/project_read_ports.ts:220`: `exactOrThrow` throws `TypeError("terminal projection requires one exact <label>")` [34; `onlyExactMatch`].
  - `abg/native_worksite_execution.ts:21`: `null` [6; `resolveExactMatch`].
  - `abg/c_call_outcome.ts:229` (a closure): `null` [5]. It is a checked-record reader; see reader 5.
  - `abg/worksite_construction_recovery.ts:47`: `null` [14; `resolveExactMatch`].
  - `abg/worksite_input_provenance.ts:38`: `null` [35; `resolveExactMatch` over `RuntimeEventScan`].
  - `abg/worksite_revision.ts:51`: `null` [15; `resolveExactMatch`, including `{ filter() }` sources].
  - `abg/runtime_liveness.ts:42`: `null` [10; `resolveExactMatch` over `RuntimeEventScan`].
  - `abg/qualification_proof.ts:58`: `null` [32; `onlyExactMatch`].
  - `abg/native_work_reacquisition.ts:42`: `null` [6; `resolveExactMatch`].
  - † `abg/construction_continuation.ts:42`: `null` [11; `onlyExactMatch`].
  - † `abg/native_work_effect.ts:63` (a closure): `null` [5]. It is a checked-record reader; see reader 6.
  - † `abg/worksite_command_forward.ts:32`: `null` [14; `resolveExactMatch`].
  - Owner adapters:
    - `exactOrNull` and `exactOrUndefined` are one-line maps over `ExactMatch`. Each module that needs one defines it privately. Neither is a library export.
    - `checkedEventOrNull` maps a `CheckedRecord` to its event or `null`. It is defined in `c_call_outcome` and `native_work_effect`.
- checked-record readers: 18 found, 10 migrated, 8 left.
  - Census shape: one runtime event is selected by an exact-cardinality decision, its payload is projected, and a digest of the projected value is compared.
  - A reader is migrated when its projection and its digest are stated by the event alone. Each migrated reader has one module-constant `RecordCheck` and maps `absent`, `many` and `invalid` to the `null` or `absent` it returned before.
  - Relocation from the activation: `execution_basis.ts:1094` and `:1192` at `97b1200bc` are `selectAdmittedConstructionAuthority` and `selectAdmittedImplementationResolution`. At head they are `:1084` and `:1185`, and `:1205` (`selectAdmittedInteractionContract`) is their twin. All three select rows from an admitted set. They read no event, project no payload and compare no digest, so all three are rule-4 migrations to `resolveExactMatch`.
  - The execution-basis checked-record readers are readers 1 to 3 below. `checkExactRecord` as typed expresses them without a signature change, so stop (c) does not apply.
  - Migrated (`file:line` at head):
    1. `abg/invocation_execution_truth.ts:619` `projectExactExecutionBasisAtPrefix`, the execution-basis adapter (P-RECORD), with `EXECUTION_BASIS_RECORD`.
       - The projection admits the raw input against `rawInputDigest` and builds the basis.
       - The digest leg compares the basis-body digest with `basisDigest`.
       - The ref and field checks still run after `one`, so `basisDigest.slice` still sees only a verified digest.
       - `invalid` maps to `null`, as before.
    2. `abg/execution_basis.ts:1286` `rehydrateAdmittedImplementationSetAtPrefix`, with `IMPLEMENTATION_SET_RECORD` (the set-body digest against `implementationSetDigest`).
       - After `one`, the reader registers the set and then calls `hasAdmittedImplementationSetAtPrefix`, in that order.
       - That public check is unchanged and still hashes the body, so this path now hashes the set body twice.
    3. `abg/execution_basis.ts:1337` `rehydrateAdmittedInteractionSetAtPrefix`, with `INTERACTION_SET_RECORD`. Same structure as reader 2.
    4. `abg/c_call_outcome.ts:161` `projectWorksiteBasisObservation`, the invocation-admission row, with `PAYLOAD_RECORD` (a record payload whose canonical digest is `payloadDigest`).
    5. `abg/c_call_outcome.ts:229-275` `projectWorksiteSelectedOccurrence`, five selections, with `PAYLOAD_RECORD`. The trailing five-row digest clause is removed.
    6. `abg/native_work_effect.ts:63-67` `projectNativeWorkUnknownEffectTask`, five selections, with `PAYLOAD_RECORD`. The runtime source choice (`priorEvents` or the indexed key) stays in a local `source(key)`.
    7. `abg/worksite_input_provenance.ts:57-60` `successfulResult`, with `RESULT_VALUE_RECORD` (`valueDigest` against the hash of `payload.value`).
    8. `abg/registered_selection_provenance.ts:51-56` `projectRegisteredSelectionInputAtPrefix`, the success result, with `CHOICE_RESULT_RECORD`. The projection is `isRegisteredGraphChoice`; the digest leg compares `valueDigest`.
    9. `abg/retry.ts:5209-5211` `projectRuntimeRetryBudgetFacts`, the attempt row, with `RETRY_ATTEMPT_RECORD` (the body digest against `attemptDigest`).
    10. `abg/retry.ts:5219-5224`, the same function's progress row, with `RETRY_PROGRESS_RECORD` (the body digest against `progressDigest`).
  - Equivalence notes:
    - The digest leg now runs at selection. In readers 4, 5, 8 and 10 it used to run after other pure checks that return `null` or `false`. Each output is unchanged; on a digest mismatch the reader now returns before those later checks run.
    - Readers 7 to 10 project the recorded digest through `isSha256Digest`. A recorded value that is not a digest can never equal `sha256Canonical` output, so each outcome is unchanged.
  - Left:
    - `abg/c_call_outcome.ts:353-377` failure evidence: the digest leg runs after `projectWorksiteFailureBasis(...)` and the runtime hash checks. Its selection moved to `onlyExactMatch` under rule 4.
    - `abg/worksite_revision.ts:377-383` evidence: the digest leg follows the runtime `hash(request)` and `hash(envelope)` checks.
    - `abg/retry.ts:1381` retry-attempt rehydrate: the digest leg follows `deriveRetryAttemptCursor` and `contextForCursor` over the runtime graph.
    - `abg/invocation_execution_truth.ts:263` `projectExactInvocationAdmissionAtPrefix`: the projection needs a second prefix lookup, for the public operation event, so `project` would take a runtime argument.
    - `abg/invocation_execution_truth.ts:59-60` governance source: the expected digests come from the runtime `source`.
    - `abg/c_call.ts:2298` undispatched evidence: the expected digest is the runtime `result.valueDigest`.
    - `abg/traversal_cursor.ts:324`: the expected digest is the runtime `cursor.cursorDigest`.
    - `abg/project_read_ports.ts` `scopeForBasis` and `terminalDeclaration`: the program, graph and declaration rows are not events, and their digests are compared with the runtime basis or invocation.
- abg `length === 1` census at head: 135 occurrences on 127 lines. That is 131 written `length === 1` (the activation's 123 lines) and 4 written `length===1`. Lines carrying two clauses are marked ×2.
  - migrated: 66.
  - not a selection: 69. Of these, 55 are count clauses (inside a composite condition, a boolean count, or a branch that does not read `[0]`), 12 are arity checks on payload or carrier arrays, and 2 are other: `c_call.ts:463`, an exact pick over an owner-deduplicated value set, and `construction_continuation.ts:123`, which returns the whole array.
  - first-match residual: 0.
  - Per file (head line numbers):
    - `abg/actor_process.ts`: count clause 629, 633; arity 334
    - `abg/c_call.ts`: migrated 2000, 4210, 6341; count clause 459, 1044, 1084, 1086, 2041; arity 1926, 1936; other 463 (distinct-value set after an owner Set dedup)
    - `abg/c_call_outcome.ts`: migrated 231, 353; count clause 188, 196, 1169; arity 169
    - `abg/construction_continuation.ts`: migrated 42, 1706; other 123 (returns the whole array, no [0])
    - `abg/default_library.ts`: migrated 75, 107; count clause 44
    - `abg/effectful_invocation_truth.ts`: migrated 213
    - `abg/environment_admission.ts`: migrated 342, 569; count clause 371
    - `abg/execution_basis.ts`: migrated 1084, 1185, 1205; count clause 652 ×2, 654, 657, 668 ×2, 672, 673 ×2, 721, 722
    - `abg/fan_out_projection.ts`: migrated 118, 200, 341, 594
    - `abg/fh_continuation_projection.ts`: arity 135, 1024
    - `abg/instruction_assembly.ts`: migrated 96, 257, 323; count clause 137 ×2
    - `abg/native_work_effect.ts`: migrated 66
    - `abg/native_work_reacquisition.ts`: migrated 42
    - `abg/native_worksite_execution.ts`: migrated 22; arity 205
    - `abg/open_call.ts`: migrated 863, 867, 868; count clause 196, 199, 201, 205, 246
    - `abg/probabilistic_result.ts`: migrated 380
    - `abg/project_read_ports.ts`: migrated 753, 1132, 1207, 1228; count clause 547
    - `abg/qualification_proof.ts`: migrated 58; count clause 139, 463, 573, 687
    - `abg/replay.ts`: migrated 401, 404, 407, 422; count clause 470 ×2, 471 ×2
    - `abg/retry.ts`: migrated 693, 1349, 2964, 3102, 5219, 6306; count clause 1638 ×2 (causation arity and a count clause), 1824, 3391, 4147; arity 3162
    - `abg/runtime_liveness.ts`: migrated 43
    - `abg/semantic_job.ts`: migrated 128, 435, 509; count clause 105
    - `abg/semantic_revision.ts`: migrated 160, 878; count clause 578, 797; arity 362
    - `abg/semantic_stage.ts`: migrated 320; count clause 116 ×2, 165; arity 226
    - `abg/traversal_cursor.ts`: migrated 363, 452, 524, 584; count clause 415
    - `abg/traversal_route.ts`: migrated 646, 1588, 4280, 4296; arity 2507, 3534
    - `abg/witness_admission_operation.ts`: migrated 628
    - `abg/worksite_command_forward.ts`: migrated 32
    - `abg/worksite_construction_recovery.ts`: migrated 48, 114; count clause 398
    - `abg/worksite_input_provenance.ts`: migrated 40
    - `abg/worksite_revision.ts`: migrated 52, 545; count clause 179, 476, 666
- first-match residuals outside the census (rule 5):
  - None migrated.
  - These are `.find(` and `.at(-1)` sites over runtime-event sources in `abg/`, found by grep. Line numbers are at this commit.
  - The list is heuristic: it can include a non-event `find` and miss a multi-line one. `[0]` and `some` sites are not enumerated.
  - Total: 212 sites in 31 files.
    - `abg/actor_process.ts`: 637
    - `abg/c_call.ts`: 1077, 1227, 1230, 1339, 1342, 1876, 1879, 1888, 2225, 2256, 2308, 2430, 2989, 3177, 3402, 3456, 3457, 4709, 4715, 4892, 4968, 4982, 6269, 6334, 6335, 6648, 7031, 7151, 7206
    - `abg/c_call_outcome.ts`: 420, 925, 928, 933
    - `abg/child_lifecycle.ts`: 69, 76, 84, 112, 123, 131
    - `abg/closure.ts`: 258, 261, 264, 462
    - `abg/construction_continuation.ts`: 56, 163, 175, 1684, 1688, 1690, 1692, 1856, 1857
    - `abg/continuation.ts`: 947, 1091, 2188
    - `abg/deferred_application.ts`: 95, 106
    - `abg/event_calculus.ts`: 2009
    - `abg/event_prefix.ts`: 164, 209, 318, 647, 680, 742
    - `abg/event_store.ts`: 1413, 2390, 3383, 3652, 3750, 3773
    - `abg/execution_basis.ts`: 735, 996, 1208, 1306
    - `abg/fan_out_projection.ts`: 1079
    - `abg/fh_continuation_projection.ts`: 125, 399, 417, 418, 421, 586, 587, 915, 1006, 1009
    - `abg/fh_resume_relation.ts`: 137, 176, 251
    - `abg/graph_application.ts`: 327, 364, 405, 489, 593, 603, 877, 914, 921, 929, 953, 962, 974, 983
    - `abg/invocation_admission.ts`: 436, 441, 450, 489
    - `abg/invocation_execution_truth.ts`: 136, 137, 270
    - `abg/open_call.ts`: 287, 288, 289, 336, 343
    - `abg/project_read_ports.ts`: 773, 1553
    - `abg/replay.ts`: 416, 656, 1144, 1252, 1259, 1267, 1274, 1281, 1322, 2337, 2338, 2339, 2409, 2410, 2411, 2418, 2419, 2433
    - `abg/retry.ts`: 695, 1730, 1733, 1737, 1741, 1947, 2679, 2714, 2740, 3128, 3266, 3409, 3758, 3833, 5240, 6365
    - `abg/runtime_liveness.ts`: 286, 293, 300, 356, 402, 632, 716, 918, 961
    - `abg/semantic_job.ts`: 288, 357, 422, 430, 503, 522
    - `abg/semantic_revision.ts`: 571, 608, 610, 727, 731
    - `abg/semantic_stage.ts`: 76, 137
    - `abg/traversal_route.ts`: 779, 785, 1536, 1806, 1887, 2062, 2069, 2174, 2183, 2191, 2200, 2208, 2395, 2419, 2430, 2438, 2449, 2555, 2562, 2892, 2911, 2927, 2944, 3113, 3420, 3565, 4420, 4425
    - `abg/witness_definition_bindings.ts`: 159
    - `abg/worksite_construction_recovery.ts`: 111
    - `abg/worksite_input_provenance.ts`: 529
    - `abg/worksite_revision.ts`: 181, 209, 279, 282, 403, 494, 676, 729
- declaration_closure: used the family. `locateRequired` decides eligible multiplicity with `resolveExactMatch(all, …)`: `one` gives `one` and `many` gives `ambiguous`. For `absent`, the Product-owned `all.length === 0 ? "absent" : "missing_dependency"` is kept.
- shim: `product/exact_match.ts` deleted with `git rm`.
  - Importers updated: none. No file in `code/src` or tracked `test_env` imports it; `build/code/src/product/exact_match.*` was never tracked.
  - The regenerated `product-toolchain-manifest.json` and `contracts/capabilities/capability-definition-graph.json` no longer name it.
  - M05_S06 location strings: lines 2170, 2174 and 2296 now read `shared/select/exact_match.ts`. Line 2296 reads `shared/select/exact_match.ts::resolveExactMatch`. Nothing else in that document changed.
- gate (in order, in `build_tenants/abiogenesis/typescript`):
  - `npm run build`: exit 0, 32 s.
  - `npm run lint:imports`: exit 0, under 1 s, 26 shared modules.
  - `node --test test_env/tests/t287-select-family.test.mjs`: exit 0, 7 pass / 0 fail, under 1 s.
  - `npm run test:installed:language`: exit 0, 44 s, 1 pass / 0 fail.
- self-check:
  1. pass. The grep returns nothing. The wider grep `\bone\s*=|function\s+one\b` also returns nothing.
  2. pass on tracked files. `test -e` fails, and `git grep "product/exact_match" -- code/src test_env` returns nothing. The literal `grep -rn` also matches 138 git-ignored historical run artifacts under `test_env/test_runs` and `test_env/uat/runs`: installed copies of old manifests, left untouched.
  3. pass. No export of `shared/select/` takes `unknown`; `grep unknown code/src/shared/select` is empty.
  4. pass. There are 18 `checkExactRecord` call sites. Each passes a module-level `const` `RecordCheck`: `PAYLOAD_RECORD` ×2 modules, `EXECUTION_BASIS_RECORD`, `IMPLEMENTATION_SET_RECORD`, `INTERACTION_SET_RECORD`, `RESULT_VALUE_RECORD`, `CHOICE_RESULT_RECORD`, `RETRY_ATTEMPT_RECORD`, `RETRY_PROGRESS_RECORD`. None is built inside a function body.
  5. pass. See the gate above.
  6. pass. The census above accounts for all 135 occurrences.
- residuals:
  - The activation's census missed three `one` helpers and the 4 `length===1` sites. All are covered above.
  - The 223 `length !== 1` sites in `abg/` are outside rule 4. Only those inside the migrated checked-record readers changed.
  - Only the smoke gate ran. It does not reach most migrated readers, so the one-for-one translation is the only check on them until the end-of-wave broad suite.
  - The eight checked-record readers left above stay for their owners.
- return route: this file
