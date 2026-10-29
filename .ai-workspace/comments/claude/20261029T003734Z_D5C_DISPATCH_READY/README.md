# D5-c: the native qualification of the candidate `fd38e8227` made dispatch-ready without a provider call

This is the Worker record for T-287 Phase D, package D5-c (Opus 5.5). It is commentary. The account is the Return in
`phase_d.md` (`## D5-c return`). These files carry summaries, digests and paths only (TD-19). The evidence stays in
the run archives under `build_tenants/abiogenesis/typescript/test_env/test_runs/qualification/` (gitignored) and in
the scratch files the JSON names by digest. Commit 1 (test territory) is `92498a2d29eca294d851557753cbda2fe047c357`.

**Disposition: not dispatch-ready.** No provider call was made (0 USD). The dispatch path is authored. Its dry mode
admitted every kind of C-call input at full scale and stopped before any spawn. The live mode stops at its gates for
three reasons:

- **The execution class (a Product finding, owner question).**
  - The real execution material is 7,528,927 bytes.
  - All 70 execution-class slots render at 8,242,250 to 9,278,835 bytes, over both 1,048,576 and 3,500,000. These are
    the 69 REQ-P-QUAL-056 rule slots and the coverage slot.
  - Recorded, not repaired.
- **Seven complement slots over the prompt bound.**
  - The slots are `rule/complement/proof/{1,2,4,5,6,7,8}`. Each has one rule group and one domain key, and lists 347
    proof members (none carried). Each renders at 1,077,868 to 1,200,240 bytes.
  - The packing has no partition for them. G-1's "split by member" would need a criterion for a member sub-part. The
    scope declares no such criterion, and the plan's `disjoint` coverage forbids one criterion in two slots
    (`validator/qualification.ts:508`). This is a ruling question, not repaired.
- **The cost of each assess@5 start (a finding).**
  - Each start costs 291,235 ms in process at this plan size, before any spawn.
  - 92 to 93 % of it is `qualificationPlanMatches` (`validator/qualification.ts:507`). It compares coverage pairwise
    by `canonicalEquals`, so it is quadratic in the plan's 5,690 criteria: about 55 s per check and about five checks
    per start.
  - The live mode pays this before every spawn: 33.0 h over 408 slots, on top of 27.1 h of provider time.

## Runs

| Run | Archive (`test_env/test_runs/qualification/`) | Content |
|---|---|---|
| prepare-4 | `2026-10-28T22-28-58-717Z-097a7a42-e10b-4367-b5b6-4ff597da86bf` | clean Public install and binding at commit 1's tree; inventory `832e4c7c…c8bc543` (1,191 members); 1,124 protected inputs observed, 0 mismatched; event log `df1d9685…` (3,196,589 bytes) |
| helper-realize-4 | `2026-10-28T22-35-30-885Z-c95cab6f-ba59-4199-b8a3-46460fcc12ac` | the observed C2 task (`00b42703…`) realized by the installed leaf; the helper command recorded with the setup environment |
| direct helper run | scratch `helper-run-4.*` | the ABI-owned helper run from the shell with the setup environment: exit 0, 222,495 ms, 9 commands exit 0. A measurement, never an admitted C2 |
| execution-material-4 | `2026-10-28T22-39-50-170Z-dd0678ec-be5e-46ff-a5ef-7d9ffd2ffb57` | the helper artifact, the observation, the verification material, the stand-in Result material, and the 056 and coverage slots rendered |
| smoke (end to end) | `2026-10-28T22-41-35-571Z-add3aef0-ed77-475f-80e5-544290c3e776` | the dry mode over an 8-slot plan to its end: `undispatched`; every input admitted |
| smoke cold reads | `2026-10-28T22-47-59-209Z-364515be-4eaa-4eda-96de-42d020054df7` | fresh process: record set, chains, resource and plan re-derived, 4 of 4 equal |
| dry-4 (full scale) | `2026-10-28T22-50-29-202Z-51314f73-decf-4f32-9633-c3a1465f4a30` | the committed dry mode on commit 1: the C2, 119 rulings, F11, AF22 and assess 0 to 2 admitted; stopped after assess-0002 (unsealed) |
| bounded | `2026-10-28T23-54-30-734Z-c8028df5-346e-4bcc-9d32-e97ab2aa8e05` | scratch harness: the dry mode through its plan, then the projection, the input digests, and one profiled assess@5 start; `undispatched` |
| cold reads | scratch `cold/` | fresh process over prepare-4 after every run: 7 of 7 equal; event log unchanged |

## Figures

