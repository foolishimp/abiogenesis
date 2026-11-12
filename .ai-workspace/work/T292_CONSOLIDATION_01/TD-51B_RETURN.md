# TD-51b Return: body reads per operation at every event-resource acquisition site

Writer: Claude Opus 5.5. Branch `claude/td51b-operation-hold-owner` from local
`main` at `a7c12fab5`, worktree `/private/tmp/abg-td51b`. Change class:
realization_refactor. No push, no tag.

**Status: repaired (ruling 3), with three items for a ruling.** One owner,
`withOperationBodies` (`abg/event_prefix.ts`), holds the bodies an operation or
a read port call selects:
- at the five synchronous operation sites, on their resource's coordinate;
- at the five read port entries, on the history the port prepared.

Inside one operation or one port call each basis body is now read once:

| Path | Basis reads, base → final |
| --- | --- |
| release evidence read | 15 → 5 (at most 3 per row → 1) |
| workspace bind | 20 → 5 (at most 4 per row → 1) |
| legacy `binding` cold copies | at most 21 and 17 per row → 1 |
| direct port calls on the held-prefix input | 45 → 3 (case 1) and 58 → 21 (case 3), at TD-60C's bounds |

Sites whose body awaits open no operation hold; that is the stop condition.
Their port calls are held per call. Outputs, refusals and digests are
unchanged on the operation probe, the port probe, the cross-cut fixture and
eleven replay logs. Lanes: 62 files, 477 tests, 451 pass, 2 fail, 24 skip
before; 477, 453, 0, 24 after, with the root basis refreshed for the final
build. The two tests that now pass are `t287-held-prefix` cases 1 and 3 on a
scratch copy. On the committed basis, the two `t292-td36r-*` lanes refuse with
`artifact_digest_mismatch`, as on any source change (section 9).

Three items need a ruling (section 15): the owner's module, holds on a port's
own cold copy, and a hold over the synchronous stretch of
`withAdmissionAuthority`. Item 4 there lists `t287-held-prefix` cases 1 and 3
for the Executive's rerun after both merges.

## 1. Method

The probe is `/private/tmp/abg-td51b-work/probe/ops-probe.mjs`, with
`ops-admission.mjs` for the requests and `meter.mjs` for the counting. It
builds the installed root catalog with the language smoke fixture
(`setupInstalledRootCatalog`, `workspaceProductIndex: 1`, as
`t287-held-operation-bodies`), so every operation runs on built-in or fixture
implementations and no model is called. It runs one operation at a time
through the installed transport (`runInstalledDefinitionCallWithResource` for
a borrowed resource, `runInstalledDefinitionCallTransport` with
`kind: "reopen"` for a reopened one). Call construction happens outside the
measured window.

Phase A acquires the store once by reopen and keeps it held. Four Runs start
and every operation borrows that held resource. Phase B closes it, and each
operation then acquires the store through its own reopen handoff. During
Phase B the log grows from 131 to 167 rows (3.63 to 3.76 MB). It has four
`basis_admitted` rows, then five, and two to five materialization artifacts. Request shapes come from the lanes that drive
each operation: `t287-required-operation-bindings`, `t287-selected-action`,
`t287-w2-05-install-catalog-owner-chain` and `t287-cross-cut-public-read`.

The meter counts every `readSync` on a descriptor whose device and inode are
the log's. A body read starts at a row offset and returns that row's byte
length, outside `foldRuntimeHistoryDescriptor`; any other read is a decode
chunk. Each body read is attributed to two things:

- The `RuntimeHistory` instance that made it, found by wrapping
  `RuntimeHistory.prototype.event`.
- The innermost acquisition-site frame on its stack.

The meter also wraps `RuntimeHistory.prototype.holdOperationBodies`, so a read
is known to be inside an open hold or not. The acquired history is the history
the operation's own resource holds. A cold copy is any other history, decoded
from the file at a coordinate that has no active selection.

Raw output: `/private/tmp/abg-td51b-work/out/base6.jsonl`, base build
`/private/tmp/abg-td51b-work/base-root` (rsync of `a7c12fab5`, built). Graph-call
members: the first part's cross-cut probe on the cross-cut fixture,
`/private/tmp/abg-td51b-work/out/crosscut-base.jsonl`.

## 2. Acquisition sites

The sixteen call sites of `acquireAbgEventResource` on base. Resource kinds:

- new: an empty log, so there is no body to read.
- reopen: acquired through a close handoff, with a private store and lock.
- borrowed: an acquired selection of a held owner, a copy that does not close.

"Body" is whether the operation body from acquisition to return is one
synchronous stack.

| # | Site (base line) | Operations | Resource kinds | Body |
| --- | --- | --- | --- | --- |
| 1 | `owner_bindings/run_invocation.ts:824` `runInvocationOwner` | `run.invoke` start | new, reopen, borrowed | awaits: `Effect.gen` with `asyncStage` (`:893`, `:1163`) and the traversal |
| 2 | `owner_bindings/run_invocation.ts:1508` `runCurrentIntentOwner` | `run.continue#current_intent` | reopen, borrowed | awaits: `resolveContinuationBasis`, `leaf_port` |
| 3 | `owner_bindings/run_invocation.ts:1582` `runSelectedActionOwner` | `run.continue#selected_action` | reopen, borrowed | awaits, as 2 |
| 4 | `owner_bindings/run_invocation.ts:1673` `runPendingExecutionOwner` | `run.continue#pending_execution`, and `current_intent` with a pending cursor | reopen, borrowed | awaits, as 2 |
| 5 | `product/materialization_definition_bindings.ts:331` `materializeOwner` | `product.materialize` (`context_bootstrap`, `configuration`) | as handed by 11; own acquisition only when 11 acquired none | awaits: `Effect.tryPromise` |
| 6 | `product/catalog_definition_bindings.ts:571` `admit` | `catalog.admit` | as 5 | one synchronous stack (`Effect.try`) |
| 7 | `product/install_definition_bindings.ts:261` `install` | `product.install` | new and reopen (own; binding forbidden), borrowed (from 11) | awaits: `installInResolvedLock` |
| 8 | `product/release_snapshot_definition_bindings.ts:42` | `release.snapshot#published_rc` | as 5 | awaits: `verifyProduct` |
| 9 | `product/release_snapshot_definition_bindings.ts:114` | `release.snapshot#tapped_release` | as 5 | awaits |
| 10 | `product/result_definition_bindings.ts:186` `assessOwner` | `result.assess` | as 5 | one synchronous stack |
| 11 | `product/admission_authority.ts:543` `withAdmissionAuthority` | every admission-bound owner: witness ×2, result assess, materialize ×2, install, environment resolve and bind, catalog admit, view and apply, release ×2, conformance evaluate, product verify, workspace create and open | borrowed always; reopen when the admission basis names a bound environment | awaits: `constructAdmissionCapabilityGrants`, then the owner in `flatMap` |
| 12 | `product/project_read_definition_bindings.ts:1004` `releaseReadOwner` | `project.read#release_evidence` | reopen | one synchronous stack |
| 13 | `product/environment_definition_bindings.ts:660` `bind` | `workspace.bind` | reopen (own; binding forbidden), borrowed (from 11) | one synchronous stack |
| 14 | `abg/witness_definition_bindings.ts:211` `witnessOwner` | `witness.admit#reprice`, `#run-stopped` | from 11 | one synchronous stack; first-part hold |
| 15 | `abg/project_read_definition_bindings.ts:749` `runReadKernel` | `project.read` `run_status`, `run_result`, `run_replay`, `run_gaps`, `graph_call_result`, `graph_call_replay` | reopen, borrowed | one synchronous stack; first-part hold |
| 16 | `abg/project_read_definition_bindings.ts:918` `binding` | the other `project.read` members of ABG (`run_evidence`, `workspace_replay` measured) | reopen | one synchronous stack; first-part hold |

