# TD-34a Return: run invocation imports the GTL schema family

Writer: Claude Opus 5.5. Branch `claude/td34a-run-invocation-schema-owner` from
`main` at `2a2c07894`, worktree `/private/tmp/abg-td34a` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.
Scratch: `/private/tmp/abg-td34a-work/`.

**Status: complete, for review. `owner_bindings/run_invocation.ts` imports
`GRAPH_FUNCTION_SCHEMA` and `MODULE_PUBLICATION_SCHEMA` from
`gtl/serialization_contracts.ts`, and the hand copy (base lines 247-717) is
gone: 472 lines removed, 40 added, no other source file changed. On a
caller-supplied Catalog or view the run door now refuses a compose with fewer
than two terms, a batch with no task and an over-long tuple at the three
tuple sites. The three places where the copy was stricter stay at the door as
three named checks. Over 28,622 values (73,483 door cells), verdicts differ in
165 cells. All 165 are in the five repaired places, each admitted on base and
refused now. Where both doors admit, the outputs are deep-equal. Recorded
history holds no value that the repaired door refuses: 689 distinct recorded
Catalogs and views get the same verdict from both doors, and 0 of 125,433
compose terms, 43,738 batch terms, 6,326 construction compositions and 280,293
closure contracts fall in a repaired place. The owner-established path is
unchanged and still runs no schema. Every `.d.ts` is byte-identical to base,
and `contracts/` changes only in digests. All 19 existing lane files keep
their base results test for test. The new lane fails 1 of 3 on the base build
and passes 3 of 3 after. No stop condition holds. Two items are for the
Executive's decision, and neither blocks the merge. First, every CLI call takes
the fallback path, so the register's boundary sentence for TD-34 is too broad
(section 4). Second, valibot's record drops the keys `constructor`,
`__proto__` and `prototype`, both before and after this change (residual 2).**

## 1. Drift, re-measured on `2a2c07894`

Copy lines are in `owner_bindings/run_invocation.ts` at base, owner lines in
`gtl/serialization_contracts.ts`. The owner no longer has
`stdoRunEnvironments` (TD-31), so that difference is gone. Eight remain.

| Place | Copy | Owner | Direction | What this package does |
| --- | --- | --- | --- | --- |
| `c_compose.terms` | `:298` `v.array(term)` | `:59` `minLength(2)` | copy looser | adopts the owner: 0 or 1 terms are refused |
| `c_batch.tasks` | `:321` `v.array(term)` | `:68` `minLength(1)` | copy looser | adopts the owner: a batch with no task is refused |
| `construction_composition.authorities` | `:549` `v.tuple` | `:190` `v.strictTuple` | copy looser | adopts the owner: a fifth authority is refused, not truncated |
| `closure_contract` `run` `eventKindRefs` | `:686` `v.tuple` | `:164` `v.strictTuple` | copy looser | adopts the owner: an over-long value is refused, not truncated |
| `closure_contract` `graph_call` `eventKindRefs` | `:707` `v.tuple` | `:166` `v.strictTuple` | copy looser | adopts the owner: an over-long value is refused, not truncated |
| graph function `declarations` values | `:485` nonblank | `:146` `v.string()` | copy stricter | named check `hasNonblankDeclarationValues` at this door |
| Program `policies` values | `:516` nonblank | `:197` `v.string()` | copy stricter | named check `hasNonblankPolicyValues` at this door |
| `semanticJobLifecycle.stages` | `:624` `SEMANTIC_JOB_LIFECYCLE_SCHEMA`, stages checked by `isSemanticStageDeclaration` | `:208-210`, `:219` `semanticJobSchema`, stages checked by `STAGE_SCHEMA` alone | copy stricter | named check `hasSemanticJobStageInvariants` (`isSemanticStageDeclaration`) at this door |

The refutation pass also removed `vectorIndex` and `v.union` against
`v.variant` from the drift list. The differential agrees: no cell outside the
five places changes verdict.