| Item | Figure |
|---|---|
| Provenance (item 1) | 24 chains: the inherited base and 23 commits (`51bc5d2d8` exclusive to `92498a2d2` inclusive) |
| | inherited base: 1,170 members, 1,174 records, 66,681,626 bytes; grounded alone in 74.9 s |
| | inherited base activation: the ticket's Phase C close rows 12, 48, 272, 305, 306 and 312 |
| | all chains: 1,520 records, 196,618,944 bytes (262,160,604 as base64); every chain grounded alone; held |
| | whole inventory: 1,191 members grounded and current |
| | heap: 1.37 GB used at the record (process total), 16.98 GB limit |
| | every slot valid: 485 grounded, 0 insufficient, 0 invalid; a second process re-derived the record set equal |
| Projection (item 2) | 485 slots from 484 specifications, each rendered by the installed `prepareQualificationAssessment` |
| | in the plan: 408 slots, 5,690 criteria, 359,942,850 bytes, 89,985,866 input and 2,811,389 output tokens, **520.21 USD** |
| | outside the plan: 77 slots, 618,542,068 bytes, 778.59 USD |
| | at the D3 calls' observed 2.042 bytes per input token: 951.63 USD |
| | rule-input floor: 82.08 USD |
| Time (item 2) | 409 calls (408 assess@5 and the observed C2) |
| | provider time, sequential: 27.1 h (a mean of 238,922 ms per slot, extrapolated 13.7 times past the largest D3 prompt); the C2 232,357 ms |
| | with the measured start preparation (408 × 291,235 ms): 60.1 h |
| | a parallelism of four is not permitted: the event sink takes one exclusive append lock (`abg/event_store.ts:1594-1597`) |
| Execution material (item 3) | 7,528,927 bytes: the observation value is 7,521,691 bytes, of which 4,625,771 is the worksite delta (7,312 rows), 2,032,174 the task and 675,430 the snapshot |
| | the helper artifact is 7,177,262 bytes; the compact verification material is 144,757 bytes |
| | `verification.execution.ref` resolves to the execution selection's Result coordinate; its material is the canonical JSON of the C2 Result state (`abg/qualification_proof.ts:779-846`), not the compact material |
| | the 056 slot `rule/manifest/.gitignore/1` renders at 8,444,138 bytes (406,069 without the material); the coverage slot at 8,242,250 (204,181 without); both are over both bounds |
| Dry mode (item 5) | at full scale (dry-4), every row admitted (input and start): the C2 (3.4 s), 119 rulings (166.2 s in total), F11 (14.4 s), AF22 (13.4 s), assess 0 to 2 (about 288 s each) |
| | the sentinel never ran; no transport archive; the event log unchanged (`df1d9685…`, inode 658004020); no lock left |
| | the input digests of all 530 C-call inputs (1 C2, 119 rulings, F11, AF22, 408 assess) are in the bounded run; their digest of digests is `44bc9500…8f2897` |
| | end to end over the 8-slot plan: `undispatched`; all 16 inputs admitted; owner prompts equal 8 of 8 |
| G-4 (item 6) | `--config operator-config.qualification.json` (`fd0d0687…1dcb`): setup environment `npm_config_update_notifier=false` and `npm_config_offline=true` |
| | provider environment: the two npm keys and `BASH_DEFAULT_TIMEOUT_MS=900000`, `BASH_MAX_TIMEOUT_MS=900000`; credential values not read |
| | the live gate requires both limits above 855,250 ms |

### The projection by role (in the plan)

| Role | Slots | Criteria | Rendered bytes | USD |
|---|---|---|---|---|
| catalog | 7 | 95 | 3,931,485 | 5.70 |
| inventory | 15 | 56 | 5,776,729 | 8.92 |
| rule | 385 | 5,538 | 350,168,444 | 505.50 |
| tenant | 1 | 1 | 66,192 | 0.10 |
| coverage | 0 | 0 | 0 | 0.00 |
| **in the plan** | **408** | **5,690** | **359,942,850** | **520.21** |
| outside the plan | 77 (70 execution class, 7 complement) | 142 | 618,542,068 | 778.59 |

Every in-plan slot is under 1,048,576 bytes. The largest is 1,041,033. No execution-class slot is in the plan.

## The eight behaviors (item 4)

Source reading of the tenant at commit 1. No lane is authored and no claim is edited. Each claim names
REQ-P-QUAL-064 and the conservation-proof and release-boundary sections, with the evidence roles
`execution_evidence`, `behavioral_coverage` and `release_applicability` (`contracts/qualification/coverage.json`).
Code paths are under `code/src/`.

