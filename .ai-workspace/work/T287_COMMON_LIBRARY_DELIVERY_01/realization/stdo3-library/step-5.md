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
(step 2) supplies `Outcome`, `ok`, `refused`, `then`.

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