## 2. The change

`owner_bindings/run_invocation.ts` (after the change):

- Imports `GRAPH_FUNCTION_SCHEMA`, `MODULE_PUBLICATION_SCHEMA` and
  `nativeStructuralSchema` from `gtl/serialization_contracts.js`, and
  `isSemanticStageDeclaration` from `gtl/semantic_stage.js`. The imports of
  `REQUIREMENT_HANDOFF_DECLARATION_SCHEMA`, `SEMANTIC_LIFECYCLE_SCHEMA`,
  `SEMANTIC_JOB_LIFECYCLE_SCHEMA`, `FOLDBACK_DECLARATION_SCHEMA` and
  `RUN_ENVIRONMENT_SCHEMA` go, because only the copy used them.
- `:250-285` replace base `:249-717`. The block holds a comment, three
  predicates and two door schemas:
  - `hasNonblankDeclarationValues` (`:258`);
  - `hasNonblankPolicyValues` (`:263`);
  - `hasSemanticJobStageInvariants` (`:270`);
  - `RUN_INVOCATION_GRAPH_FUNCTION_SCHEMA` (`:275`), which is the owner's graph
    function schema piped through the declaration check;
  - `RUN_INVOCATION_MODULE_PUBLICATION_SCHEMA` (`:280`), which is the owner's
    publication schema piped through the declaration check (applied to every
    graph function in the publication), the policy check and the stage check.

  The comment says what ruling 3 asks for: the owner admits these values, this
  door refuses them, and whether the owner adopts each check is recorded under
  TD-34.
- The three use sites change: `definition:` (`:494`, base `:926`), and
  `readinessBasis.publications` and `boundPublications` (`:583`, `:585`, base
  `:1015`, `:1017`).

The named checks sit on the nested member schemas, so the top-level resource
schema stays an unpiped `strict_object`. That matters because the binder
passes members one at a time only when the top-level schema is unpiped
(`public/binding/static_definition_bindings.ts:29-35`); a piped top level
would send every call down the whole-object path. A `v.check` in a pipe runs
only on a typed dataset, so each check sees a value the owner has already
admitted.

`gtl/serialization_contracts.ts` is unchanged, because it already exports
every schema the door needs. No other file under `code/src` changes. With the
copy goes the copy's `C_PROGRAM_TERM_SCHEMA`, which rebuilt a seven-member
union inside `v.lazy` on every nested term parse (register TD-34, refutation
paragraph); the owner's lazy getter returns one prebuilt schema.

A refused value gets the same fault before and after:
`resource_admission`/`invalid_resource_assertion` with a fixed message
(`static_definition_bindings.ts:130-136`). The binder does not carry the
schema issue into the fault.

## 3. The shipped path (ruling 4)

`RUN_INVOCATION_ESTABLISHED_RESOURCE_MEMBERS` (`:1877-1880`, base
`:2309-2312`) and the four bindings that use it (`:1882-1904`) are unchanged.
The diff touches no line from base `:718` onward except the three use sites.

The binder's resource gate is `admitResources`
(`static_definition_bindings.ts:54-91`), and this package does not touch it.
It works as follows:

- `:76-77` call each owner predicate (`isAdmittedReadyGraphFunctionCatalog`,
  `isAdmittedGraphFunctionCatalogView`) on the member's exact value;
- an accepted member goes into the output by identity (`:88-90`);
- only the other members (`fresh`, `:79`) are counted (`:80`) and run through
  `admitContract` (`:81-85`).

So an owner-established Catalog and view reach no schema, before and after.
The lane `t287-owned-call-reference` asserts this with the binder's counters.
On three established start calls (`constructInstalledStartCall`), it asserts
that `gated.catalog` and `gated.catalogView` are 0 (`:37-38`, `:58`, `:74`)
and that `resourceMemberReuses >= 2`. It passes before and after (section 7). The same
lane shows the other side (`:95-104`): a shallow copy of an established call
is detached, and its Catalog and view take the gate (`gated.catalog >= 1`,
`gated.catalogView >= 1`). The new lane shows this for every caller-supplied
case (`gated >= 1`).

