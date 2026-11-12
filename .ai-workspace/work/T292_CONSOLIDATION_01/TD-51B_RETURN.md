# TD-51b Return: body reads per operation at every event-resource acquisition site

Writer: Claude Opus 5.5. Branch `claude/td51b-operation-hold-owner` from local
`main` at `a7c12fab5`, worktree `/private/tmp/abg-td51b`. Change class:
realization_refactor. No push, no tag.

**Status: measurement only (ruling 1). This commit is the Return skeleton; the
repair, the proof and the final status follow in later commits.**

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
(`abg/project_read_ports.ts`) decodes from its copied coordinate. That copy
reads basis rows up to 21 and 17 times. This is the "second decode on the
reopen path" that the TD-51 register entry retires (design_reframe of the read
port).

## 5. Rulings applied

- Ruling 3 applies. Two sync owner bodies with no hold re-read their own
  acquired history:
  - `releaseReadOwner` (12): 15 reads over 5 rows, at most 3 per row.
  - `bind` (13): 20 reads over 5 rows, at most 4 per row.
  The hold gets one owner beside the resource owner. Sites 12 and 13 and the
  three first-part copies (14, 15, 16) use it.
- Stop on site, no change: 1, 2, 3, 4, 5, 7, 8, 9 and 11. Each operation body
  awaits between acquisition and return, so no hold in the ruled shape can
  open and close inside one synchronous stack.
- Ruling 2, no change: 6 (no body read by the owner) and 10 (1 read of 1 row
  in the owner body).
- Cold copies: out of reach of the hold. Section 4 names them as the main
  cost. They are a residual for a ruling, not a repair here.