| Behavior | Claim | Realization | Carrier today | Class | Effort |
|---|---|---|---|---|---|
| `graph_span_reentry` | `conservation/consequence@5` | `hog/route_proposal.ts` (refusal `graph_span_reentry_not_declared`); `abg/traversal_route.ts:437`, `:3946-4027`, `:4609-4639` | `t287-selected-action` (gated on `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`, model-free F_D, not in the recipe); `t287-s03-automatic` (needs retained roots) | 5.0 portion authorable; A.0 out-of-traversal routing reserved for 5.1 (PRODUCT.md:396, :1133) | the existing lane's fresh path covers it once its root is set and the recipe runs it (a recipe and write-territory change, no new lines); or a new installed lane of about 150-250 lines |
| `ticket_traversal` | `conservation/consequence@5` | no ticket site, by the Product definition: an ordinary Program start (PRODUCT.md:398); fixture ticket Program `developer-mini-product/src/index.ts:30-43`, `:346-360` | none | authorable | about 120-200 lines |
| `re_enter` | `conservation/disposition@5` | `abg/traversal_route.ts:142`, `:213`, `:1001`, `:3946-4639`; `hog/route_proposal.ts` | as `graph_span_reentry` | authorable | shared with `graph_span_reentry` (one execution supports both claims, PRODUCT.md:470-472) |
| `yield_continuation` | `conservation/disposition@5` | the derivation branch only: `abg/calculus/liveness.ts:690-700` needs `budget.continuationRef`; its only source, `liveness.ts:798`, `:828`, always returns `null`; the M03 design's `yield_same_edge_continuation` occurs nowhere in `code/src` | none | unrealized (not reserved: PRODUCT.md:1136 places observation in 5.0) | not authorable as behavioral coverage: a lane over `deriveRuntimeLiveness` with a caller-selected budget (about 40-80 lines) exercises a candidate input, not an admitted fact; owner question |
| `inspect_runtime_archive` | `conservation/disposition@5` | `abg/traversal_route.ts:277-292`, `:1300-1320`, `:1871-1905`, `:2515-2532`, `:2677-2690`; `abg/event_store.ts:3236`; `hog/route_proposal.ts:569` | `t287-multi-candidate-admission` (in the recipe) drives the stop route with `repair` only; the fixture maps `runtime_archive_inspection_required` and no lane sets it | authorable | owner level about 20-40 lines; installed through the provider-free f09 harness about 150-250 lines (both shared with `escalate`) |
| `escalate` | `conservation/disposition@5` | the same stop-route sites, as a typed stop | as `inspect_runtime_archive` (`escalation_required` unexercised) | typed stop authorable (5.0); the F_H response resolution reserved for 5.1 (PRODUCT.md:356, :399, :1135) | shared with `inspect_runtime_archive` |
| `targeting_a_published_asset` | `conservation/public@5` | `gtl/public_start.ts:101-126`; `abg/invocation_admission.ts:1107-1122`; `product/execution_resolution.ts:558`; `owner_bindings/run_invocation.ts:520` | `a5-f02` (identity only), `t287-c2-child-program` (a refusal), `r5-invocation-admission` (a refusal, not in the recipe); the fixture's greeting asset is never started | authorable | owner level about 40-80 lines; installed about 120-200 lines |
| `shape-preserving-fibre-substitution` | `fibre-substitution@5` | binding selection, no named site: `abg/c_call_outcome.ts:239-250`, `:329`; the M05 design's invariant (`:175`) and its differential row (`:1044`, "T-270 proof") | none: no lane names it and no test cites T-270 | authorable with the `ABG_TS_CLAUDE_COMMAND` stand-in the existing lanes use | about 200-300 lines |

`ABI5_SELECTED_ACTION_EVIDENCE_ROOT` requires a writable directory. The lane and its host write
`environment.json`, `opened.json`, the handoffs, the receipts and `composition-result.json` into it. The fresh path
also needs `ABI5_WAVE1_FROZEN_*` unset: the host installs a packed artifact, is SIGKILLed and recovers. The
lane can produce the root itself on that path. Its preflight branch reads retained September Codex records,
which this package did not read. Its resume and recover branches need a retained prior root.

Summary: 7 authorable without provider or human response and 1 unrealized (`yield_continuation`). Two of the
seven carry a portion reserved for 5.1 (`graph_span_reentry`, `escalate`), and that portion takes an
`intentionally_removed` disposition with an owner ruling, not a lane. No behavior is reserved whole.

## Files

