# RP-1: the qualification law (Worker, Opus 5.5, 2026-10-29)

Commentary record of package RP-1 of T-287 Phase D (release resumption, the refactor plan). This record is not law.
Base `8a1d1759a642104e4055d1c3e43bf9a5c2384b38` (tenant tree equal to D5-c commit 1 `92498a2d2`). Commit 1 `8db237d2a379e39be100f4fd7f0cd9f7e02525ac`.
No provider call; 0 USD (`cost.json`).

## Outcome

RP-1 closes item 1, item 4 and item 5. It has two stops:

- **Item 3** stops at the trace. No admitted fact states the assessor's identity.
- **Item 2's target** is not met. The plan check is fixed: on the D5-c plan it drops from 59,457 ms to 55 ms with the memo cold and 24 ms with it warm. The whole start drops from 280,197 ms to 14,082 ms with the memo cold and 13,123 ms with it warm. In the dry mode's single run over the whole plan, the median start is 11,888 ms and the mean 27,363 ms. The remaining cost is in `validator/qualification_resources.ts`, which is outside the code grant, together with heap pressure.

The 056 rule slot shrinks from 8,444,138 to 567,941 bytes. The coverage slot shrinks from 8,242,250 to 345,475 bytes. Both are under the 1,048,576-byte bound.

## Item 1 (P1): the fold names the compact verification material

### Realization

**The material entry.** `validator/qualification.ts` `qualificationVerificationMaterialEntry` builds it:
- the ref is `qualification-verification-material://abiogenesis/` followed by the hex of `qualificationHash(executionSelectionRef)`;
- the path equals the ref;
- the bytes are the material's canonical JSON, and the digest is taken over those bytes.

`abg/qualification_proof.ts` `resolveQualificationExecutionMaterial` builds it beside the material and returns `{ evidence, verification, verificationEntry }`.

**The fold.** `validator/self_conformance.ts`:
- admits the entry among a task's known materials, by canonical equality;
- requires the recipe ref and the entry ref for a REQ-P-QUAL-056 rule slot, at both required-ref sites;
- requires the criterion's `evidenceRefs` to name the entry ref, at the former `:117`.

The fold's disposition rules are otherwise unchanged.

**The execution entries.** `abg/qualification_proof.ts` `qualificationExecutionEntry` renders each execution entry. It is pure over its arguments, so every path renders the same bytes. An entry carries:
- the Result coordinate with `contractRef` and `resultClass`;
- the judgment;
- the evidence rows, by `evidenceClass`, `evidenceDigest` and their `*Ref` fields;
- the origin block, when the selection comes from another run's source.

For a worksite execution observation, the value is replaced by:
- the observation coordinate;
- the command outcomes: exit status, timeout, signal, termination, and each stream's digest and byte length;
- the parsed test summaries (`observedQualificationTestSummaries`);
- the product delta.

No stream payload enters an entry. The observed C2 Result remains reacquirable by its coordinate.

### (d) Consumers, each restated and proven

**Product**

| Consumer | What changed |
| --- | --- |
| `abg/qualification_proof.ts` `resolveQualificationExecutionMaterial` | The producer. It now renders through `qualificationExecutionEntry` and returns the entry. |
| `abg/qualification_proof.ts` `resolveQualificationExecutionEvidence` | The `abg/index.ts` export. Its rows are now compact, and a non-C2 value is carried whole. |
| `validator/self_conformance.ts` `evaluateSelfConformance` | The fold. |
| `validator/qualification.ts` | The constructor, and the test-summary reader for observations. |

Four consumers needed no edit:
- `validator/qualification_contracts.ts`: `QUALIFICATION_MATERIAL_SCHEMA` admits any ref, and `QUALIFICATION_VERIFICATION_SELECTION_SCHEMA` gains no key.
- `implementation/release_publication.ts`: it reads the verification material through `QUALIFICATION_VERIFICATION_MATERIAL_SCHEMA`, and that material is unchanged.
- `validator/self_conformance_contracts.ts`.
- `contracts/schemas/self-conformance.schema.json`: the owner command reproduces it byte for byte.

**Test territory**

| Module | What changed |
| --- | --- |
| `test_env/qualification/execution-material.mjs` | Renders through the installed `qualificationExecutionEntry`, through `verificationEntry`, and through `renderedEntryBytes`. |
| `test_env/qualification/assessment-plan.mjs` | A verification-bound rule slot carries the verification entry. The coverage slot carries the execution entry. |
| `test_env/qualification/build-resources.mjs` | The `qualificationProof` deep export. |
| `test_env/qualification/dispatch.mjs` | Plans over both entries. |
| `test_env/support/exact-candidate-qualification.mjs` | The execution-material mode, the dry mode and the live mode build and check both entries. |