## 4. Where the fallback path runs: every CLI call

The register says the copy never runs on the shipped path. That holds for an
in-process call that carries the Catalog owner's established objects. It does
not hold for the CLI:

- `public/cli.ts:102` parses the request file with `JSON.parse`;
- `runInstalledDefinitionCallTransport` carries a call by reference only when
  it is established (`installed_definition_call_transport.ts:385-391`);
- every other call is detached by `structuredClone` (`:317-356`).

A Catalog that arrives as JSON is never in the owner's established set
(`product/catalog.ts:416-419`). So on every CLI `run.invoke`, `run.start`,
`run.continue current_intent` and `run.continue selected_action` call, the run
door runs its Catalog and view schemas. Before this change that was the copy;
now it is the owner's schemas plus the three checks.

This is no new schema run: the CLI ran the copy on every call before. It does
mean the repaired verdicts apply on the CLI. The recorded CLI requests are in
the recorded search (section 6): 2,568 `abg_cli_transport_request` values,
and their Catalogs and views get the same verdict from both doors. The
register's boundary sentence for TD-34 ("On the shipped path admission does
not change, because the copy never runs there") should say "in-process
established calls".

## 5. What the door checks on a caller-supplied Catalog (ruling 6)

This applies when the binder takes the gate, that is when no owner established
the Catalog or view (section 3).

**Catalog** (`READY_GRAPH_FUNCTION_CATALOG_SCHEMA`):

- Every publication in `readinessBasis.publications` and every publication in
  `boundPublications` gets the owner's `MODULE_PUBLICATION_SCHEMA` plus the
  three checks. That covers:
  - every top-level member, under the strict key law (an unknown key is
    refused);
  - every graph function in `graphFunctions` (the owner's
    `GRAPH_FUNCTION_SCHEMA` plus the declaration check);
  - every Program and its `constructionComposition`;
  - every closure contract;
  - every contribution;
  - the optional members `runEnvironments`, `semanticLifecycle`,
    `semanticJobLifecycle` (plus the stage check) and `requirementHandoffs`.
- Every entry in `entries` and in `byHandle` has its `definition` checked by
  the owner's `GRAPH_FUNCTION_SCHEMA` plus the declaration check.
- `declarationEntries` and `declarationsByHandle` carry no graph function and
  are unchanged.

**View** (`GRAPH_FUNCTION_CATALOG_VIEW_SCHEMA`): every `definition` in
`entries` and in `byHandle` is checked as above. The view carries no
publication.

The door checks shape only. It does not check that `boundPublications` equals
`readinessBasis.publications`, that `publicationDigests` match, or that an
entry's definition is in a publication. In the mixed case (a copied Catalog
with an established view) only the Catalog is checked.