| File | Content |
|---|---|
| `provenance.json` | Item 1. Source: the committed dry mode at full scale (dry-4), with the bounded run's re-derivation. Carries the chains, the inherited base, each chain's grounding, the whole inventory, records, bytes, heap, and every slot's attribution. |
| `projection.json` | Item 2. Source: the bounded run. Carries the price, the bounds, the per-role totals, the slots outside the plan, the time and its model, token sensitivity, the rule-input floor, and the 485-row slot table. The full rows are in the archive's `projection.json`, by digest. |
| `execution-material.json` | Item 3. The direct helper run, the observation and its parts, the stand-in Result material, the verification material, what `verification.execution.ref` resolves to, the two slot renders, the two findings, and archive file digests. |
| `coverage-analysis.json` | Item 4. For each of the eight behaviors: the claim, the PRODUCT.md citations, the sites, the carriers, the class and the lane estimate. |
| `dry-run.json` | Item 5 and item 6. The full-scale rows and their proof by reads, the 530 input digests, the assess@5 start measurement and its profile attribution, the end-to-end run, and G-4. |
| `cost.json` | 0 provider calls, 0 USD, and how the token was handled. |
| `cold-reads.json` | The prepare-form cold reads after every run, the end-to-end run's cold reads, and the provenance re-derived across two processes. |

## Deviations

- **The full-scale dry was stopped.** The committed dry mode (dry-4) was stopped after assess-0002. Each iteration took
  about 390 s, so admitting every one of the 408 slots would have run for about 44 h. Three full-scale assess@5
  admissions are proven, plus the bounded run's slot 0. The other 405 are projected, not run. The bounded harness is
  a scratch copy of the committed driver, patched only to end after its plan. Its digests are in `projection.json`.
- **There is no `dry-run.json` from the committed driver at full scale.** Its proof is by reads: the sentinel, the
  transport archives, the event log, and the events directory.
- **Several prepare cycles.** Before commit 1, four prepare cycles and two diagnostic runs (the probe and the smoke)
  ran in scratch. The driver fixes they found are in commit 1. The abandoned gitignored archives are dry-1
  `2026-10-28T21-34-04-808Z-9a632e2b`, prepare-2 `2026-10-28T22-00-04-088Z-f40f7979`, the cycle-1 and cycle-3
  archives, the probe archives, and the first bounded start `2026-10-28T23-53-31-949Z-a66122b1`.
- **Two changes to the live mode.** It runs a pre-dispatch gate (the plan over the measured stand-in, before the C2).
  It also drops the per-slot in-process admission: the transport's own preparation refuses before any spawn.
- **A suite ran concurrently.** A suite process (`t287-c0-post-publication-failure`) ran concurrently with dry-4 and
  the bounded run.

## Findings outside the grant

1. **The execution class (owner question).** The execution class is a Product finding: 70 slots over 3,500,000 bytes,
   because `verification.execution.ref` names the whole C2 Result material.
2. **The assess@5 start cost.** The start is quadratic in the plan's criteria (`validator/qualification.ts:507`,
   through `:521`). The plan contract places the whole plan (4,038,447 bytes) in every assess input. The input is
   4,073,457 bytes.
3. **The F11 independence check is vacuous by source reading.** `abg/qualification_proof.ts:674` returns
   `actor-identity://` refs. `:696` tests them against `judgment.source.actorRef`, an `actor://` ref (assessor refs at
   `validator/qualification_contracts.ts:113`). The check never matches.
4. **`yield_continuation` is unrealized.** Its only budget source returns `continuationRef: null`
   (`abg/calculus/liveness.ts:798`, `:828`).
5. **The seven complement slots.** G-1's member split meets the `disjoint` coverage law (ruling question).
6. **Token sensitivity.** The 4-bytes-per-token rate understates input tokens against the D3 calls' observed
   2.04 bytes per token: 951.63 USD instead of 520.21 USD.

## Not verified

- **The ruling resume path is not authored.** In live mode, insufficient attributions stop at
  `awaiting_owner_rulings`. The dry mode admits every ruling request, but no resume turns a response into a
  `ruling_selection`. At plan time no attribution is insufficient.
- **The execution-material reconstruction is a source reading.** It reads `qualification_proof.ts:779-846`. No admitted
  C2 Result exists to measure.
- **The 405 unrun assess@5 admissions rest on the plan's determinism.** Their input digests are from the bounded run,
  a second process over the same tree, archives and stand-in. The smoke cold reads re-derived the plan equal in a
  fresh process.
- **The provider-time model is extrapolated.** It reaches 13.7 times past the largest observed D3 prompt.
- **The inherited-base activation is the ticket's current text** at the rows matched.