**Lanes**

These lanes assert the entry's shape: `t287-qualification-contraction`, `t287-qualification-producer-context`, `t287-qual056-material` and `t287-qualification-scopes`. Their non-C2 values are carried whole, so their assertions hold. Two lanes read entries for diagnostics only: `t287-qualification-parent-alias` and `t287-qualification-producer-acquisition-reuse`.

No module outside the code grant was edited for item 1.

### (e) A ref-form rule, not a new material kind

`QUALIFICATION_MATERIAL_SCHEMA` already admits any ref and path, so no schema changes. The entry's form is fixed by its constructor. F11 admits a task's entry only when it is canonically equal to the entry F11's own native join constructs.

`QUALIFICATION_VERIFICATION_SELECTION_SCHEMA` gains no key. `node scripts/generate-qualification-rule-catalog.mjs`, run from the tenant root after the build, leaves `contracts/qualification/**` and `contracts/schemas/self-conformance.schema.json` byte-identical.

### (f) Sizes (`sizes.json`)

Each figure comes from the driver's execution-material mode over a fresh prepare archive.

| Slot | Before (base build, reproduced) | After (RP-1 build) | Bound |
| --- | --- | --- | --- |
| 056 rule slot (`rule/manifest/.gitignore/1`) | 8,444,138 | 567,941 | 1,048,576 |
| coverage slot | 8,242,250 | 345,475 | 1,048,576 |

The entries:
- **The execution entry** is 128,378 bytes, against the 7,528,927-byte whole state it replaces.
- **The verification entry** is 146,788 bytes.

The class-bound findings go from 2 to 0.

### (g) REQ-P-SELF-CONFORMANCE-009 seeded negatives

There is one new case in `t287-qual056-material`. It uses a small published catalog whose rule group governs REQ-P-QUAL-056, the real verification material rebased onto the fixture basis, and the native join's honest entries supplied explicitly.

**The honest task** passes. The `semantic_assessment_required` finding for the rule group is `passed`, with provenance `J`.

**Four seeded tasks** are each `blocked_incomplete` with `J_required`, and the overall disposition is not `passed`:
- a material whose stream digest differs;
- the entry missing from the task;
- a material over a different execution coordinate;
- a criterion citing the execution coordinate in place of the entry.

The existing cases keep their expected values: the lane went from 7 to 8 tests.

## Item 2 (P2): the plan check by hashed sets (`timing.json`)

### Realization

`qualificationPlanMatches` compares the canonical keys of criteria (`qualificationHash`, which is equivalent to `canonicalEquals`) through sets. Every refusal is kept, and each one has a falsifier in `t287-qualification-scopes`:
1. a criterion missing from the slots;
2. an extra criterion;
3. a criterion repeated across slots under `disjoint`;
4. a criterion repeated in the plan;
5. a criterion repeated within one slot;
6. a single peer;
7. peers that are not unique;
8. independence not declared;
9. empty slot coverage;
10. a duplicate `slotRef`.

A memo of at most 64 entries, keyed by `planDigest`, is consulted only after `qualificationIdentity` has bound that digest to the plan's bytes. Its falsifier is a forged plan under the same digest, which `qualificationIdentity` still refuses.

### The exact D5-c plan

The plan is `qualification-plan://abiogenesis/502196d7…`, with 408 slots and 5,690 criteria. Each figure is the median of five fresh processes over the identical serialized input.

| Check | Base | RP-1 |
| --- | --- | --- |
| `qualificationPlanMatches`, memo cold | 59,457 ms | 55 ms |
| `qualificationPlanMatches`, memo warm | — | 24 ms |
| `qualificationIdentity` | 26 ms | 26 ms |
| `isQualificationAssessmentInput` after the plan check | 53,104 ms | 31 ms |

### The whole start

A start is `startCall` plus `admitCall` for slot 0, undispatched.

| Build and plan | Runs (ms) | Median | `startCall` / `admitCall` |
| --- | --- | --- | --- |
| Before: the base build on the D5-c plan, 408 slots and 5,690 criteria; five runs in one process | 282,471, 280,197, 278,984, 284,332, 279,795 | **280,197 ms** | 55,473 / 224,725 ms |
| After: the RP-1 build on the RP-1 plan of the same candidate, 478 slots and 5,825 criteria; memo cold, five fresh processes | 14,082, 13,971, 14,205, 14,024, 14,298 | **14,082 ms** | about 1,650 / 12,400 ms |
| After, memo warm (the second start in each of the five processes) | | **13,123 ms** | |