**Relation to TD-31's closure-publication gap.** Product resolution rebuilds
the Catalog from `input.catalog.readinessBasis`
(`product/execution_resolution.ts:459-463`, `admitGraphFunctionCatalog`) and
takes the closure publications from that Catalog's `boundPublications`
(`product/declaration_closure.ts:53`, `:445`). Every closure publication is
therefore a member of `readinessBasis.publications`. On a run that enters
through this door with a caller-supplied Catalog, this door has already
checked every closure publication against the owner's strict publication
schema before resolution runs. A dependency publication with an unknown key,
such as TD-31's `fooTd31`, is refused here. This was already true of the copy,
whose publication schema was also a strict object, and it stays true. The gap
TD-31 found remains for a caller that calls Product resolution directly
(`ProductExecutionResolutionPort.resolve`, TD-31's probe door), because that
caller does not pass through this door. `product/catalog_operations.ts` is
unchanged.

## 6. Replay, re-admission and recorded data (ruling 5)

**Reading.** Only these use the door's resource schema
(`RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA`, `:667`):

- the four bindings `invoke`, `start`, `current_intent` and `selected_action`
  (`:1882-1904`);
- `isRunInvocationResourceAssertion` (`:685-689`).

`RUN_DEFINITION_BINDINGS` (`:1906`) is referenced only by the `product/index`
export and by the installed transport's source set
(`public/binding/owner_contract_source_set.ts:183`). No reopen, replay,
recovery or projection code under `code/src` calls the bindings or the
predicate.

The paths that can put recorded data through this door are these:

- An operator re-submits a recorded CLI request file
  (`abg.cli --jsonl <file>`). Recorded request files and `-call.json` files
  carry full Catalogs and views.
- The gated lane `w2-steel-single-start-closure` test 8 runs
  `isRunInvocationResourceAssertion` over a retained start call named by
  `ABI5_STEEL03_RETAINED_START_CALL_PATH`. That variable has no recorded value
  (TD-60), so the test is skipped.
- `test_env/tests/d2-frame-installed.mjs` and `test_env/uat/continuation.mjs`
  call `isRunInvocationResourceAssertion` on calls they build fresh. They do
  not use recorded data.

The generic-job readback re-submits freshly built read calls, not run
requests. `verifyRetainedGenericIntakes` reads `-call.json` files and does not
submit them. `ABI5_PREPARATION_RESOLVE_CALL` belongs to another door.

**Recorded-data search.** Two passes cover the evidence root
`/Users/jim/src/apps/abiogenesis/.ai-workspace` and the tenant's `test_env`.
Scripts and results are in `/private/tmp/abg-td34a-work/recorded/`.

1. **Structural scan of the five places** (`scan2.mjs`; results in
   `evidence-root-scan3.json` and `tenant-scan2.json`).
   - Selection: of the 240,673 `*.json` and `*.jsonl` files under the
     evidence root, the 6,389 that contain `c_compose`, `c_batch`,
     `construction_composition` or `closure_contract`, plus all 201 gzip
     files (decompressed). A value in any of the five places contains one of
     those strings. That is 6,590 files and 134.78 GB.
   - Parsing: each JSON document or JSON line is parsed up to 400 MB. Above
     that, and for files that are neither JSON lines nor one document (49
     files, 4.95 GB in all), a byte-level structural scanner reads the bytes
     without building the document. JSON held inside strings is unescaped and
     scanned.
   - Result: no value in any repaired place. It found:
     - 125,433 `c_compose` terms, with 2, 3, 4 or 8 terms;
     - 43,738 `c_batch` terms, with 1 or 2 tasks;
     - 6,326 construction compositions, all with 4 authorities;
     - 280,293 closure contracts, all `run` with 4 kinds or `graph_call` with 3.
   - The 797 `c_compose`/`c_batch` objects without an `inputCarrierRef` are
     corpus constructor rows, not terms.
   - Tenant `test_env/proof` and `test_env/fixtures` (47 files): 0 values.
     `test_env/evidence` does not exist in the worktree.
   - Not inspected: 57 strings that look like JSON but do not parse as one
     document. 54 are agent stream transcripts (`{"type":"system",...}` JSON
     lines held in one string), 2 are `d2_whole_program_discriminator` texts
     and 1 is a `static_validation_refusal` text. No re-admission path reads
     these strings.
2. **Both doors over every recorded Catalog and view** (`recorded-doors.mjs`;
   results in `recorded-doors-scratch.json`).
   - Input: the 4,058 `*.json`/`*.jsonl` files (111.28 GB) that contain
     `graph_function_catalog`.
   - Each recorded value is run through the base door and the new door,
     deduplicated by JSON text.
   - Counts: 2,516 Catalogs and 2,298 views, of which 305 Catalogs and 384
     views are distinct. 1,848 occurrences sit in a
     `run_invocation_resource_assertion` and 1,926 in an
     `abg_cli_transport_request`.
   - Verdicts:

     | Member | Admitted by both | Refused by both | Differing |
     | --- | --- | --- | --- |
     | Catalog | 289 | 16 | 0 |
     | View | 377 | 7 | 0 |

   - Where both admit, the outputs are deep-equal; 456 differ only in key
     order (section 7).
   - Not run through the doors: the 7 recorded documents over the 400 MB cap
     (6 lines of about 510-530 MB under
     `comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-installed-execution-*/`
     and one 468 MB `pure-preflight.json`), and gzip files. These hold the 25
     Catalogs and 25 views that pass 1 counts beyond pass 2's. Pass 1 covers
     them for the five places.
   - This pass ran against the scratch compile in `tsc-check/out`. That
     compile is byte-identical to the final build (`diff -rq` over
     `build/code/src`, exit 0).

The stop condition does not hold: no recorded value is refused, so no path
re-admits one.

## 7. Differential over values

Harness: `/private/tmp/abg-td34a-work/harness/grid.mjs`, with
`doors.mjs`. Result: `grid-final2.json`.

**How the doors are built.** Each side transpiles its own source of
`run_invocation.ts`:

- base: `git show 2a2c07894:…`;
- new: the worktree file.

Each is linked against its own build: the base build snapshot for base, and the
final build for new. Each exports
`RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA`. A door is
`admitContract(schema.entries.catalog | catalogView, value)`. That is exactly
what the binder runs for a member that no owner established (section 3).

**Values.**

- Terms of all seven kinds:
  - both leaf requirements;
  - nested compose, batch and recursion;
  - all 11 applications, and `recurse` with and without
    `failedChildDiagnosticClassRefs`.
- Graph functions from every shipped publication.
- Every `construct*ModulePublication`, plus the D2 source publication (with
  `requirementHandoffs`), the D2 consumer publication (`semanticLifecycle`)
  and a generic job publication (`semanticJobLifecycle`).
- The default library publication carries `runEnvironments`. Each optional
  member is tested present and absent.

**Mutations.**

- At every structural site:
  - drop a key;
  - change a value's type (number, string, null, 0);
  - set a string to blank or empty;
  - add an unknown key;
  - set an array to `[]`;
  - duplicate an item, or keep only the first;
  - set a wrong literal;
  - flip a boolean.
- Named cells:
  - the five loose places;
  - the three strict places, including four stage-invariant breaks;
  - `+stdoRunEnvironments`.

**Placement.** Each graph value goes into a view entry, a Catalog entry and a
publication's graph functions. Each publication goes into
`readinessBasis.publications` and `boundPublications`.

| Measure | Count |
| --- | --- |
| Value cells | 28,622 |
| Door cells (value × place) | 73,483 |
| Door runs | 146,966 |
| Admitted by both | 14,756 |
| Refused by both | 58,562 |
| Differing | 165 |

**Differing cells.** All are admitted on base and refused now. None lies
outside the five places, and no cell is refused on base and admitted now.

| Place | Cells | Mutations | Where |
| --- | --- | --- | --- |
| `c_compose.terms` | 110 | `terms=[]` 55, `terms=first` (one term) 55 | view 26, Catalog entry 26, publication graph 26, `readinessBasis.publications` 16, `boundPublications` 16 |
| `c_batch.tasks` | 27 | `tasks=[]` 27 | view 7, Catalog entry 7, publication graph 7, readiness 3, bound 3 |
| `closure_contract` `graph_call` `eventKindRefs` | 16 | `+dup` (length 4) | readiness 8, bound 8 |
| `closure_contract` `run` `eventKindRefs` | 10 | `+dup` (length 5) | readiness 5, bound 5 |
| `construction_composition.authorities` | 2 | `+dup` (length 5) | readiness 1, bound 1 |

**Strict places.** Both doors refuse in all of them:

- declarations: 1,230 of 1,236 cells;
- policies: 128 of 128;
- stage invariants: 8 of 8.

The other 6 declaration cells put a blank value under the record key
`constructor`. Valibot's `v.record` skips the keys `__proto__`, `prototype` and
`constructor` and leaves them out of its output. So both doors admit those 6
values and drop the key, and the nonblank check never sees the value. This is
the same before and after (residual 2).

**Outputs.** Where both doors admit (14,756 cells), the outputs are
deep-equal (`isDeepStrictEqual`): 0 mismatches, and 0 canonical-JSON
mismatches. In 6,533 cells the key order differs. That is because valibot
writes a strict object's output in its schema's entry order, and the owner
orders the application members and the publication's optional members
differently from the copy. Canonical bytes and digests are the same.

**Output against input.**

- The base output differs from its input in 28 cells. All are tuple
  truncations, all are now refused, and all are among the differing cells:
  - `graph_call` `eventKindRefs`: 16;
  - `run` `eventKindRefs`: 10;
  - `authorities`: 2.

  Example: in
  `$.catalog.readinessBasis.publications.0.closureContracts.0.eventKindRefs`
  the input has length 4 and the base output has length 3; for `authorities`,
  input 5 and output 4.
- Both doors give the same output that differs from its input in 378
  admitted cells. These come from two valibot record behaviours that the copy
  and the owner share:
  - an array given for a record member is admitted and output as `{}` (180
    cells);
  - a `constructor` key is dropped (198 cells: the probe graph with a
    `constructor` declaration, under each mutation that keeps it admitted).

## 8. Lanes

Command per file, from T:
`TMPDIR=/private/tmp/abg-td34a-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>`.

- Base: the `2a2c07894` build with the committed generated files.
- After: the final build, with the generated files that build wrote. They were
  restored before each commit.
- TAP output is in `/private/tmp/abg-td34a-work/lanes/{base,after}/`.

**Selection.** The test files that:

- import `owner_bindings/run_invocation`;
- name `RUN_INVOCATION`, `runInvocationOwner` or `admittedInvocationRuntimeSchema`;
- or submit a caller-supplied Catalog through the run door (`t287-w2-05`,
  `t287-owned-call-reference`);

plus the nine files the brief names. `d2-frame-installed.mjs` calls
`isRunInvocationResourceAssertion` and was run too. The two known-red lanes
on `main` (`witness-reprice-definition-binding`, `t287-governed-context`) do
not match the selection and were not run.

| Lane | Base: tests / pass / fail / skip | After: tests / pass / fail / skip | Same |
| --- | --- | --- | --- |
| `t287-w2-05-static-binding-algebra` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 | yes |
| `t287-historical-source-resource` | 4 / 3 / 1 / 0 | 4 / 3 / 1 / 0 | yes |
| `t287-runtime-failure-diagnostic` | 21 / 21 / 0 / 0 | 21 / 21 / 0 / 0 | yes |
| `t287-selected-execution-closure` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `m5-c-algebra-validation` | 22 / 19 / 0 / 3 | 22 / 19 / 0 / 3 | yes |
| `t287-gtl-serialization-publication` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 | yes |
| `t287-c2-child-program` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | yes |
| `r5-invocation-admission` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | yes |
| `r8-direct-hog-entry` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `w2-steel-single-start-closure` | 8 / 0 / 0 / 8 | 8 / 0 / 0 / 8 | yes |
| `t287-owned-call-reference` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `t287-d1-requirement-handoff` | 5 / 2 / 0 / 3 | 5 / 2 / 0 / 3 | yes |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 | yes |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | yes |
| `t287-default-library` | 37 / 34 / 0 / 3 | 37 / 34 / 0 / 3 | yes |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | yes |
| `d2-frame-installed.mjs` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | yes |

Every test has the same outcome before and after, compared by name and number in the TAP files.

`t287-historical-source-resource` test 1 ("actual R10 ancestry …") fails on
base and after with the same assertion, "exact existing basis body is
borrowed" (`:72`). It is not one of the two reds the brief names. TD-60's
Return records it on `main` as an undecided class C lane
(`d2-continuation-09-store-borrowed-ancestry`). This change does not cause it.

The skips are lanes gated by variables with no recorded value, the same
before and after. They are:

- `w2-steel-single-start-closure`: 8;
- `t287-d1-requirement-handoff`: 3;
- `t287-default-library`: 3;
- `m5-c-algebra-validation`: 3;
- `t287-w2-05`: 2;
- `w2-steel-serial-branch-installed`: 2;
- `w2-steel-single-start-installed`: 1;
- `t287-selected-execution-closure`: 1;
- `d2-frame-installed`: 1.

**New lane** `test_env/tests/t292-td34a-run-invocation-schema-owner.test.mjs`.

- Every case goes in through the door a caller reaches:
  `publicApi.runInstalledDefinitionCallWithResource` with an exact
  `run.invoke` call (the W2-05 construction) whose Catalog and view are
  structurally complete and that no owner established.
- For each case the lane records:
  - the binder's `gated.catalog` delta;
  - `isRunInvocationResourceAssertion`;
  - the door result, which is either the fault (`stage:code`) or the run
    owner's own refusal (`owner:<code>`). The run owner refuses the unadmitted
    setup with `invalid_program`, so `owner:invalid_program` means the value
    passed the door.

| Test | Cases | Base (`2a2c07894` build) | After |
| --- | --- | --- | --- |
| 1. one-term compose, empty batch, over-long tuple are refused | 7 (publication: compose, batch, 5 authorities, run 5 kinds, graph_call 4 kinds; view entry: compose; Catalog entry: batch) | **fails**: all 7 reach the owner (`owner:invalid_program`, `structural: true`) | passes: all 7 `resource_admission:invalid_resource_assertion` |
| 2. the three stricter checks stay at the door | 4 (blank declaration in a publication and in a view entry, blank policy, a stage whose assembly names another graph function) | passes | passes |
| 3. a well-formed caller-supplied Catalog with every optional member is admitted | 3 (empty; publications carrying `runEnvironments`, `semanticLifecycle`, `semanticJobLifecycle`, `requirementHandoffs`; Catalog and view entries); the event log stays empty | passes | passes |

Each case also asserts the GTL owner's own verdict on the mutated value:

- in test 1 the owner refuses it;
- in test 2 the owner admits it, which shows the check belongs to this door.

Totals: base 3 tests, 2 pass, 1 fail; after 3 tests, 3 pass.

## 9. Build, lints, exported types (ruling 7)

- `npm run build`: passes, and is deterministic over two runs.
- `npm run lint:imports`: passes (30 shared modules; 3 forbidden owner pairs
  hold).
- `npm run lint:lifecycle`: passes (292 modules, no offender).
- `npm run lint:calculus`: passes (6 modules, no offender).

**Exported types.** Every one of the 292 `.d.ts` files under
`build/code/src` is byte-identical to the base build
(`diff -rq --exclude='*.js'`, exit 0), `owner_bindings/run_invocation.d.ts`
included. No exported signature changes, so no `Equal` check is needed. The
door schemas are module-private and are cast to the `GraphFunction` and
`ModulePublication` types the copy had. The only build output that differs
from base is `owner_bindings/run_invocation.js`.

## 10. Identity digests and generated contracts (ruling 9)

After the final build:

| Digest | Base (`2a2c07894`) | After |
| --- | --- | --- |
| `productContentDigest` | `sha256:d0b3dc8e6edf8f24de969a9cdea637175958c0589eb37007f76fbab17b8c6a05` | `sha256:6f632c737c6026b4c546c6ca81b667666e2ec7d92e9b2d4517e9fb5522a4bfcb` |
| `contributionManifestDigest` | `sha256:475946bc5eb72e0974895ec772a5c0b620a21f1d5160020c667bcf86becff122` | `sha256:b6d21845d982b99f9f8cd4bda0d6e4d4cf12bd439fb3a2b1f27fc9473ae75f69` |
| capability graph `graphDigest` | `sha256:1133544d6313db1f4b3f5509759f91a9a2bac29fba19a725a6322cb7676b15af` | `sha256:8d13676d5f85fe5abca8259e100a2b866452c6edd8e6c9ddeb12245c0193f7f5` |
| capability graph asset `contentDigest` | `sha256:df617a5ad9b2a2931f9059b621436974972936d84cad60812d92213feed32daf` | `sha256:15f77c24f20d1e0c2de4513817569aca6abd93e974dfaf3918a9c47abcafe6c9` |
| `publicContractCatalogDigest` | `sha256:9366decf0cfef0241bb5cac33b3df374d38a2a0892239ae8a0558e75c853aa8d` | unchanged |

The build changes two tracked files:
`contracts/capabilities/capability-definition-graph.json` and
`product-toolchain-manifest.json`. It does not change
`test_env/fixtures/abi5-root-candidate-basis.json` or any other file under
`contracts/`.

A leaf-by-leaf comparison finds that every changed leaf is a digest, or a ref
that embeds one, and nothing else changes. Leaves that are equal once each
64-hex run is masked count as digest-only.

- The capability graph changes in 310 leaves: `graphDigest`, 16 row
  definition digests and refs, 18 dependent digests and refs, and 241
  `productContentDigest` copies.
- The manifest changes in 70 leaves: the digests and refs above, 49 row
  `provenanceRef`s and 10 `publicationBindings[].publicationDigest`s.

The publication digests move only because `productContentDigest` is an input
to the publications. Rebuilding the ten publications with the after build
and the base `productContentDigest` reproduces the base manifest's
`publicationBindings` exactly (`/private/tmp/abg-td34a-work/pubdigest.mjs`).
No generated contract is built from the copy. Both changed files were restored
before committing. The Executive regenerates them at the merge.

## 11. Size

`git diff --numstat 2a2c07894 -- build_tenants/abiogenesis/typescript/code/src`:

```
40	472	build_tenants/abiogenesis/typescript/code/src/owner_bindings/run_invocation.ts
```

The file goes from 2,342 to 1,910 lines, a net 432 fewer. The new lane is 242
lines.

## 12. Commits

| Commit | Content |
| --- | --- |
| `43a500c86` | the source change and the new lane (authored files only) |
| this commit | this Return |

## 13. Deviations

- No file other than `owner_bindings/run_invocation.ts` and the new lane
  changes. Ruling 1 allowed an export from the owner, but none was needed.
- The recorded door pass (section 6) ran against the scratch compile, which
  is byte-identical to the final build.
- `d2-frame-installed.mjs` was run in addition to the brief's selection. It
  skips on both builds.

## 14. Residuals

1. **The register's boundary sentence for TD-34** describes only in-process
   established calls. Every CLI call takes the fallback path (section 4), so
   the run door's Catalog and view schemas run on every CLI run call. This
   package does not edit the register.
2. **Valibot record keys.**
   - `v.record`, in the owner and as it was in the copy, skips the keys
     `__proto__`, `prototype` and `constructor`. So a value under one of them
     in `declarations`, `policies` or `byHandle` is never checked and is left
     out of the admitted output. The nonblank checks run on that output, so
     they never see it.
   - `v.record` also admits an array as an empty record.
   - Both behaviours are the same before and after. Whether the owner should
     refuse them is an owner question for TD-34 or a new entry.
3. **The three stricter checks** stay at this door. Whether the GTL owner
   adopts them is open under TD-34 (ruling 3).
4. **The closure-publication gap** (TD-31) remains for a direct call to
   Product resolution. On a run through this door, every closure publication
   is already checked here (section 5).
5. **`t287-historical-source-resource` test 1** is red on base and after,
   and is recorded in TD-60.
6. **The later parts of TD-34** are untouched: the repeated setup sequence,
   the second SDK preparation, the second schema source and the duplicate
   slot lists.