Driven without a model: 1 (start), 5, 6, 7, 10, 11, 12, 13, 14, 15 and 16.
The remaining sites are counted by reading:

- 2, 3, 4: each continuation owner runs `projectSetupTruth(entryPrefix, …)` in
  its first synchronous stage, as start does (`:1518`, `:1591`, `:1682`), and
  then awaits. Its acquired-history reads are therefore those of start's setup
  stage (12 reads over 4 basis rows, at most 3 per row, on a reopened
  resource), plus the cold copies below. Driving them needs a recorded
  continuation frontier and a transport fixture (`t287-exact-construction-intent`).
- 8, 9: before their await, each release owner projects the workspace
  environment, the artifact truth and the effectful invocation truth at the
  acquired prefix, the same projections as bind. Each needs a qualified
  release artifact.

## 3. Measurement on base

Basis body reads only; non-basis bodies stay with the history generation and
are read once per history. Column "where" splits the acquired history's
reads:

- admission: made in `withAdmissionAuthority` before the owner runs.
- owner: made by the owner outside any hold.
- held: made inside an open operation hold.

Bytes are all physical reads of the log in the operation, decode chunks
included.

| Operation | Resource | Outcome | Acquired: reads / rows / max | where: admission, owner, held | Cold copies | Cold: max per row in one copy | Decodes | Bytes read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `start-borrowed-1` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 3,291,926 |
| `start-borrowed-2` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 104,749 |
| `start-borrowed-3` | borrowed | result | 2 / 2 / 1 | 0, 2, 0 | 0 | 0 | 0 | 110,450 |
| `start-borrowed-4` | borrowed | result | 3 / 3 / 1 | 0, 3, 0 | 0 | 0 | 0 | 116,183 |
| `run_status-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `run_result-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `run_replay-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `witness-reprice-borrowed` | borrowed | refusal `content_mismatch` | 0 / 0 / 0 | 0, 0, 0 | 0 | 0 | 0 | 0 |
| `witness-run-stopped-borrowed` | borrowed | refusal `act_mismatch` | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,703 |
| `result-assess-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 10,624 |
| `materialize-context_bootstrap-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 4, 0 | 1 | 3 | 1 | 7,298,091 |
| `materialize-configuration-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 4, 0 | 2 | 3 | 2 | 14,579,741 |
| `catalog-admit-borrowed` | borrowed | refusal `conservation_failure` | 0 / 0 / 0 | 0, 0, 0 | 0 | 0 | 0 | 0 |
| `workspace-bind-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 4, 0 | 0 | 0 | 0 | 27,406 |
| `product-install-borrowed` | borrowed | refusal `target_failure` | 4 / 4 / 1 | 0, 4, 0 | 0 | 0 | 0 | 22,816 |
| `start-reopen-5` | reopen | result | 17 / 5 / 4 | 0, 17, 0 | 3 | 3 | 4 | 29,250,628 |
| `run_status-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,962 |
| `run_result-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,962 |
| `run_replay-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,962 |
| `run_evidence-reopen` | reopen | result | 0 / 0 / 0 | 0, 0, 0 | 1 | 21 | 2 | 11,362,530 |
| `run_gaps-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,962 |
| `workspace_replay-reopen` | reopen | result | 0 / 0 / 0 | 0, 0, 0 | 1 | 17 | 2 | 11,659,152 |
| `release-evidence-reopen` | reopen | refusal `not_ready` | 15 / 5 / 3 | 0, 15, 0 | 3 | 3 | 4 | 29,344,004 |
| `witness-reprice-reopen` | reopen | refusal `content_mismatch` | 15 / 5 / 3 | 15, 0, 0 | 3 | 3 | 4 | 29,344,004 |
| `witness-run-stopped-reopen` | reopen | refusal `act_mismatch` | 16 / 5 / 4 | 15, 0, 1 | 3 | 3 | 4 | 29,349,708 |
| `result-assess-reopen` | reopen | result | 16 / 5 / 4 | 15, 1, 0 | 3 | 3 | 4 | 29,354,630 |
| `materialize-context_bootstrap-reopen` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 7 | 3 | 8 | 58,743,608 |
| `materialize-configuration-reopen` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 15 | 3 | 16 | 117,479,860 |
| `catalog-admit-reopen` | reopen | refusal `conservation_failure` | 15 / 5 / 3 | 15, 0, 0 | 15 | 3 | 16 | 117,457,714 |
| `workspace-bind-reopen` | reopen | result | 20 / 5 / 4 | 0, 20, 0 | 15 | 3 | 16 | 117,490,817 |
| `product-install-reopen` | reopen | refusal `target_failure` | 20 / 5 / 4 | 0, 20, 0 | 15 | 3 | 16 | 117,495,399 |
| `materialize-context_bootstrap-growth` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 31 | 3 | 32 | 234,969,672 |
| `run_status-reopen-growth` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 31 | 3 | 32 | 234,891,504 |

Graph-call members (site 15) on the cross-cut fixture, reopened, base:
`graph_call_result` and `graph_call_replay` each read 37 basis bodies over 37
rows, at most once each, in 1,053 reads and 27,080,944 bytes, the same as
`run_status`. The cross-cut log has no materialization artifact, so there is
one decode and no cold copy.

Refusals measure the path up to the refusal:

- The witness requests reach `witnessOwner` and refuse there (`content_mismatch`
  for the reprice request, `act_mismatch` for run-stopped on a closed Run).
  The profile reprice path is the first part's measurement
  (`witness-reprice-definition-binding`).
- `catalog.admit` refuses in the catalog port. Its owner body reads no body on
  either path, by reading as well: `reconstructReadinessBasis` uses the
  approved environment.
- `product.install` refuses with `target_failure` after its await.
- `release_evidence` refuses `not_ready`, because no release artifact exists,
  after it has projected artifact truth at the acquired prefix.

## 3a. Read ports reached outside an operation hold, base (Executive addition)

TD-60C item 3 reran `t287-held-prefix` cases 1 and 3 with their input. They
call the read ports directly and read the basis body 45 and 58 times, against
restated bounds of 3 and 21. Its Return names the production callers of those
ports outside a hold. They are measured here whether or not they sit at an
acquisition site:

| # | Caller | Port calls | Body | Measured by |
| --- | --- | --- | --- | --- |
| 17 | `owner_bindings/run_invocation.ts`, the Run owners (`:1233`, `:1289`, `:1313`, `:1570`, `:1639`, `:1734`) | `projectRunTruthAtDurablePrefix`, each inside a `syncStage` | awaits between stages; each stage is one synchronous stack | the operation probe (starts), reads tagged by port frame |
| 18 | `product/project_read_definition_bindings.ts:896` `ticket_consensus` | `projectRunTruthAtDurablePrefix`, then `GraphCallProjectionPort.graph_call_result` and `graph_call_replay` on raw packets | one synchronous stack (`Effect.try`); no acquisition, it is handed `runtime.prefix` | the port-sequence probe; `t287-w2-05-install-catalog-owner-chain` drives only its refusal path |
| 19 | `abg/qualification_proof.ts:453`, `:456` `nativeRuntimeCases`, from `projectNativeRuntimeAssessment` | `GraphCallProjectionPort.graph_call_result` on a raw packet, then `projectRunTruthAtDurablePrefix` | one synchronous stack | the port-sequence probe only; no owner driven |

The port probe is `/private/tmp/abg-td51b-work/probe/ports-probe.mjs`. It runs
on the `t287-held-prefix` input: a 2,797,774-byte native Hello log with one
`basis_admitted` row of 5,672 bytes, copied once to a fixed path. Each row
runs on a freshly reopened held owner and counts every read of the log. "With
a coordinate hold" wraps the row in one `holdOperationBodies` on the owner's
coordinate, which is TD-60C's scratch shape. Values are identical with and
without the hold. Output: `/private/tmp/abg-td51b-work/out/ports-base.jsonl`
and `ports-base-hold.jsonl`.

| Call, base | Reads | Basis reads | Bytes | With a coordinate hold: reads, basis reads |
| --- | ---: | ---: | ---: | --- |
| case 1: `projectRunTruthAtDurablePrefix`, then `run_result` and `run_replay` prepared and projected | 45 | 45 | 255,240 | 1, 1 |
| `projectRunTruthAtDurablePrefix` | 19 | 19 | 107,768 | 1, 1 |
| `prepareRunReadAtDurablePrefix` `run_result`, then its projection | 19 | 19 | 107,768 | 1, 1 |
| `prepareRunReadAtDurablePrefix` `run_result`, preparation only | 19 | 19 | 107,768 | 1, 1 |
| `GraphCallProjectionPort.graph_call_result`, raw packet | 82 | 20 | 5,703,316 | 82, 20 |
| `GraphCallProjectionPort.graph_call_replay`, raw packet | 82 | 20 | 5,703,316 | 82, 20 |
| `ticket_consensus` sequence: truth, `graph_call_result`, `graph_call_replay` | 183 | 59 | 11,514,400 | 165, 41 |
| native assessment sequence: `graph_call_result`, truth | 101 | 39 | 5,811,084 | 83, 21 |
| case 3: ancestry, re-identified historical cut, then the three member reads | 58 | 40 | 3,017,639 | 19, 1 |

What it shows:

- A run read port on a retained coordinate reads the one basis body 19 times
  in one call. Each per-event selection is its own consumer. The preparation
  makes every one of those reads, and the projection it returns makes none.
- A raw-packet port admits a copy of the coordinate, and a copy never borrows
  the held owner. It decodes its own history (62 chunk reads) and reads the
  basis body 20 times in it. A hold on the coordinate does not reach that
  copy, so the coordinate-hold column leaves it unchanged.
- Run owners: the operation probe (`out/base7.jsonl`, same counts as
  `base6`) tags each read made under a frame of `project_read_ports.js`. No
  start, borrowed or reopened, makes a read under a port frame.
- The legacy `binding` reads (site 16) read the cold copy under the port
  frame: 33 reads for `run_evidence` and 85 for `workspace_replay`.

Ruling 3 applies: one port call reads one body up to 20 times.

## 4. What the measurement shows

**On the acquired history, reads made inside an open hold are once per
row.** That holds at sites 14, 15 and 16 where they read the acquired history,
on both resource kinds. **A borrowed operation re-reads no row of the acquired
history at any site**, because the held store's derivations are already made.

**Re-reads on the acquired history happen only on reopened resources, and only
where no hold is open:**

| Where | Reads / rows / max | Site | Body |
| --- | --- | --- | --- |
| `withAdmissionAuthority` → `observePrefixEnvironment` (`admission_authority.ts:227` on the built file), before the owner runs | 15 / 5 / 3 | 11 | awaits |
| Run owner setup stage (`projectSetupTruth`), then later stages | 12 / 4 / 3, then 5 more | 1 (and 2, 3, 4 by reading) | awaits |
| `materializeOwner`, after 11 | 5 / 5 / 1 (row read a fourth time) | 5 | awaits |
| `install` after its await | 20 / 5 / 4 | 7 | awaits |
| `releaseReadOwner` (`projectReleaseEvidence` → `projectOwnedPrefixArtifactTruth`) | 15 / 5 / 3 | 12 | one synchronous stack |
| `bind` (`ProductEnvironmentPort.bindWorkspace` and the binding admission over artifact truth) | 20 / 5 / 4 | 13 | one synchronous stack |

Three consumers inside one artifact-truth projection each select every basis
body with their own selected-body map: `projectExactExecutionBasisRecordAtPrefix`,
`invocation_execution_truth` and `projectArtifactTruth`. That gives three
reads per row without a hold.

**Most re-reads are on cold copies, which a hold on the acquired history does
not reach.** Every reopened operation that projects artifact truth decodes the
whole log again at the prefix of each materialization artifact:
`materializationArtifactCorresponds` (`abg/artifact_truth.ts`, `:77` on the
built file) → `projectExactPrefixWorkspaceEnvironment` →
`projectOwnedPrefixArtifactTruth` at that artifact's historical coordinate,
which has no active selection, so it is a cold read. Each cold copy reads
each of its basis rows three times, by the same three consumers. The
projection recurses through the earlier materialization artifacts at each
historical prefix. With n materialization artifacts, one projection makes
2^n − 1 cold decodes:

| Materialization artifacts n | Cold decodes in one projection | Observed in |
| --- | --- | --- |
| 1 | 1 | `materialize-context_bootstrap-borrowed` (the candidate's own check) |
| 2 | 3 | every Phase B read before the third materialization |
| 3 | 7 | `materialize-context_bootstrap-reopen` (7 = 3 in admission + 1 + 3 in the owner's candidate check) |
| 4 | 15 | `catalog-admit-reopen`, `workspace-bind-reopen`, `product-install-reopen` |
| 5 | 31 | `run_status-reopen-growth` |

At n = 5, one `run_status` read of a 3.7 MB log reads 234,891,504 bytes in
17.7 s. On the acquired history, a hold could save 10 to 15 extra basis reads
per operation, 57 to 86 KB at 5,704 bytes a body.

**The legacy `binding` hold sits on a history that the read does not use.**
For `run_evidence` and `workspace_replay`, no read goes to the acquired
history. All of them go to the cold copy that `prepareRead`
(`abg/project_read_ports.ts`) decodes from its copied coordinate. On base that
copy reads basis rows up to 21 and 17 times. The second decode is the "second
decode on the reopen path" that the TD-51 register entry retires
(design_reframe of the read port). It stays; the re-reads inside it go (the
port holds its own copy, section 7).

## 5. Rulings applied

- **Ruling 3, operations.** Two synchronous owner bodies with no hold re-read
  their own acquired history:
  - `releaseReadOwner` (12): 15 reads over 5 rows, at most 3 per row.
  - `bind` (13): 20 reads over 5 rows, at most 4 per row.

  Both now run through the one owner, with the three first-part sites (14,
  15, 16).
- **Ruling 3, read ports (Executive addition).** One port call reads one basis
  body up to 20 times (section 3a). The hold for a port call opens at the
  port's own entry, not at the acquisition site, for three reasons:
  - A port is reached where no acquisition site is on the stack: the Run
    owners' stages, `ticket_consensus` (handed a prefix), the native
    assessment, and direct callers. Only the port's entry is on every path, so
    only a hold there makes "a port reached without a hold" impossible.
  - A raw-packet port reads a cold copy that it decodes itself. No hold on
    the caller's coordinate reaches that copy (the coordinate-hold column of
    section 3a); only the port knows the history it prepared.
  - Every port entry is one synchronous stack, including when an async Run
    owner calls it from a `syncStage`. So the hold opens and closes inside one
    synchronous stack, as ruled.

  Holds nest. Inside a read owner the port's hold is the inner one, and the
  operation still reads each body once.
- **Stop on site, no change:** 1, 2, 3, 4, 5, 7, 8, 9 and 11. Each operation
  body awaits between acquisition and return, so no operation hold can open
  and close inside one synchronous stack. Their port calls are now held per
  call (17).
- **Ruling 2, no change:** 6 (no body read by the owner) and 10 (1 read of 1
  row in the owner body).
- **`ticket_consensus` (18) has no operation hold of its own.** With the port
  holds, its three port calls read the basis body once each, one per history:
  the held owner's for the truth read, and one cold copy each for the two
  raw-packet GraphCall reads. A hold on `runtime.prefix` around the whole body
  changes nothing (127 reads either way, port probe), because the two copies
  are not that history. The same holds for the native assessment (19). The
  remaining reads are the cold copies' own, in section 15.
- **Cold copies of artifact truth:** out of reach of any hold. Section 4 names
  them as the main cost. They are a residual for a ruling, not a repair here.

## 6. The owner and its call sites

The owner is `withOperationBodies(source, operation)` in
`code/src/abg/event_prefix.ts`, beside the primitive `holdOperationBodies`.
It contains the only try/finally around a hold. `holdOperationBodies` is now
called in `code/src` only by the owner (`event_prefix.ts:115`). The first
part's lane still calls it directly.

```ts
export function withOperationBodies<T>(source: DurablePrefixCoordinate | RuntimeEventPrefix, operation: () => T): T {
  const release = source.kind === "durable_prefix_coordinate" ? holdOperationBodies(source)
    : runtimePrefixBasisRetention(source)?.holdOperationBodies();
  try { return operation(); } finally { release?.(); }
}
```

A coordinate names its active held history (a cold, closed or copied
coordinate opens nothing, as before). An owned runtime prefix names its own
history, whether the active owner's or a port's cold copy. A validation or
array prefix opens nothing.

Call sites, eleven in all:

| Kind | Site | Source |
| --- | --- | --- |
| operation | `abg/project_read_definition_bindings.ts` `runReadKernel`, `binding` | `resource.entryPrefix` |
| operation | `abg/witness_definition_bindings.ts` `witnessOwner` | `resource.entryPrefix` |
| operation | `product/project_read_definition_bindings.ts` `releaseReadOwner` | `acquired.resource.entryPrefix` |
| operation | `product/environment_definition_bindings.ts` `bind` | `resource.entryPrefix` |
| port | `abg/project_read_ports.ts` `project` (every member of the port tables) | the prepared `fullPrefix` |
| port | `projectRunTruthAtDurablePrefix` | the prepared `fullPrefix` |
| port | `prepareRunRead` (`prepareRunReadAtDurablePrefix`): the preparation, and the projection it returns | the prepared `fullPrefix`, once for each |
| port | `projectClosedGraphCallTerminalAtDurablePrefix` | the prepared `fullPrefix` |
| port | `projectHistoricalGraphCallSourceAtDurablePrefix` | its `fullPrefix` |

At an operation site the catch that abandons the resource stays inside the
hold. A physical close inside it disposes the hold, and the owner's later
release is inert. The order of abandon and release is the first part's.

The interim resource form `withAbgOperationHold` (`definition_event_resource.ts`,
commit `3fbdb15f9`) is removed. A port cannot use it, because a port holds a
`RuntimeEventPrefix`, often a cold copy, and not an acquired resource. That
file is unchanged against base.

## 7. Measurement on final

Final operation probe: `/private/tmp/abg-td51b-work/out/final2.jsonl`, the
same probe on the worktree build. Every outcome, refusal code and note equals
base (`base7`). Rows that change:

| Operation | Base: acquired reads / rows / max; where | Final | Cold copy max per row, base → final | Bytes read, base → final |
| --- | --- | --- | --- | --- |
| `workspace-bind-borrowed` | 4 / 4 / 1; owner | 4 / 4 / 1; held | 0 → 0 | 27,406 → 27,406 |
| `run_evidence-reopen` | 0 / 0 / 0 | 0 / 0 / 0 | 21 → 1 | 11,362,551 → 11,202,822 |
| `workspace_replay-reopen` | 0 / 0 / 0 | 0 / 0 / 0 | 17 → 1 | 11,659,173 → 11,202,822 |
| `release-evidence-reopen` | 15 / 5 / 3; owner | 5 / 5 / 1; held | 3 → 3 | 29,344,078 → 29,286,996 |
| `workspace-bind-reopen` | 20 / 5 / 4; owner | 5 / 5 / 1; held | 3 → 3 | 117,491,113 → 117,405,390 |

Every other row has the same counts in every column and the same number of
reads. Its bytes differ by at most 320, because each probe run writes its own
timestamps into the log. The full final table:

| Operation | Resource | Outcome | Acquired: reads / rows / max | where: admission, owner, held | Cold copies | Cold: max per row in one copy | Decodes | Bytes read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `start-borrowed-1` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 3,291,928 |
| `start-borrowed-2` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 104,747 |
| `start-borrowed-3` | borrowed | result | 2 / 2 / 1 | 0, 2, 0 | 0 | 0 | 0 | 110,452 |
| `start-borrowed-4` | borrowed | result | 3 / 3 / 1 | 0, 3, 0 | 0 | 0 | 0 | 116,186 |
| `run_status-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `run_result-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `run_replay-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,704 |
| `witness-reprice-borrowed` | borrowed | refusal `content_mismatch` | 0 / 0 / 0 | 0, 0, 0 | 0 | 0 | 0 | 0 |
| `witness-run-stopped-borrowed` | borrowed | refusal `act_mismatch` | 1 / 1 / 1 | 0, 0, 1 | 0 | 0 | 0 | 5,703 |
| `result-assess-borrowed` | borrowed | result | 1 / 1 / 1 | 0, 1, 0 | 0 | 0 | 0 | 10,624 |
| `materialize-context_bootstrap-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 4, 0 | 1 | 3 | 1 | 7,298,101 |
| `materialize-configuration-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 4, 0 | 2 | 3 | 2 | 14,579,761 |
| `catalog-admit-borrowed` | borrowed | refusal `conservation_failure` | 0 / 0 / 0 | 0, 0, 0 | 0 | 0 | 0 | 0 |
| `workspace-bind-borrowed` | borrowed | result | 4 / 4 / 1 | 0, 0, 4 | 0 | 0 | 0 | 27,406 |
| `product-install-borrowed` | borrowed | refusal `target_failure` | 4 / 4 / 1 | 0, 4, 0 | 0 | 0 | 0 | 22,816 |
| `start-reopen-5` | reopen | result | 17 / 5 / 4 | 0, 17, 0 | 3 | 3 | 4 | 29,250,665 |
| `run_status-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,996 |
| `run_result-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,996 |
| `run_replay-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,996 |
| `run_evidence-reopen` | reopen | result | 0 / 0 / 0 | 0, 0, 0 | 1 | 1 | 2 | 11,202,822 |
| `run_gaps-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,996 |
| `workspace_replay-reopen` | reopen | result | 0 / 0 / 0 | 0, 0, 0 | 1 | 1 | 2 | 11,202,822 |
| `release-evidence-reopen` | reopen | refusal `not_ready` | 5 / 5 / 1 | 0, 0, 5 | 3 | 3 | 4 | 29,286,996 |
| `witness-reprice-reopen` | reopen | refusal `content_mismatch` | 15 / 5 / 3 | 15, 0, 0 | 3 | 3 | 4 | 29,344,038 |
| `witness-run-stopped-reopen` | reopen | refusal `act_mismatch` | 16 / 5 / 4 | 15, 0, 1 | 3 | 3 | 4 | 29,349,742 |
| `result-assess-reopen` | reopen | result | 16 / 5 / 4 | 15, 1, 0 | 3 | 3 | 4 | 29,354,664 |
| `materialize-context_bootstrap-reopen` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 7 | 3 | 8 | 58,743,676 |
| `materialize-configuration-reopen` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 15 | 3 | 16 | 117,479,996 |
| `catalog-admit-reopen` | reopen | refusal `conservation_failure` | 15 / 5 / 3 | 15, 0, 0 | 15 | 3 | 16 | 117,457,850 |
| `workspace-bind-reopen` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 15 | 3 | 16 | 117,405,390 |
| `product-install-reopen` | reopen | refusal `target_failure` | 20 / 5 / 4 | 0, 20, 0 | 15 | 3 | 16 | 117,495,535 |
| `materialize-context_bootstrap-growth` | reopen | result | 20 / 5 / 4 | 15, 5, 0 | 31 | 3 | 32 | 234,969,944 |
| `run_status-reopen-growth` | reopen | result | 5 / 5 / 1 | 0, 0, 5 | 31 | 3 | 32 | 234,891,776 |