**The two runs.**
- The base build has no memo, so each of its in-process runs equals a fresh-process run.
- D5-c recorded 59,516 plus 241,135 ms.
- The 1-minute load average was 3.5 to 4.7 before and 5.5 to 7.5 after.

**Why the plans differ.** 70 of the 77 slots that were outside the D5-c plan now fit:
- the 69 REQ-P-QUAL-056 rule slots and the coverage slot, each of which carried the whole C2 Result;
- 7 slots remain outside the plan.

### The other scans, measured

A profile of one fresh RP-1 process gives the share of each start:

| Path | Per start | Where |
| --- | --- | --- |
| `startCall` | 1.65 s | catalog admission and `resolveProductExecution` in `rootAuthority`, `dispatch.mjs:39` |
| `admitCall` | 11.95 s | |
| └ `acquireQualificationResources` | 10.23 s | |
| &nbsp;&nbsp;└ the provenance record-set rehash | **8.78 s** | `qualification_resources.ts:64-67` and `:179-186` |
| &nbsp;&nbsp;└ manifest identity | 0.75 s | |
| &nbsp;&nbsp;└ `validateEntry`, the material base64 round-trip and hash | 0.32 s | |
| &nbsp;&nbsp;└ `value()`'s linear `entries.find` | 0.26 s | |
| └ `resolveProductExecution` | 0.51 s | |
| └ the granted modules, together | under 0.5 s | |

The granted modules' share is the plan check, 118 ms; `isQualificationAssessmentInput`, 143 ms; and `establishQualificationAssessment`, 157 ms. Nothing in the granted modules dominates the start.

### The whole plan in one process

`timing.json` `inRun` holds the dry mode's 478 starts in one process: median 11,888 ms, mean 27,363 ms, bimodal under heap pressure. Item 5 below gives the detail.

### Stop (item 2's target)

**The cost.** `QualificationResources` is rebuilt for every acquisition, which means every start. Its constructor resolves every provenance entry. `provenance()` re-serializes and re-hashes each view's whole record set, `hash(records)` against `p.recordSet.digest`. That is 8.8 s of each 13 to 14 s start.

**Why it stops here.** `validator/qualification_resources.ts` is outside the code grant. The class also states that complete views are "never inferred from another invocation", so a cross-acquisition memo is a design question.

**The sketch of a repair.** A per-process memo of verified record sets keyed by each record's ref, path, digest and byteCount. It is sound because `validateEntry` binds every record's bytes to its digest and byte count. The rest of the start would then be about 4.7 s warm. The repair needs a grant, and possibly a design ruling.

## Item 3 (P3): stop at the trace

No admitted fact states the assessor's identity as `actor-identity://<provider>/<model>`.

**The sites.**
- `validator/qualification_contracts.ts:110-121`: the role policy has `actorRef`s `actor://abiogenesis/qualification/assessor-primary@5` and `assessor-peer@5`, and a worker binding ref. It has no identity.
- The judgment source schema: `actorRef`, `workerBindingRef`, `actorInvocationRef` and the transport binding ref and digest. No identity.
- `abg/result_evidence_lineage_contracts.ts:13-23`: the probabilistic-transport metadata. No identity.
- `abg/actor_process.ts:924-1003` and `abg/event_store.ts:580`: the binding payload of `actor_transport_binding_admitted` carries `agentKey`, `command`, `args` and `cwd`. The model appears only as an argument string.
- `abg/transport_contracts.ts:242-270` and `:338-356`: the Claude transport has no model argument. The model reaches `args` only through `ABG_TS_CLAUDE_APPEND_ARGS`, set from the operator config's `provider.model` (`test_env/uat/runner.mjs:102`). In the D5-c `provider-environment.json` that is `["--model","claude-opus-5-5",…]`.
- The construction-provenance identity is `actor-identity://anthropic/claude-opus-5.5`, which differs in form from the model token `claude-opus-5-5`.

**Recommendation.** Declare an `actorIdentityRef` on the assessor's worker binding or transport binding. That is a contract addition, and the owner decides it.

**The other parts of item 3.**
- (a) and (c) depend on that fact and stop.
- (d) holds trivially.

## Item 4: the census (`census.json`)

The chains were rebuilt by `test_env/qualification/provenance.mjs` `constructChains(chainCommits('92498a2d2'), …, {inheritedBase: false})`: 23 commit chains, 16 by Opus 5.5 and 7 by Fable 5.1, with no owner commit.

The inherited-base scope is the tenant tree at `51bc5d2d8`, 1,170 members. It comes from `git ls-tree -r --full-tree --name-only`, the same listing as the module's `treeBlobs`, so the ticket is not read.

The census covers the committed inventory, 1,191 members.

| Identity set | Members |
| --- | --- |
| Predecessor only | 1,060 |
| Predecessor and Opus | 100 |
| Predecessor and Fable | 2 |
| All three | 2 |
| Opus only | 26 |
| Fable only | 1 |
| Both models without the predecessor | 0 |
| **Total** | **1,191** |

**Members Fable covers (5).**
- Both models (2):
  - `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`
  - `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md`
- Predecessor and Fable:
  - `design/ABI5_REALIZATION_CONSTITUTION.md`
  - `design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`
- Fable only:
  - `release-claim.md`

**Last constructing chain.** 1,060 members were last constructed by the predecessor, 126 by Opus and 5 by Fable.

## Item 5: the test territory restated, and the dry mode re-proved (`dry-run.json`)

The five modules are restated in their headers and comments as the law change touches them. `time-projection.mjs` `projectTime` takes the measured start as `startMs`. The dry mode passes it the mean of its assess@5 starts, which adds `preparation` and `sequentialWithPreparation*`.

### The re-proved dry mode

The dry mode ran on a fresh prepare archive of the RP-1 build, through the after driver. Archives are under `test_env/test_runs/qualification/`:
- prepare `2026-10-29T06-25-38-407Z-13117fa7…`;
- execution-material `2026-10-29T06-36-37-048Z-5c803b1e…`;
- dry `2026-10-29T06-38-05-311Z-b56d89b8…`.

**The prepare** is `prepared`. `artifactJoinsInstall`, `basisReady` and `prospectiveReleaseJoinsInstall` hold. `inventoryEqualsCommitted` and `tenantManifestEqualsCommitted` are false; they are recorded, not gated. Their regeneration is D5-d-prep's work.

**The execution-material mode** (a second fresh prepare) gives 567,948 and 345,482 bytes, with 0 findings. Its helper observation is 8 bytes longer.

**The dry mode itself** is `undispatched`:
- no transport opened;
- the sentinel was not executed;
- the event log is unchanged.

Every input is admitted, and every start is admitted:
- the C2 start;
- 120 ruling starts, with a median of 1,389 ms;
- F11 and AF22, over placeholders;
- 478 assess@5 starts.

All 478 owner prompts equal the plan's renders.

**`dispatchReady` is false, for two causes, both recorded and not repaired:**
- **7 slots are outside the plan.** They are the single-criterion `rule/complement/proof/{1,2,4,5,6,7,8}` slots, each 1,077,868 to 1,200,240 bytes, over the prompt bound with no lawful partition. None carries execution material. They were already 7 of the D5-c plan's 77 outside slots.
- **44 slots have an invalid construction attribution.** The chains end at the committed head, and RP-1's changed members are uncommitted in the prepared tree. Commit 1 adds the chain that covers them.

**The starts in the run.**
- The median is 11,888 ms and the mean 27,363 ms, so the distribution is bimodal: 333 starts are under 20 s, 11 fall between 20 and 50 s, and 134 take 50 to 85 s.
- The slow starts are in the slots whose provenance views carry the heaviest record sets: proof/test_env, complement/design, public-contract, qualification-law, release-claim and complement/manifest. The heaviest view holds 374 records and 109,578,218 bytes.
- **Slot 302** shows the effect:
  - in a fresh process, 25.8 s;
  - after planOver in the same process, 81.3 s;
  - in a fresh process holding a 2.45 GB heap ballast, 67 to 70 s;
  - with the same ballast and `--max-old-space-size=16384`, 19 to 37 s.
- **The cause is garbage collection** near the default 4.5 GB heap limit, amplified by the acquisition rehash, which allocates over the 120 views' 4,327,873,704 record bytes (233,172,409 bytes distinct).
- Neither the operator's heap flag nor `qualification_resources.ts` is in this grant.