Port probe on final (`out/ports-final2.jsonl`). The projected values are
identical to base for every row; only the reads change:

| Call | Base: reads, basis reads, bytes | Final: reads, basis reads, bytes |
| --- | --- | --- |
| case 1: truth, `run_result`, `run_replay` | 45, 45, 255,240 | 3, 3, 17,016 |
| `projectRunTruthAtDurablePrefix` | 19, 19, 107,768 | 1, 1, 5,672 |
| `prepareRunReadAtDurablePrefix` `run_result` and its projection | 19, 19, 107,768 | 1, 1, 5,672 |
| `GraphCallProjectionPort.graph_call_result`, raw packet | 82, 20, 5,703,316 | 63, 1, 5,595,548 |
| `GraphCallProjectionPort.graph_call_replay`, raw packet | 82, 20, 5,703,316 | 63, 1, 5,595,548 |
| `ticket_consensus` sequence | 183, 59, 11,514,400 | 127, 3, 11,196,768 |
| native assessment sequence | 101, 39, 5,811,084 | 64, 2, 5,601,220 |
| case 3: historical cut after a cold reopen | 58, 40, 3,017,639 | 21, 3, 2,807,775 |

Cases 1 and 3 land exactly on the bounds TD-60C restated: 3 reads and 17,016
bytes, and 21 reads and 2,807,775 bytes. With one more coordinate hold around
the whole case they read 1 and 19, which is the first part's single-operation
figure. The 62 chunk reads of each raw-packet GraphCall read are its own decode
of the copy; they stay.