**The time projection** carries the measured start: 27,363 ms per assess@5 start, times 478, is 3.6 h of preparation.
- Sequential time is 30.6 h, or 34.2 h with the preparation.
- The projected cost is 597.37 USD.
- The D5-c start of about 291 s would have added about 33 h over 408 slots.

## Gates and lanes

**Gates.** All pass on the final tree:
- `tsc` and `tsc --noUnusedLocals`;
- `npm run lint -- test_env/qualification/recipe/verification-recipe.json`, the declared command's form, 62 files passed;
- `lint:imports`, `lint:lifecycle`, `lint:evidence` and `lint:calculus`;
- `npm run build`;
- the owner generator, which leaves `contracts/qualification/**` identical;
- the tree clean by path after the build. The only changes are the edits plus the three build-left outputs below.

**Build-left outputs, named with their reason.** `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json` are written by `npm run build` (`generate-product-manifest.mjs`). Each embeds the product content digest, which every code change moves.

**Outside the test grant.** `test_env/fixtures/abi5-root-candidate-basis.json` is regenerated by its owner script, `node scripts/refresh-candidate-basis.mjs`.
- About 40 installed lanes read it, through `test_env/support/candidate-basis.mjs`.
- It records the packed artifact's digest, the product content digest and the manifest digest.
- Every prior code commit in the range refreshed it: 9ec6c22f1, e71ae8a5c, 0f6258433, b78409e76, bf7119489 and fd38e8227.
- It is not in the pack's file list, so the refresh does not change the digest it records.

**The named set.** 20 lanes, each run alone, with `uptime` before and after. Load is the 1-minute average.

| Lane | Before | After | Load |
| --- | --- | --- | --- |
| `t287-qual056-material` | 7/7/0/0 | 8/8/0/0 (one case added) | 14.3 |
| `t287-qualification-scopes` | 17/17/0/0 | 18/18/0/0 (one case added) | 14.3 |

The other 18 lanes equal their before column:
- `t287-qualification-contraction` 4/4/0/0
- `t287-installed-qualification-conservation` 1/0/0/1
- `t287-release-publication` 6/5/0/1
- `t287-malformed-gtl-gate` 6/6/0/0
- `t287-native-runtime-gate` 7/6/0/1
- `t287-native-structural-gates` 9/9/0/0
- `t287-public-preparation` 6/6/0/0
- `t287-qualification-carrier-resource` 7/0/0/7
- `t287-qualification-fp-proof-delivery` 1/0/0/1
- `t287-qualification-law` 11/7/0/4
- `t287-qualification-parent-alias` 1/0/0/1
- `t287-qualification-producer-acquisition-reuse` 1/0/0/1
- `t287-qualification-producer-context` 4/4/0/0
- `t287-qualification-raw-contract-preimage` 1/0/0/1
- `t287-release-acceptance` 6/6/0/0
- `t287-result-evidence-lineage-projection` 1/1/0/0
- `uat-continuation` 4/0/0/4
- `r1-packed-artifact` 1/1/0/0, the check that the fixture refresh works

Loads across the run ranged from 14.3 down to 10.0. No lane moved besides the two with added cases. The whole suite is the Executive's watcher's.

## Deviations

- **A read outside the permitted list.** Early in the trace I ran `ls -la` and `shasum -a 256` on the operator config's path under `.ai-workspace/`, a read the activation does not list. The digest matched `fd0d0687…1dcb`. I did not repeat it.
- **Scratch measurement harnesses**, not deliverables, all under the scratch directory. The deliverable driver was not changed for them.
  - `timing.mjs` and `timing-hook.mjs`: the dry mode, stopped after the plan, then the timed starts.
  - `make-after-driver.mjs`: installs the RP-1 scratch pack in place of `config.package`. It also records the prepare checks `inventoryEqualsCommitted` and `tenantManifestEqualsCommitted` without gating on them. No pack but the candidate's, and no changed tree, can meet those two; regenerating the resources is D5-d-prep's work.
  - `planbench.mjs`.
- **A second serialization run** on the before archives. It ran before the drafts were applied, to freeze the exact D5-c plan for the plan-check comparison.
- **A failed first after-prepare.** A temporal-dead-zone error in the scratch patch failed it; the repaired patch reran. The failed archive remains under `test_env/test_runs/qualification/`.

## Files

- `README.md`: this record.
- `sizes.json`
- `timing.json`
- `census.json`
- `dry-run.json`
- `cost.json`

The run archives are under `build_tenants/abiogenesis/typescript/test_env/test_runs/qualification/`. Their paths are in each JSON file.