## 8. Design text

`T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, paragraph
"O1 lifetime (RC10)", lines 1098-1123. The first part's sentences (base lines
1098-1105) are restated. They move verbatim to
`T/design/history/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN__RETIRED_SECTIONS.md`
(commit `8d6cb2f54`). Commit `80b050cb9` then edits that branch-only paragraph
in place, so only the `a7c12fab5` text is retired. Current text:

> For an operation whose body is one synchronous stack that consumer is the
> whole operation. The operation hold has one owner, `withOperationBodies`
> (`event_prefix.ts`), beside the hold primitive `holdOperationBodies`. A body
> runs through it on the history it reads; the hold opens before the body and is
> released when the body returns or throws. While it is open a body the
> operation selects is read from its location and authenticated once. Holds
> nest, and the last release drops the held bodies. An operation with its
> acquired or handed resource names the resource's durable coordinate, so the
> hold is on that coordinate's active held history; a cold, closed or copied
> coordinate opens nothing. Its return is where the operation ends, for a
> reopened resource and for a borrowed one alike. The ABG reads
> (`runReadKernel`, `binding`), the witness admission (`witnessOwner`), the
> release evidence read (`releaseReadOwner`) and the workspace binding (`bind`)
> are such operations. Each read port entry of `project_read_ports.ts` runs its
> call through it on the history it prepared: the active owner's for a retained
> coordinate, or its own cold copy for a raw packet. The entries are the port
> members (`project`), `projectRunTruthAtDurablePrefix`,
> `prepareRunReadAtDurablePrefix` and the projection it returns,
> `projectClosedGraphCallTerminalAtDurablePrefix` and
> `projectHistoricalGraphCallSourceAtDurablePrefix`. A port reached outside an
> owner's hold therefore still reads each body it selects once per call, whether
> from a Run owner's stage, `ticket_consensus`, the native assessment or a direct
> caller. An operation whose body awaits opens no hold of its own. Rollback and
> physical close dispose the operation hold too; it is not O1 retention, no O1
> gauge counts it, and `t287-held-operation-bodies.test.mjs` measures its
> physical body reads.

The first part's "a cold, closed or copied coordinate opens nothing" now
holds for the coordinate form only. A port holds its own cold copy (section
15, item 2).

## 9. Lanes

Each file ran alone in the foreground with the brief's command
(`/private/tmp/abg-td51b-work/scripts/lanes.sh`), on base (`base-root`, a
clean checkout of `a7c12fab5` built there) and on the final build of this
branch. The list is the 45 files of TD-51a (`lanes.txt`, without
`t287-reconstruction-conservation`, which TD-60B deleted), the 16 files that
reach the changed sites or the read ports (`lanes-add2.txt`) and one scratch
copy (`zz-td51b-held-prefix-main`, below). Output is in
`/private/tmp/abg-td51b-work/lanes-before-all/` and `lanes-after/`.

Two copies run on base only to show the new assertions fail there:
- `t287-held-operation-bodies-td51b`, the extended lane: 1 / 0 / 1 / 0. It
  fails at the first new assertion, `run_truth: each basis body is read at
  most once within the port call: {"37":13}`.
- `zz-td51b-held-prefix-main`, `t287-held-prefix` as main carries it after
  TD-60C (`d101f9e81`), run in both trees. Its rooted cases 2, 4 and 5 are
  stubbed to skip because this branch lacks their catalogue row (section 14);
  cases 1 and 3 run on their own input. On base, case 1 reads 45 bodies
  (255,240 bytes) against 3 (17,016) and case 3 reads 58 (3,017,639) against
  21 (2,807,775). On the final build both pass at exactly those bounds.

| Lane | Before: tests / pass / fail / skip | After | Seconds, before → after |
| --- | --- | --- | --- |
| `t287-held-operation-bodies` | 1 / 1 / 0 / 0 (the extended file on base: 1 / 0 / 1 / 0) | 1 / 1 / 0 / 0 | 46 → 62 |
| `t287-held-basis-lifetime` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 | 43 → 41 |
| `t287-route-reconstruction` | 12 / 11 / 0 / 1 | 12 / 11 / 0 / 1 | 9 → 10 |
| `t287-held-prefix` | 5 / 0 / 0 / 5 | 5 / 0 / 0 / 5 | 1 → 0 |
| `t287-ordered-reconstruction` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 0 → 1 |
| `m5-fresh-process-reconstruction` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 46 → 45 |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 27 / 27 / 0 / 0 | 65 → 63 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 | 21 → 14 |
| `m5-event-calculus-runtime` | 18 / 18 / 0 / 0 | 18 / 18 / 0 / 0 | 92 → 54 |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 343 → 27 |
| `r10-projection-contracts` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 | 2 → 2 |
| `t287-owned-call-reference` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 47 → 47 |
| `t287-held-owner-fold-reuse` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 44 → 42 |
| `t287-exact-prefix-projection-reuse` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | 49 → 47 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 | 268 → 256 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 30 → 28 |
| `t287-native-workspace-work` | 43 / 43 / 0 / 0 | 43 / 43 / 0 / 0 | 2 → 2 |
| `witness-reprice-definition-binding` | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 | 5 → 5 |
| `t287-cross-cut-public-read` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 605 → 56 |
| `r10-child-proof` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 | 117 → 13 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 54 → 52 |
| `integration-shared-seams` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 | 2 → 1 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 306 → 296 |
| `t287-conformance-owner-reuse` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 0 → 0 |
| `t287-governance-covered-source-use` | 9 / 7 / 0 / 2 | 9 / 7 / 0 / 2 | 7 → 7 |
| `t287-installed-product-coordinate` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 | 3 → 3 |
| `t287-interrupted-event-resource-recovery` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 4 → 4 |
| `t287-public-terminal-projection` | 3 / 0 / 0 / 3 | 3 / 0 / 0 / 3 | 1 → 1 |
| `t287-release-acceptance` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 | 5 → 5 |
| `t287-required-operation-bindings` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 | 233 → 223 |
| `t287-runtime-failure-diagnostic` | 21 / 21 / 0 / 0 | 21 / 21 / 0 / 0 | 4 → 4 |
| `t287-single-address-space-consolidation` | 17 / 17 / 0 / 0 | 17 / 17 / 0 / 0 | 530 → 516 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 126 → 125 |
| `t287-undispatched-diagnostic` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 1 → 1 |
| `t287-w2-05-install-catalog-owner-chain` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 83 → 84 |
| `t287-w2-05-static-binding-algebra` | 4 / 3 / 0 / 1 | 4 / 3 / 0 / 1 | 1 → 1 |
| `t291-m6-admission-refusal-surface` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 1 → 1 |
| `t292-td34a-run-invocation-schema-owner` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 0 → 0 |
| `witness-run-stopped-definition-binding` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 3 → 3 |
| `t292-td32-legacy-store-door` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 2 → 2 |
| `t287-readable-stops` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 223 → 208 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 38 → 37 |
| `t292-td36r-admitted-binding-owner` | 1 / 1 / 0 / 0 | 1 / 0 / 1 / 0; 1 / 1 / 0 / 0 with the basis refreshed for the final build | 32 → 6 |
| `t292-td36r-bind-door-strings` | 6 / 6 / 0 / 0 | 1 / 0 / 1 / 0; 6 / 6 / 0 / 0 with the basis refreshed for the final build | 32 → 5 |
| `t292-td36s-bind-string-rule` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0; 7 / 7 / 0 / 0 with the basis refreshed for the final build | 40 → 40 |
| `t287-native-owner-reuse` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 | 0 → 0 |
| `t287-native-work-reacquisition` | 8 / 7 / 0 / 1 | 8 / 7 / 0 / 1 | 1 → 1 |
| `t287-owned-native-proof` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 1 → 0 |
| `t287-readable-stops-foldback` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 73 → 74 |
| `t287-recursive-failure-foldback` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 105 → 107 |
| `t287-recursive-registered-selection` | 7 / 6 / 0 / 1 | 7 / 6 / 0 / 1 | 77 → 78 |
| `t287-release-publication` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 | 2 → 2 |
| `t287-retained-installed-consumer` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 1 → 0 |
| `t287-native-runtime-gate` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 | 13 → 13 |
| `t287-qualification-scopes` | 24 / 24 / 0 / 0 | 24 / 24 / 0 / 0 | 4 → 4 |
| `t287-qual056-material` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 | 3 → 3 |
| `t287-qualification-contraction` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 1 → 2 |
| `t287-qualification-producer-context` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 | 2 → 1 |
| `t287-qualification-producer-acquisition-reuse` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 | 17 → 17 |
| `t287-malformed-gtl-gate` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 | 1 → 1 |
| `t287-native-structural-gates` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 | 3 → 3 |
| `zz-td51b-held-prefix-main` | 5 / 0 / 2 / 3 | 5 / 2 / 0 / 3 | 1 → 3 |

| Totals (62 files) | Tests | Pass | Fail | Skip |
| --- | ---: | ---: | ---: | ---: |
| before | 477 | 451 | 2 | 24 |
| after, committed basis | 472 | 446 | 2 | 24 |
| after, basis refreshed for the final build | 477 | 453 | 0 | 24 |

The per-test comparison (TD-25R's `tapcmp.py`, by test name and outcome) is
the same in 59 files. It differs in three:
- `zz-td51b-held-prefix-main`: cases 1 and 3 go from `not ok` to `ok`.
- `t292-td36r-admitted-binding-owner` and `t292-td36r-bind-door-strings` go
  from `ok` to `not ok` on the committed basis. Each refuses before its cases
  run with `artifact_digest_mismatch`: their root candidate basis
  (`test_env/fixtures/abi5-root-candidate-basis.json`) pins the packed artifact
  of `a7c12fab5`, and any source change moves it. `t292-td36s-bind-string-rule`
  pins nothing and passes on both.

With the basis refreshed in place for the final build (`refresh-final2.log`;
artifact `sha256:128cf2d4…`, section 12), the three pinned lanes pass 1 / 1 /
0 / 0, 6 / 6 / 0 / 0 and 7 / 7 / 0 / 0, and their per-test comparison with base
is the same (`/private/tmp/abg-td51b-work/lanes-after-refreshed-basis/`). The
fixture was then restored with `git checkout`. Its refresh belongs to the merge
that carries this source.

The 24 skips are the same tests before and after. 21 wait on a retained
fixture, a live selector or a frozen proof root named in their skip message
(for example `ABI5_HELD_PREFIX_NATIVE_FIXTURE unset`), and 3 are the rooted
cases of the scratch held-prefix copy.

Seconds are wall time on a shared machine with other Writers' builds running.
They are not a timing measurement (section 11 is). The large drops
(`t287-cross-cut-public-read` 605 → 56, `t287-historical-source-resource`
343 → 27, `r10-child-proof` 117 → 13) were not rerun under equal load, and
the cross-cut lane's diagnostics, the same on both builds apart from the
product content digest, show unchanged read counts.

## 10. Replay comparison

Eleven logs (`/private/tmp/abg-td25r-work/replay-logs.txt`), base build against
the final build.

- Array prefixes: TD-25R's `/private/tmp/abg-td25r-work/scripts/replay-log.mjs`
  replays the whole log and each Run against full authority. Base and final
  outputs are byte-identical, 11 of 11 (`/private/tmp/abg-td51b-work/replay/array-base.jsonl`,
  `array-final2.jsonl`). Seven logs replay. Four refuse at decode with the
  same message on both builds.
- Reopened histories: the first part's `owned-replay.mjs` (copied to
  `/private/tmp/abg-td51b-work/probe/`). It reopens each log at one fixed copy
  and reads it through the owned path: whole replay, held fluents, F_H
  projection, and per Run the scoped replay with `run_status`, `run_result`
  and `run_replay`. Base and final outputs are byte-identical, 11 of 11,
  including the read counters (`owned-base.jsonl`, `owned-final2.jsonl`).
  Seven logs reopen, and four refuse reopen with the same codes.
- Cross-cut fixture (`t287-cross-cut-public-read`'s log, reopened):
  - `run_status`, `graph_call_result` and `graph_call_replay` give
    byte-identical owner outputs on base and final, with digests
    `sha256:af1e8982…`, `sha256:13db0774…` and `sha256:fa59ad88…`;
  - read counts are unchanged (1,053 reads, 27,080,944 bytes, 37 basis bodies
    once each);
  - output is in `out/crosscut-base/` and `out/crosscut-final2/`.

## 11. Timing

Live rc.12 store (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
1,695 rows, 14,506,732 bytes), copied once to a fixed path. Each read is a
fresh process doing one reopen-handoff Definition read of the last Run, base
and final interleaved, five of each (`/private/tmp/abg-td51b-work/scripts/timing.sh`,
`timing3.sh`). Load averages were 9 to 15 (1 minute) on 16 cores, with the
base lane run active.

| Read | Base wall ms (5 runs) | Base median | Final wall ms (5 runs) | Final median | Change | CPU median ms, base → final | Reads / bytes, base → final |
| --- | --- | ---: | --- | ---: | ---: | --- | --- |
| cold read `run_status` (site 15) | 2,194 2,134 2,352 2,327 2,217 | 2,217 | 2,147 2,184 2,267 2,156 2,178 | 2,178 | −1.8 % | 2,339 → 2,315 | 1,919 / 29,059,114, unchanged |
| Run operation `run_replay` (site 15) | 2,298 2,257 2,219 2,215 2,231 | 2,231 | 2,284 2,283 2,248 2,315 2,271 | 2,283 | +2.3 % | 2,443 → 2,366 | 1,919 / 29,059,114, unchanged |
| Run operation `run_evidence` (site 16, legacy `binding`) | 3,423 3,494 3,387 3,484 3,486 | 3,484 | 2,275 2,239 2,222 2,265 2,226 | 2,239 | −35.7 % | 3,623 → 2,357 | 4,489 / 87,647,119 → 2,175 / 44,776,915 |

Output digests are identical on base and final for each read:
- `run_status`: `sha256:9c1cb902…`
- `run_replay`: `sha256:29b80c81…`
- `run_evidence`: `sha256:260b686e…`

`run_status` and `run_replay` read the same bytes on both builds, and their
change is within run-to-run spread. `run_evidence` reads its cold copy's
basis rows once instead of up to 21 times. No regression.

## 12. Build, lints and identity digests

On the final source: `npm run build` exits 0 (`/private/tmp/abg-td51b-work/build-final2.log`).
`lint:imports` (3 forbidden owner pairs hold), `lint:lifecycle` (289
modules, no offender) and `lint:calculus` (6 modules, no offender) each exit
0.

Identity of the final build, before restoring generated files. Base is
`base-root`'s own build of `a7c12fab5`, which equals the manifest committed
there.

| Identity | Base (`a7c12fab5`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:ec1eeeb5fa76a1e6fdf30d530b21e2d7273a88728d47f75bf224e2e180330d5e` | `sha256:2e634ce342235f299ce3bbc31db78fc57348840d9fa0ea4a48a33123f8cf94ab` |
| `contributionManifestDigest` | `sha256:a0c644912a79fa966685507d4f61cecafe08453071e37abfb141a8b43071fe61` | `sha256:c45705199dffd0ce38aa958ac1933c3e5b5f22ce49c385ed20fcea19c153a8fc` |
| `publicContractCatalog.catalogDigest` | `sha256:f50983c13717d19df32ece7294cc964aa5150ee78316b6d0272736ee027dc0b8` | unchanged |
| capability graph `graphDigest` | `sha256:351e8e2181682b6f44da18e286edb31bc407bda9a1abb3ecb56857e709359130` | `sha256:ddcd06bb6ba048ca596de3c9ce4d8d4ba24105a2bcb37680303a835dcc4fea51` |
| capability graph file `contentDigest` | `sha256:448499d5274ce58bc3189d557f47cd5a154a43dded21519ae01563afa72b0140` | `sha256:e0eb83ca1724cb55f9d69d4150610e848557a6f40d62bd0d7a7c32b9c9602258` |
| packed artifact `artifactDigest` (refresh script) | `sha256:b6fe04982eb7264e95ecc9fd448c720c0830da48566ac643a8aebdd3f3dde125` | `sha256:128cf2d43a2897b39cf2c73dfb54a6bba2dab97810dcfd7f83edaca0b1feb80e` |
| packed artifact `manifestDigest` | `sha256:1d395d9ce9ed079ebad819bf27bbd406e8cb285ed367e024fd37278bf8c343e6` | `sha256:16edaa1c6218a67fbd4da8e9f06bdbea260e90bae189384b1ce6161ea44a90e6` |

The build changes one line in each of `contracts/capabilities/capability-definition-graph.json`
and `product-toolchain-manifest.json`. Both are restored before every commit,
so the branch carries no generated file.

## 13. Lines changed

`git diff --numstat a7c12fab5` at `07b517335`:

| File | Added | Removed |
| --- | ---: | ---: |
| `code/src/abg/event_prefix.ts` | 18 | 0 |
| `code/src/abg/project_read_definition_bindings.ts` | 5 | 11 |
| `code/src/abg/project_read_ports.ts` | 14 | 8 |
| `code/src/abg/witness_definition_bindings.ts` | 3 | 6 |
| `code/src/product/environment_definition_bindings.ts` | 4 | 2 |
| `code/src/product/project_read_definition_bindings.ts` | 4 | 2 |
| `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 26 | 8 |
| `design/history/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN__RETIRED_SECTIONS.md` | 13 | 0 |
| `test_env/tests/t287-held-operation-bodies.test.mjs` | 110 | 1 |

`code/src`: +48 −29, the same with whitespace ignored. In total, outside this
Return: +197 −38.
`definition_event_resource.ts` is unchanged against base.

## 14. Deviations

- **Owner placement (ruling 3).** The owner sits in `abg/event_prefix.ts`
  beside its primitive, not in or beside `definition_event_resource.ts`.
  - A port has no acquired resource. It holds a `RuntimeEventPrefix`, often
    a cold copy it decoded itself.
  - `definition_event_resource.ts` owns acquired Definition resources and
    imports product admission and verification.
  - Neither placement creates a new import cycle: the two modules already
    reach each other transitively. No lint rule forbids either one. This
    needs a ruling (section 15).
- **Interim commit.** The first source commit (`3fbdb15f9`) added the
  resource form `withAbgOperationHold` in `definition_event_resource.ts`.
  The second source commit replaces it with `withOperationBodies` after the
  Executive's addition, so `definition_event_resource.ts` ends unchanged.
- **How the lanes ran.**
  - Lanes before ran on `base-root`, an rsync copy of `a7c12fab5` without
    `.git`, with its own build. Lanes after ran on the worktree build.
  - Each set ran one file at a time, one process per file, through
    `/private/tmp/abg-td51b-work/scripts/lanes.sh`. The runner was started in
    the background and waited on.
  - Measurement and timing probes, which are not test files, overlapped the
    base lane run.
- **Scratch lane copies.**
  - The extended `t287-held-operation-bodies` ran on base as a scratch copy
    in `base-root`.
  - Main's `t287-held-prefix` (after TD-60C) ran as an uncommitted scratch
    copy, `zz-td51b-held-prefix-main.test.mjs`, in both trees. Its rooted
    cases are stubbed absent because this branch lacks their catalogue row.
    The copy was deleted after the run.
- **Generated files.** They stayed modified in the working tree during the
  lanes. The candidate basis fixture was refreshed for the three pinned lanes
  and then restored. None is committed.
- **Callers by reading only.**
  - Sites 2, 3 and 4 are counted by reading.
  - Sites 8 and 9 are counted by reading.
  - Caller 18 (`ticket_consensus`) and caller 19 (the native assessment)
    are measured by their port sequences. No owner of theirs is driven to a
    result.

## 15. Residuals and items that need a ruling

Residuals, measured and not repaired here:

1. **Artifact-truth cold copies.** `materializationArtifactCorresponds`
   decodes the whole log again at each materialization artifact's prefix,
   recursively. That is 2^n − 1 cold decodes per projection. At n = 5 one
   `run_status` read of a 3.7 MB log reads 235 MB in about 17 s (section 4).
   No hold reaches these copies. This is a design_reframe of
   `abg/artifact_truth.ts`.
2. **Raw-packet port copies.** A port given a raw packet decodes its own copy
   of the history. On the 2.8 MB held-prefix log that is 62 chunk reads and
   5.6 MB. Each copy now reads its basis rows once, not up to 20 times; the
   decode itself stays.
   - `ticket_consensus` makes two such decodes per call.
   - The native assessment makes one.
   - The legacy `binding` makes one. This is the TD-51 "second decode on the
     reopen path".
3. **`withAdmissionAuthority`, before its first await.** On a reopened
   resource it reads 15 basis bodies, at most 3 per row, outside any hold. The
   stretch is synchronous, but the body awaits, so no hold is opened there.
4. **Run owner setup stage.** `projectSetupTruth` reads 12 bodies over 4 rows,
   at most 3 per row, on a reopened resource, behind async stages.
5. **Rollback disposal.** Rollback disposal of the operation hold is coded but
   not driven by a lane, as in the first part.

Items that need a ruling:

1. **Owner module.** The owner is `withOperationBodies` in `event_prefix.ts`,
   beside `holdOperationBodies`. Ruling 3 named "in or beside
   `definition_event_resource.ts`". Accept this placement, or move it with a
   resource-or-prefix signature into `definition_event_resource.ts`, which
   the ports would then import (section 14).
2. **Holds on a port's own cold copy.** The first part stated "a cold, closed
   or copied coordinate opens nothing". It now holds only for the coordinate
   form. A port also holds the copy it decoded for its own call, and drops it
   at return. Accept this, or restrict port holds to active histories. The
   restriction would leave raw-packet ports reading the basis body up to 20
   times per call, and the legacy `binding` up to 21.
3. **Synchronous stretch of `withAdmissionAuthority` (residual 3).** A hold
   around the environment observation before the first await would cut 15
   reads to 5 on reopened resources. Does the operation-level rule ("an
   operation whose body awaits opens no hold") bar a hold over a synchronous
   stretch of such a body?
4. **Expected proof after both merges.** `t287-held-prefix` cases 1 and 3,
   with their input present, at the bounds TD-60C restated: 3 reads (17,016
   bytes) and 21 reads (2,807,775 bytes). Section 9 shows them passing at
   those bounds on this build through main's file as a scratch copy. The
   Executive reruns the committed file after the merges.

## 16. Commits

On `claude/td51b-operation-hold-owner`, from `a7c12fab5`, none pushed:

| Commit | Content |
| --- | --- |
| `9f31cfb1a` | measurement: body reads per operation at every acquisition site |
| `8d6cb2f54` | design: the operation hold has one owner; base text retired verbatim |
| `3fbdb15f9` | source and lane: `releaseReadOwner` and `bind` held (interim resource form) |
| `42c4cc1df` | measurement: read ports reached outside an operation hold (Executive addition) |
| `80b050cb9` | design: the read ports hold the history they prepare |
| `07b517335` | source and lane: `withOperationBodies` in `event_prefix.ts`; five port entries |
| this commit | the Return |
