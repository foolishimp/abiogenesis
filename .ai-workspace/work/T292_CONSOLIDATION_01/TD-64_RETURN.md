# TD-64 Return: design history and a present-tense design index

Writer: Claude Opus 5.5. Branch `claude/td64-design-history` from local `main`
at `ebeeaf5e0`, worktree `/private/tmp/abg-td64`. Change class:
design_reframe. No push, no tag.

Status: not fully met. One verification condition fails: live design notes
hold 42 dangling links where the brief requires zero; all 42 were present
before the move, and the move caused none (Section 5). The rest is complete:
50 current notes stay in `design/`, indexed by a new present-tense
`design/README.md`; 268 notes, the 8 ADRs and the old README moved unchanged
to `design/history/`; five mixed notes lost 1,280 lines of stale sections to
`history/*__RETIRED_SECTIONS.md`. No file under `code`, `contracts`,
`package.json` or `product-toolchain-manifest.json` changed, and no
specification file changed.

| Commit | Content |
| --- | --- |
| `c2cc24981` | Return skeleton with the classification table |
| `e1516b5f1` | `git mv` only: 277 renames, all 100% |
| `4e405ff08` | mixed-note cuts |
| `8ce7ad97b` | `design/README.md` and `design/history/README.md` |
| `09d7f03e1` | inbound references: 14 kept notes, `classification.json`, inventory, recipe, one lint comment |
| `8757bd231` | this Return |
| this commit | status line and two verification statements in this Return |

No specification commit: no specification file cites a moved note by a
repository path (Section 5).

## 1. Method

Each note under `T/design` (T = `build_tenants/abiogenesis/typescript`) has a
mechanical class from the TECH_DEBT_REGISTER_02 design review (the token
rule) and a class from reading. The read class decides the disposition.

- current: designs code or behaviour that exists at head, and no later note
  replaces it. Only current notes stay.
- superseded: a later ratified note or ruling replaces it.
- stale: designs code that no longer exists.
- record: register, census, audit, review, ledger, plan, proof plan,
  template, calibration or closure record.

Carrier check: for every note, the backticked PascalCase, UPPER_SNAKE,
camelCase and snake_case tokens were matched against identifiers in
`T/code/src` (20,444 identifiers, 10,981 declared symbols). Every non-current
note that names a live PascalCase or UPPER_SNAKE symbol other than the generic
`GraphFunction`, `ExecutionBasis` and `RuntimeEvent` was read (31 notes);
68 non-current notes name only those generic symbols. "Distinctive tokens"
are tokens named by three or fewer notes.

Helper scripts, all under `/private/tmp/abg-td64-work/`:

| Script | Use |
| --- | --- |
| `signals.py` | per-note signals: lines, status, dates (sweeps of more than 15 notes ignored), tokens and their liveness, declaration sites, mentions from source, tests, scripts, specification, tickets, READMEs and notes |
| `distinct.py` | distinctive tokens per note and their liveness |
| `dossier.py` | reading dossier per note |
| `sections.py` | live and dead distinctive tokens per section of one note |
| `classify.py` | applies `overrides.json` (read classes and reasons) to the mechanical classes; writes the table below |
| `linkcheck.py` | link check by scope and link form |
| `run-tests.sh` | runs named test files one at a time |
| `cut.py` | mixed-note cuts by line range, with a dry run that prints each boundary |
| `readmes.py` | writes both READMEs; asserts the index lists exactly the kept notes and that every named module exists |
| `repoint.py` | inbound reference edits, each an exact replacement matching once |
| `qualpaths.py` | inventory and recipe path strings for moved notes |
| `qualcheck.py` | inventory, recipe and evidence refs against the git index of a revision |

## 2. Class counts

| Class | Mechanical notes | Mechanical lines | Read notes | Read lines |
| --- | --- | --- | --- | --- |
| current | 48 | 36,703 | 50 | 38,212 |
| superseded | 17 | 17,316 | 27 | 19,353 |
| stale | 189 | 33,890 | 184 | 31,862 |
| record | 73 | 14,478 | 66 | 12,960 |
| total | 327 | 102,387 | 327 | 102,387 |

After the change:

| Surface | Files | Lines |
| --- | --- | --- |
| `design/*.md` current notes | 50 | 36,943 |
| `design/README.md` index | 1 | 87 |
| `design/history/` moved notes, ADRs and `README_BEFORE_2026-11-12.md` (bytes unchanged) | 277 | 64,175 |
| `design/history/*__RETIRED_SECTIONS.md` | 5 | 1,285 |
| `design/history/README.md` | 1 | 294 |

Kept: 50 notes, of which 5 are mixed and lose sections (Section 4). The old
`README.md` (582 lines, record) moves to `history/README_BEFORE_2026-11-12.md`
and a new index replaces it. 268 other notes move to `history/` and the 8
ADRs to `history/adrs/`.

## 3. Overrules of the mechanical class

- `ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md`: stale -> superseded. draws `RuntimeEventCalculusEffect`, absent at head; the IACS revision redraws the carrier set.
- `M01_TYPED_C_ALGEBRA_AUTHORING_IACS.md`: stale -> superseded. the seven-constructor closed union is live as `CProgramTerm`/`CTermKind` in `gtl/c_algebra.ts`, designed by later notes; `CExpression`, `CStage`, `GraphFunctionDeclarations` and the semantic compiler are absent; companion diagram carries the T-283 banner.
- `M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md`: stale -> superseded. prospective T-268 owner design; `T255CapabilityCoverageEvaluator` absent; the capability-definition graph over `DS1_CAPABILITY_CONTRACT_REGISTER` is designed by the constitution.
- `M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md`: record -> superseded. completed T-222 design; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes.
- `M02_M04_INSTALLED_CATALOG_SDK_CLI_IACS.md`: record -> superseded. completed T-222 IACS; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes.
- `M02_M04_INSTALLED_CATALOG_SDK_CLI_STRUCTURAL_CARRIER_DIAGRAM.md`: record -> superseded. completed T-222 diagram; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes.
- `M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md`: current -> stale. derives the worker loop from the Python-era realization; its IACS carriers (`admitFpDispatchOutcome`, `attachedResultArtifact`) are absent; names only generic live symbols.
- `M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md`: superseded -> record. retrospective calibration of reverted commit `945b5a2`.
- `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md`: stale -> current. §Current native binding and material lifetime designs `abg/instruction_assembly.ts` (`NativeInstructionAssembly`, edited 2026-11-07); the other sections design the absent T-183 compiler (`CompiledPromptPlan`, `InstructionEnvelope`, `PromptManifest`).
- `M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md`: current -> stale. designs a split into `runtime_unavailable` and `payload_contract_failure`, both absent; the live classifier keeps `transport_failure`, `no_output`, `contract_failure`.
- `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md`: record -> current. §Native definition material in durable event rows designs codec version 2 in `abg/event_body_encoding.ts`; `ABI5_STDO3_COMPUTATIONAL_BINDING` links its anchor; the name matched LEDGER, the rest is the T-095 target topology with absent carriers (`EvidenceAdmitted`, `AuthoritySnapshotAdmitted`).
- `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md`: stale -> current. timeout mapping (edited 2026-11-11) matches `classifyWorkerTransportFailure` (`abg/transport_contracts.ts:112`); liveness composition names live `RuntimeLivenessObserverProjection`, `RuntimeInvocationDisposition`; T-106 carriers `TraversalNonProgressCarrier`, `TraversalContinuationActionProjection` are absent.
- `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md`: stale -> current. D11 (RC12, 2026-11-11) and D6 design live `hog/recursion_lifecycle.ts` (`projectFailedRecursionChildTruth`) and `child_foldback_admitted`; D1-D5, D10 and the verification views design the absent compiled plan (`CompiledTypedRecursePlan`, `typed_recurse_*` events) (`FOLDBACK_DECLARATION_SCHEMA` gtl/serialization_contracts.ts:99).
- `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`: superseded -> current. sole accepted S05 design; the Consensus code it designs is live (`gtl/consensus.ts`, `implementation/consensus.ts`) because commit `10cb10e89` reverted the retirement `f4aad7d5e`; the mechanical reason cites an Executive ruling that predates the revert (`ConsensusFindingsVector` implementation/consensus.ts:30; `ConsensusInvocation` implementation/consensus.ts:32; `ConsensusSubmitterResponse` implementation/consensus.ts:38).
- `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`: stale -> superseded. derivation from the paused Python reference design (0 of 21 distinctive tokens live); the constitution's authority flow has no Python reference step.
- `T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md`: current -> record. roadmap: its R2 and R3 parts are proposed and unratified; the ratified parts are designed by the C0-C3 and R2 notes.
- `TYPESCRIPT_REALIZATION_GUARDRAILS.md`: stale -> superseded. tenant design law derived from STDO v2.5.0-rc.6; the constitution is now the operative local realization authority.
- `adrs/ADR-040-typescript-tenant-as-package-first-realization.md`: record -> superseded. package-first realization decision restated by the constitution.
- `adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md`: record -> superseded. carrier and event ownership is stated by the events requirement and the constitution.
- `adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md`: record -> superseded. stated by the convergence requirement and the constitution; ABI5_STDO3 links it.
- `adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md`: record -> stale. `AdvancementTransition` is absent at head.
- `adrs/ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md`: record -> superseded. catalog application is designed by the accepted catalog contraction; M05_S05 links it.

Two further notes override the refutation pass rather than the mechanical
class: `M01_TYPED_C_ALGEBRA_AUTHORING_IACS` (refutation current, read
superseded) and `M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION` (refutation
current, read stale). `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` stays
current against the review's Lead 1: its carriers are live in
`abg/runtime_liveness_contracts.ts`, and `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN`
refines it. The six held notes named by Lead 1 stay current because the code
they design exists at head.

## 4. Mixed notes

Five notes mix live and stale sections. Each cut is whole sections, moved
verbatim to `history/<NAME>__RETIRED_SECTIONS.md`, whose first line names the
note, commit `e1516b5f1` and the cut line ranges. Each kept note gains one
pointer line; `M03_INSTRUCTION_ASSEMBLY_DERIVATION` also has its surviving
`###` heading promoted to `##`. Two checks by script: each retired file holds
exactly the original line ranges; and each kept note equals the original's
kept ranges once the pointer line is removed, the heading is restored and
runs of blank lines are collapsed to one.

| Note | Lines before -> after | Cut | Kept |
| --- | --- | --- | --- |
| `M03_INSTRUCTION_ASSEMBLY_DERIVATION` | 335 -> 85 | Problem through Runtime Shape's opening text, Candidate Design Surfaces through Immediate Next Work: the T-183 compiler (`CompiledPromptPlan`, `InstructionEnvelope`, `PromptManifest`, `InstructionAssemblyRule`, none in `code/src`) | header, Source Authority, Current native binding and material lifetime (`abg/instruction_assembly.ts`) |
| `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION` | 217 -> 85 | Problem, Decision, Composition With T-103, Deterministic Flow, Functional Boundary, Closure Law: the T-106 carriers `TraversalNonProgressCarrier` and `TraversalContinuationActionProjection`, absent | header, Source Authority, Timeout And Retry Mapping (matches `classifyWorkerTransportFailure`), Artifact Salvage Rule, Composition With T-129 Runtime Liveness |
| `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION` | 274 -> 61 | STDO Triage and Target Source Fact Families through Non-Goals: the T-095 target topology. Payload Envelope names 9 live field names but no envelope carrier with `payloadClass` or `producerRef` exists, so it went with the rest | header, Source Authority, Position, Native definition material in durable event rows (`abg/event_body_encoding.ts`) |
| `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` | 740 -> 237 | Boundary's opening text (budget carried by the admitted input, contradicted by `bound` in `RECURSE_APPLICATION_SCHEMA`), D1-D5, D10, and the carrier set, domain model, sequence, lifecycle, cross-view, axiom, proof and verdict views of the compiled plan | header, Boundary's Requirements and Explicit Exclusions, D6, D7, D8, D9, D11 |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN` | 3,658 -> 3,487 | §14.3-14.7, observer and tuner, which the note's own 2026-07-28 supersession note retires | all other sections |

Dead text left inside kept sections of `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN`
(kept because D11 narrows D6 and D7-D9 state live rules): D6's first half
(`TypedRecurseChildRequest`), D7's "policy projection", D8's foldback adapter
fields (`preservedEvidenceRefs`, `budgetSourceFieldRef`) and D9's
`TypedRecurseParentRebindEvaluation`. The note needs an authored rewrite.
`ABI5_REALIZATION_CONSTITUTION` stays whole and also needs an authored
rewrite: it carries historical amendment and migration sections inside the
operative text.

## 5. Link check

`linkcheck.py` counts links by scope and form: `rel` Markdown links, `repo`
`repo://abiogenesis/` URIs, `bare` repository paths to design notes, and
`tdesign` tenant-relative `design/X.md` paths. A target exists when it is on
disk or in the git index (the worktree is sparse). `contracts/` mirrors are
excluded. Before = `ebeeaf5e0` with design-live restricted to the 50 kept
notes; the 277 notes that move are reported as design-moving.

| Scope / form | Before links / dangling | After links / dangling |
| --- | --- | --- |
| design-live rel | 419 / 44 | 475 / 42 |
| design-live repo | 37 / 1 | 37 / 1 |
| design-live bare | 3 / 0 | 3 / 0 |
| design-live tdesign | 1 / 0 | 1 / 0 |
| design-moving (before) or design-hist (after) rel, report only | 583 / 83 | 871 / 181 |
| design-moving or design-hist bare, report only | 105 / 0 | 110 / 103 |
| spec rel | 617 / 145 | 617 / 145 (same list) |
| spec repo | 9 / 0 | 9 / 0 |
| repository and tenant READMEs rel | 8 / 1 | 8 / 1 |
| bootstrap rel / bare | 2 / 0, 1 / 0 | 2 / 0, 1 / 0 |
| `T/test_env` docs and `classification.json` rel / repo | 3 / 0, 27 / 0 | 3 / 0, 27 / 0 |
| active tickets rel / bare / repo, report only | 874 / 569, 15 / 0, 5 / 0 | 874 / 569, 15 / 1, 5 / 0 |

The 56 added design-live links are the 51 index links and five pointer lines.
Zero dangling for live design: No. The move left no dangling link, and two
pre-existing ones were repaired (Section 6). 42 real dangling links remain
(41 rel, 1 repo), all present before the move:

- 40 `../../../../.ai-workspace/comments/codex/...` targets absent from the
  index, in 14 T287 notes;
- `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:60` links
  `../code/src/product/exact_match.ts` in a sentence that records the file's
  move to `shared/select/exact_match.ts`; left as written;
- the repo URI `.ai-workspace/comments/codex/20260906T152118Z_STDO_RC6_MIGRATION/README.md`
  in `ABI5_REALIZATION_CONSTITUTION.md:4386`, absent from the index.

One more counted link is a false positive: `ownerProjector[key](RuntimeTruth(P))`
in a code block of `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`.
The new active-ticket bare dangling path is
`.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:5576`,
which names `design/T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md`;
tickets are outside this package's edit list, so it is left. History notes are
not repaired: their relative links resolve against the pre-move layout, as
`history/README.md` says. `history/README.md` itself has no dangling link.

Specification: the 10 design notes it names by repository path all stay. The
two `GOALS.md:45,47` links to the refactor plan point at an absolute path in
another worktree (`/private/tmp/abg-rc11-foundation-20261110-01/...`), not at
the repository path, so the move does not change them.

## 6. Inbound references

Commit `09d7f03e1`, applied by `repoint.py` (27 exact replacements, each
matching once):

- 14 kept notes: 9 Markdown link targets and 12 backticked file names or
  paths of moved notes now name `history/...` (`ADR-042`, `ADR-045`,
  `ADR-046` under `history/adrs/`). Link text is unchanged.
- Three pre-existing ticket paths in kept notes (two links, one backticked
  path) move from `tickets/active` to `tickets/completed`, where T-095, T-106
  and T-183 now are.
- `test_env/qualification/classification.json`: the two evidence
  `sourceRefs` for `A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER` and `ADR-047`.
- `scripts/check-lifecycle-boundary.mjs:43`: comment path of the refactor plan.

## 7. Inventory and recipe

Readers:

- `test_env/qualification/build-resources.mjs` generates `inventory.json`,
  `recipe/verification-recipe.json`, `resources.json` and the tenant
  manifest. It reads `classification.json` and
  `recipe/expected-output-inventory.json`; its `representativeSources`
  refuses an evidence `sourceRef` that is not an inventory member.
- `test_env/support/exact-candidate-qualification.mjs`, run by hand through
  `run-exact-candidate-qualification.sh`, constructs a fresh inventory from
  `git ls-files` and compares only `inventoryDigest` and `inventoryRef` with
  the committed file (unequal already at `ebeeaf5e0`). It refuses a recipe
  `memberRef` absent from the fresh inventory, then reads each recipe
  `relativePath` and checks its digest.
- `t287-rp2-material-selection.test.mjs` reads `classification.json` through
  `build-resources.mjs`. No suite test reads the committed inventory or recipe.

Changes (`qualpaths.py`): whole quoted strings only, no re-serialization.
275 moved notes are members; each has exactly two strings per file (`ref` and
`path` in the inventory, `memberRef` and `relativePath` in the recipe), 550
per file, +4,400 bytes each. Removing the inserted `history/` segment from the
new files gives the old bytes exactly. `T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN`
is not a member. `design/README.md` keeps its path.

`qualcheck.py` (index presence against each revision):

| Revision | Inventory paths absent from index | Recipe paths absent | Recipe refs not inventory members | Evidence refs not members |
| --- | --- | --- | --- | --- |
| `ebeeaf5e0` | 0 | 0 | 8 | 0 |
| `e1516b5f1` (moves only) | 276 | 276 | 8 | 0 |
| `HEAD` | 0 | 0 | 8 | 0 |

Left for TD-63, which regenerates the inventory:

- digests of the changed members: `design/README.md`, the 14 repointed notes
  (five of them also cut), `scripts/check-lifecycle-boundary.mjs`,
  `test_env/qualification/classification.json` and
  `test_env/qualification/recipe/verification-recipe.json`;
- `inventoryDigest`, and the recipe digest recorded in `resources.json`;
- member order: the 275 renamed paths are now out of sort order in both files;
- new files that are not members: `design/history/README.md`,
  `README_BEFORE_2026-11-12.md` and the five `__RETIRED_SECTIONS.md` files.

## 8. Build

`cd T && npm run build` once at the end: exit 0, 30 s (baseline at
`ebeeaf5e0`: exit 0, 29 s). `git status --short` afterwards: empty. No
generated file changed, so nothing was restored.
`git diff --stat ebeeaf5e0 -- T/code T/contracts T/package.json T/product-toolchain-manifest.json`:
empty. `specification/` and `build_tenants/common`: unchanged.

## 9. Tests

One file at a time, with the brief's command (`run-tests.sh`):

| File | Before (`ebeeaf5e0`) | After |
| --- | --- | --- |
| `t287-qualification-law.test.mjs` | 11 tests, 7 pass, 0 fail, 4 skipped | 11 tests, 7 pass, 0 fail, 4 skipped |
| `t287-rp2-material-selection.test.mjs` | 3 tests, 3 pass | 3 tests, 3 pass |

The four skips need `ABG_QUALIFICATION_STAGE_FIXTURES`,
`ABG_QUALIFICATION_SOURCE_ROOT` or `ABG_QUALIFICATION_RELEASE_ROOT`, which are
unset in both runs. No test or script reads a design path at run time.
`node scripts/check-lifecycle-boundary.mjs` after the comment edit: "291
modules under code/src; 7 allow-listed site(s), no offender". The hand-run
exact-candidate qualification was not run.

## 10. Source path citations

None of the `T/code` citations of design notes stops resolving.
`public/binding/owner_contract_source_set.ts:39-41` names
`design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md#42-definition-shape`
and `gtl/default_library.ts:272` names `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN`;
both stay. No file name of a moved note occurs in `T/code`, `T/test_env`
(outside the qualification files above) or `T/scripts` (outside the edited
comment).

## 11. Deviations

1. The index has a "Tenant-wide" group before the ten owner groups, for
   `ABI5_REALIZATION_CONSTITUTION` and `ABI5_STDO3_COMPUTATIONAL_BINDING`,
   which span every owner.
2. Zero dangling links for live design is not met (Section 5).
3. Backticked file names of moved notes, not only links, were repointed in
   kept notes, and three pre-existing ticket paths were repaired.
4. In `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` the Boundary section's
   opening text is cut while its two subsections stay, and D6-D9 stay with
   dead text (Section 4).
5. Notes whose mechanical class is record because their status says
   completed, closed, retrospective or reserved 5.1 keep that class unless
   read otherwise. The class does not change their disposition.

## 12. Residual risks and points for a ruling

1. `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` stays current against the
   mechanical reason, which cites an Executive ruling ("owner ruled superseded
   by the Executive"). The keep rests on `10cb10e89`, the later revert that
   restored Consensus to Product, requirements, design and code.
2. Eight kept-note links now point into `history/` at notes they cite as
   authority:

   | Kept note | Cites | As |
   | --- | --- | --- |
   | `T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN` | `M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN#carrier-contract` | "accepted version-basis HOW" for LAWS028; its carriers are absent |
   | `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` | `M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN` | "existing F_P admission design" |
   | `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN` | `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION` | source of the M03/M05 authority split |
   | `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` | `TYPESCRIPT_REALIZATION_GUARDRAILS` | tenant authority |
   | `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN` | `T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN` | parent with accepted R0/R1 and R2 routing |
   | `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` | `T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN` | parent roadmap |
   | `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` | `ADR-045`, `ADR-046` | rationale |
   | `ABI5_STDO3_COMPUTATIONAL_BINDING` | `ADR-042` | rationale |

   None is cited by source code or a requirement, so no stop condition
   applies. Each needs either an authored rewrite of the citing sentence or a
   ruling that the cited note stays current.
3. `specification/GOALS.md:45,47` names `T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN`
   as the adopted plan; the plan is now a history record.
4. `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN` names
   `decideActorProcessLifecycle`, which has never existed in `code/src`; the
   live owner is `projectActorProcessLifecycle` in `abg/actor_process.ts`.
   Reading did not establish that they are the same function.
5. `ABI5_REALIZATION_CONSTITUTION` and `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN`
   need authored rewrites (Section 4).
6. Only five notes were checked section by section. The other 45 kept notes
   were classified whole; some may still contain historical sections.
7. Inventory and recipe digests and order are stale until TD-63 (Section 7).
8. Relative links inside history notes resolve against the pre-move layout
   (design-hist: 181 dangling rel links, 103 dangling bare paths).


## 13. Classification table

Columns: class (mechanical -> read, bold when they differ), lines, disposition,
evidence (live symbols and declaration sites for current notes; reason and
carrier-check result otherwise), replacing note or ruling, last content date
(commits touching more than 15 notes ignored).

| Note | Class (mechanical -> read) | Lines | Disposition | Evidence | Replacing note or ruling | Last content |
|---|---|---|---|---|---|---|
| `ABG_EVENT_CALCULUS_IACS.md` | current | 83 | keep | designs live code: `DerivedEffectRule` abg/calculus/rules.ts:15; `EventCalculusEffect` abg/index.ts:194; `FoldState` abg/event_calculus.ts:36 | - | 2026-10-22 |
| `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md` | current | 244 | keep | designs live code: `HoldsAt` abg/calculus/fold.ts:28 | - | 2026-11-02 |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | current | 1309 | keep | designs live code: `AcquiredAbgEventResource` owner_bindings/run_invocation.ts:35; `AxiomFoldContext` abg/calculus/axioms.ts:1874; `CanonicalJsonSink` shared/value/record.ts:11 | - | 2026-11-10 |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md` | current | 443 | keep | designs live code: `WorkspaceAuthorityBasis` product/invocation.ts:30; `WorkspaceBinding` owner_bindings/run_invocation.ts:85 | - | 2026-11-03 |
| `ABI5_REALIZATION_CONSTITUTION.md` | current | 4456 | keep | designs live code: `AbgProjectReadRefusal` abg/project_read_ports.ts:104; `CapabilityDefinitionGraph` owner_bindings/run_invocation.ts:20; `CapabilityDefinitionGraphRow` shared/capability_contracts.ts:136 | - | 2026-11-10 |
| `ABI5_STDO3_COMPUTATIONAL_BINDING.md` | current | 490 | keep | designs live code: `RuntimeAdmissionBasis` abg/open_call.ts:14; `NESTING_BOUND` shared/admit/json.ts:122; `ExactMatch` shared/select/index.ts:7 | - | 2026-11-09 |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md` | current | 1458 | keep | designs live code: no distinctive declaration; 9 of 10 distinctive tokens live | - | 2026-07-26 |
| `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md` | stale -> **current** | 335 | keep, cut | §Current native binding and material lifetime designs `abg/instruction_assembly.ts` (`NativeInstructionAssembly`, edited 2026-11-07); the other sections design the absent T-183 compiler (`CompiledPromptPlan`, `InstructionEnvelope`, `PromptManifest`) | - | 2026-11-07 |
| `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md` | record -> **current** | 274 | keep, cut | §Native definition material in durable event rows designs codec version 2 in `abg/event_body_encoding.ts`; `ABI5_STDO3_COMPUTATIONAL_BINDING` links its anchor; the name matched LEDGER, the rest is the T-095 target topology with absent carriers (`EvidenceAdmitted`, `AuthoritySnapshotAdmitted`) | - | 2026-10-21 |
| `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md` | current | 103 | keep | designs live code: `RuntimeInvocationDisposition` abg/runtime_liveness_contracts.ts:120; `RuntimeLivenessObserverProjection` abg/runtime_liveness_contracts.ts:126; `RuntimeSystemProbeContract` abg/runtime_liveness_contracts.ts:63 | - | 2026-05-08 |
| `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md` | stale -> **current** | 217 | keep, cut | timeout mapping (edited 2026-11-11) matches `classifyWorkerTransportFailure` (`abg/transport_contracts.ts:112`); liveness composition names live `RuntimeLivenessObserverProjection`, `RuntimeInvocationDisposition`; T-106 carriers `TraversalNonProgressCarrier`, `TraversalContinuationActionProjection` are absent | - | 2026-11-11 |
| `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md` | stale -> **current** | 740 | keep, cut | D11 (RC12, 2026-11-11) and D6 design live `hog/recursion_lifecycle.ts` (`projectFailedRecursionChildTruth`) and `child_foldback_admitted`; D1-D5, D10 and the verification views design the absent compiled plan (`CompiledTypedRecursePlan`, `typed_recurse_*` events) (`FOLDBACK_DECLARATION_SCHEMA` gtl/serialization_contracts.ts:99) | - | 2026-11-11 |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | current | 3658 | keep, cut | designs the direct GTL traversal (`CProgramTerm`, `traverseC`, One Surface in `abg/traversal_route.ts`); its §14 supersession note retires §14.3-14.7 (observer and tuner, parked for 5.1) (`ActionEvaluationProjection` abg/traversal_route.ts:389; `AdmittedImplementationSet` abg/c_call.ts:54; `AdmittedInteractionSet` abg/c_call.ts:52) | - | 2026-11-09 |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md` | superseded -> **current** | 824 | keep | sole accepted S05 design; the Consensus code it designs is live (`gtl/consensus.ts`, `implementation/consensus.ts`) because commit `10cb10e89` reverted the retirement `f4aad7d5e`; the mechanical reason cites an Executive ruling that predates the revert (`ConsensusFindingsVector` implementation/consensus.ts:30; `ConsensusInvocation` implementation/consensus.ts:32; `ConsensusSubmitterResponse` implementation/consensus.ts:38) | - | 2026-07-27 |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | current | 2634 | keep | designs live code: `ArtifactAdmissionBasis` product/install_definition_bindings.ts:17; `ArtifactTruthConflictField` abg/artifact_truth.ts:54; `ArtifactTruthRow` abg/artifact_truth.ts:67 | - | 2026-10-26 |
| `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md` | current | 772 | keep | designs live code: `ProductInstall` owner_bindings/run_invocation.ts:83; `ResolvedProductLock` owner_bindings/run_invocation.ts:84; `VerifiedProductArtifact` product/contracts.ts:127 | - | 2026-07-29 |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | current | 3508 | keep | designs live code: `CatalogAdmitPacket` product/catalog_definition_bindings.ts:68; `CatalogApplyPacket` product/catalog_definition_bindings.ts:69; `CatalogViewPacket` product/catalog_definition_bindings.ts:71 | - | 2026-11-03 |
| `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md` | current | 205 | keep | designs live code: `WorksitePreservedResultArtifact` product/worksite_construction_recovery.ts:51; `WorksitePreservedResultSource` product/worksite_construction_recovery.ts:2 | - | 2026-11-11 |
| `T287_C2_FORWARD_REENTRY_DESIGN.md` | current | 339 | keep | designs live code: no distinctive declaration; 5 of 5 distinctive tokens live | - | 2026-09-11 |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md` | current | 943 | keep | designs live code: `EdgeFulfillmentLedgerRow` abg/traversal_route.ts:355; `ExecutableCCallContext` hog/ccall_lifecycle.ts:83; `SemanticStageDeclaration` gtl/semantic_stage.ts:59 | - | 2026-11-05 |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md` | current | 975 | keep | designs live code: `SemanticRevisionEnvelope` product/semantic_revision.ts:149; `SemanticRevisionRequest` product/semantic_revision.ts:82; `SemanticRevisionSelection` product/semantic_revision.ts:43 | - | 2026-10-26 |
| `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md` | current | 310 | keep | designs live code: `ConfiguredActorIdentity` abg/transport_contracts.ts:154; `QualificationAssessmentTask` validator/qualification_contracts.ts:473; `QualificationConstructionProvenance` validator/qualification_contracts.ts:480 | - | 2026-11-07 |
| `T287_D4_SELF_CONFORMANCE_DESIGN.md` | current | 252 | keep | designs live code: `ProductAssetLocator` product/public_contract_publication.ts:37; `QualificationLawBasis` validator/qualification_contracts.ts:469; `ExactCandidateQualification` validator/qualification.ts:30 | - | 2026-10-30 |
| `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md` | current | 520 | keep | designs live code: `AbgEventResourceReceipt` abg/definition_event_resource.ts:47; `ROOT_EVENT_CONTRACT_DIGEST` abg/event_store.ts:1213; `DefinitionExecutionFault` owner_bindings/run_invocation.ts:112 | - | 2026-10-30 |
| `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md` | current | 234 | keep | designs live code: `SemanticWorksiteDesign` product/semantic_stage.ts:42; `SemanticWorksiteBasis` product/semantic_stage.ts:64 | - | 2026-09-23 |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | current | 1669 | keep | designs live code: `FramedSynthesisTarget` product/default_library.ts:257; `FramedSynthesisTask` product/default_library.ts:259; `NativeWorksiteCommandReacquisitionRequest` product/index.ts:592 | - | 2026-11-11 |
| `T287_F11_CARRIER_RESOURCE_DESIGN.md` | current | 655 | keep | designs live code: `NativeJudgmentProofOperations` implementation/contracts.ts:150; `NativeLeafProofOperations` implementation/contracts.ts:130; `ProductSemanticsProvider` product/execution_resolution.ts:69 | - | 2026-11-11 |
| `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md` | current | 288 | keep | designs live code: no distinctive declaration; 3 of 3 distinctive tokens live | - | 2026-11-11 |
| `T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN.md` | current | 192 | keep | designs live code: `GtlProgramDiagnosticId` validator/validation.ts:73; `RawAdmissionResult` validator/index.ts:10; `StaticValidationRefusal` validator/validation.ts:92 | - | 2026-10-09 |
| `T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN.md` | current | 69 | keep | designs live code: `GraphFunctionCatalog` product/catalog_operations.ts:28 | - | 2026-08-13 |
| `T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md` | current | 85 | keep | designs live code: `AbgEventResourceAssertion` product/release_snapshot_definition_bindings.ts:6; `ABG_EVENT_RESOURCE_RECOVERY` abg/definition_event_resource.ts:408; `RESOLVED_ADMISSION_AUTHORITY_SCHEMA` product/admission_authority.ts:54 | - | 2026-10-25 |
| `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` | current | 337 | keep | designs live code: `ROOT_CURRENT_EVENT_PROFILE_REF` abg/event_contract_profiles.ts:11 | - | 2026-11-07 |
| `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` | current | 344 | keep | designs live code: `RuntimeInvocationScope` abg/runtime_liveness_contracts.ts:26; `ROOT_CURRENT_EVENT_PROFILE_REF` abg/event_contract_profiles.ts:11 | - | 2026-11-11 |
| `T287_NATIVE_WORKSPACE_WORK_DESIGN.md` | current | 564 | keep | designs live code: `NativeInstructionAssembly` abg/instruction_assembly.ts:47; `WorksiteEffectRefusal` product/native_workspace_work.ts:10 | - | 2026-11-07 |
| `T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md` | current | 192 | keep | designs live code: `NativeDeclarationClosureRequest` product/declaration_exports.ts:123; `NativeProductDeclarationEvidence` product/verify_product.ts:46; `PackageJsonView` product/verify_product.ts:115 | - | 2026-11-12 |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md` | current | 1042 | keep | designs live code: `GovernanceWorkState` product/default_library.ts:86; `InvocationAdmissionInput` abg/invocation_admission.ts:117; `PreparedProductRunInvocation` owner_bindings/run_invocation.ts:94 | - | 2026-11-02 |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md` | current | 220 | keep | designs live code: `AdmissionCapabilityData` product/invocation.ts:62; `ConformanceEvaluationResourceReceipt` validator/conformance_definition_bindings.ts:82; `ExactDirectRunInvocationRequest` product/invocation.ts:200 | - | 2026-11-03 |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md` | current | 670 | keep | designs live code: `AbgHistoricalDeclarationProof` product/worksite_command_execution.ts:4; `AbgProjectReadResourceAssertion` abg/project_read_definition_bindings.ts:66; `AbgTypedTerminalResult` abg/terminal_result_contracts.ts:32 | - | 2026-11-11 |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | current | 219 | keep | designs live code: `GraphFunctionApplication` gtl/contracts.ts:45; `GtlProgram` hog/child_traversal.ts:18 | - | 2026-09-28 |
| `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` | current | 306 | keep | designs live code: `ProductExecutionResolutionPort` product/execution_resolution.ts:1160; `RUN_ENVIRONMENT_SCHEMA` gtl/stdo_run_environment.ts:162 | - | 2026-11-05 |
| `T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md` | current | 59 | keep | designs live code: no distinctive declaration; 0 of 0 distinctive tokens live | - | 2026-08-23 |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md` | current | 1261 | keep | designs live code: `RunEnvironmentDeclaration` gtl/stdo_run_environment.ts:176; `RunSemanticRelationView` abg/replay.ts:1555; `LEGACY_ROOT_EVENT_CONTRACTS` abg/event_store.ts:329 | - | 2026-11-01 |
| `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md` | current | 106 | keep | designs live code: no distinctive declaration; 0 of 2 distinctive tokens live | - | 2026-10-21 |
| `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md` | current | 177 | keep | designs live code: `CapabilityGrantConstructionBasis` product/invocation.ts:127; `OwnerContractSourceDeclaration` shared/public_function_contracts.ts:413; `RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA` owner_bindings/run_invocation.ts:1099 | - | 2026-09-23 |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md` | current | 808 | keep | designs live code: `WORKSITE_FILE_REPLACE_EFFECT_URI` product/worksite_effect.ts:34; `WorksiteEffectAuthorization` product/worksite_operations.ts:44; `WorksiteEffectRefusal` product/native_workspace_work.ts:10 | - | 2026-11-11 |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md` | current | 884 | keep | designs live code: `WorksiteCandidateBundle` product/index.ts:511; `WorksiteCandidateFile` product/index.ts:512; `WorksiteConstructionTarget` product/index.ts:517 | - | 2026-09-06 |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | current | 1134 | keep | designs live code: `RuntimeEventBodyView` abg/runtime_history.ts:738; `WorksiteCommandExecutionHelperPlan` product/index.ts:26; `WorksiteCommandExecutionTask` product/index.ts:29 | - | 2026-11-10 |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md` | current | 911 | keep | designs live code: `WorksiteBranchConstructionOutputVector` product/worksite_branch_construction.ts:203; `WorksiteBranchConstructionTask` product/worksite_preparation.ts:21; `WorksiteBranchConstructionVector` product/worksite_branch_construction.ts:186 | - | 2026-09-06 |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md` | current | 424 | keep | designs live code: `GtlEdge` gtl/contracts.ts:19; `ProgramValidationInput` validator/validation.ts:503; `RawAdmittedValue` validator/conformance_definition_bindings.ts:57 | - | 2026-09-29 |
| `T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md` | current | 270 | keep | designs live code: no distinctive declaration; 28 of 28 distinctive tokens live | - | 2026-11-03 |
| `A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md` | record | 125 | move to history/ | register with a non-operative method banner; `classification.json` names it as evidence | - | 2026-07-20 |
| `A5_PRIME_CONTRACTION_CENSUS.md` | record | 436 | move to history/ | census closed by T-277; names live `DS1_CAPABILITY_CONTRACT_REGISTER` and `ConsensusResult` only as census subjects | - | 2026-07-15 |
| `ABG_3_FIRST_SLICE_IACS.md` | stale | 88 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 236 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `ABG_3_MODULE_DESIGN.md` | stale | 418 | move to history/ | only 50% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md` | record | 73 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md` | record | 75 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 78 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md` | stale | 125 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md` | stale | 84 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 83 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md` | record | 46 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md` | stale -> **superseded** | 152 | move to history/ | draws `RuntimeEventCalculusEffect`, absent at head; the IACS revision redraws the carrier set | ABG_EVENT_CALCULUS_IACS (2026-10-22 revision) | 2026-05-07 |
| `ABG_EVENT_CALCULUS_T119_TEMPORAL_EXTENSION_CONTRACT.md` | stale | 24 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 10 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `ABG_METHOD_TRACE_CLOSURE_GUARD_DERIVATION.md` | stale | 32 | move to history/ | names fewer than 5 code identifiers; carrier check: 1 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `ABG_SCHEDULE_RUNTIME_DERIVATION.md` | stale | 36 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md` | superseded | 1791 | move to history/ | T-283 banner; its live entities (`CapabilityGrant`, `ConstructionIntent`, `InvocationAuthority`, `EdgeClosureDecision`) are designed by kept notes | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN; M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN | 2026-07-17 |
| `DESIGN_SLICE_PRE_CODE_GATE_TEMPLATE.md` | record | 181 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-07-15 |
| `GTL_3_FIRST_SLICE_IACS.md` | stale | 113 | move to history/ | only 17% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-06-06 |
| `GTL_3_GRAPH_FUNCTION_ZOOM_PLAN_DERIVATION.md` | stale | 162 | move to history/ | only 14% of named identifiers exist; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-06-13 |
| `GTL_3_IMPLEMENTATION_PLAN.md` | record | 98 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `GTL_3_INTERFACE_CONTRACTS.md` | stale | 441 | move to history/ | only 20% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-06-06 |
| `GTL_3_M02_WORK_PUBLICATION_IACS.md` | stale | 111 | move to history/ | only 28% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `GTL_3_MODULE_DESIGN.md` | stale | 125 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 284 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-06-06 |
| `GTL_ASSET_SURFACE_PROMPT_INTERFACE_DERIVATION.md` | stale | 70 | move to history/ | names fewer than 5 code identifiers; carrier check: 2 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-06-06 |
| `GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md` | stale | 49 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `GTL_TIME_ALGEBRA_DERIVATION.md` | stale | 54 | move to history/ | only 9% of named identifiers exist; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `GTL_TIME_ALGEBRA_FIRST_PROOF_PLAN.md` | record | 29 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `GTL_TIME_ALGEBRA_IACS.md` | stale | 27 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 215 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `HOMEOSTATIC_LOOP_AFTER_EVAL_EVENT_DERIVATION.md` | stale | 18 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md` | stale | 763 | move to history/ | only 6% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 38 distinctive tokens live; no distinctive live carrier | - | 2026-07-13 |
| `M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md` | stale | 887 | move to history/ | only 28% of named identifiers exist; carrier check: 6 of 40 distinctive tokens live; no distinctive live carrier | - | 2026-07-13 |
| `M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md` | stale | 503 | move to history/ | only 33% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-07-14 |
| `M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md` | superseded | 613 | move to history/ | T-252 Consensus construction replaced by the accepted S05 design | M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN | 2026-07-18 |
| `M01_M03_GRAPH_VECTOR_C_PROGRAM_SELECTION_BEHAVIOR_DESIGN.md` | superseded | 636 | move to history/ | its head carries a T-283 invalidation or non-operative banner; carrier check: 4 of 43 distinctive tokens live; no distinctive live carrier | T-283 disposition 2026-07-20; direct-GTL design (M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN, M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN) | 2026-07-12 |
| `M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md` | record | 465 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 1 of 17 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md` | stale | 699 | move to history/ | only 6% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 3 of 68 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M01_TYPED_C_ALGEBRA_AUTHORING_IACS.md` | stale -> **superseded** | 179 | move to history/ | the seven-constructor closed union is live as `CProgramTerm`/`CTermKind` in `gtl/c_algebra.ts`, designed by later notes; `CExpression`, `CStage`, `GraphFunctionDeclarations` and the semantic compiler are absent; companion diagram carries the T-283 banner | M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN (§3 `CProgramTerm`); ABI5_STDO3_COMPUTATIONAL_BINDING (Seven C constructors) | 2026-07-11 |
| `M01_TYPED_C_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` | superseded | 79 | move to history/ | T-283 banner; companion diagram of the superseded C-algebra IACS | M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN (§3 `CProgramTerm`); ABI5_STDO3_COMPUTATIONAL_BINDING (Seven C constructors) | 2026-07-11 |
| `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md` | stale | 102 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 1 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M02_M03_LOOKUP_AUTHORITY_IACS.md` | stale | 111 | move to history/ | only 28% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 105 | move to history/ | only 40% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` | stale -> **superseded** | 231 | move to history/ | prospective T-268 owner design; `T255CapabilityCoverageEvaluator` absent; the capability-definition graph over `DS1_CAPABILITY_CONTRACT_REGISTER` is designed by the constitution | ABI5_REALIZATION_CONSTITUTION §5.6.2C and §16.10-16.11 | 2026-07-15 |
| `M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` | superseded | 557 | move to history/ | T-283 banner; Consensus publication replaced by the accepted S05 design | M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN | 2026-07-20 |
| `M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md` | record | 781 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 2 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M02_M04_INSTALLED_CATALOG_SDK_CLI_DERIVATION.md` | record -> **superseded** | 581 | move to history/ | completed T-222 design; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN | 2026-07-11 |
| `M02_M04_INSTALLED_CATALOG_SDK_CLI_IACS.md` | record -> **superseded** | 318 | move to history/ | completed T-222 IACS; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN | 2026-07-11 |
| `M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md` | record | 369 | move to history/ | T-222 operation register under the T-283 banner; its live names (`CatalogAdmissionResult`, `InstallProductRequest`) are designed by M05_S06_PUBLIC | - | 2026-07-11 |
| `M02_M04_INSTALLED_CATALOG_SDK_CLI_STRUCTURAL_CARRIER_DIAGRAM.md` | record -> **superseded** | 729 | move to history/ | completed T-222 diagram; T-283 invalidated the T-222 public family, now designed by the M05_S06 notes | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN | 2026-07-11 |
| `M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md` | stale | 67 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M03_ABG_FN_COMPOSITION_DERIVATION.md` | stale | 267 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md` | stale | 165 | move to history/ | only 8% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 185 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md` | stale | 150 | move to history/ | only 6% of named identifiers exist; carrier check: 0 of 16 distinctive tokens live; no distinctive live carrier | - | 2026-06-19 |
| `M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md` | current -> **stale** | 94 | move to history/ | derives the worker loop from the Python-era realization; its IACS carriers (`admitFpDispatchOutcome`, `attachedResultArtifact`) are absent; names only generic live symbols | - | 2026-07-03 |
| `M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md` | stale | 123 | move to history/ | only 21% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_ATTACHED_FP_WORKER_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 101 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md` | superseded | 785 | move to history/ | its head carries a T-283 invalidation or non-operative banner; carrier check: 4 of 38 distinctive tokens live; no distinctive live carrier | T-283 disposition 2026-07-20; direct-GTL design (M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN, M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN) | 2026-07-14 |
| `M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md` | superseded | 791 | move to history/ | its head carries a T-283 invalidation or non-operative banner; carrier check: 7 of 31 distinctive tokens live; no distinctive live carrier | T-283 disposition 2026-07-20; direct-GTL design (M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN, M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN) | 2026-07-19 |
| `M03_COMPOSED_C_STAGE_SET_DERIVATION.md` | stale | 126 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-06-02 |
| `M03_CONSCIOUSNESS_TIER_STACK_AND_EXECUTION_MODEL.md` | stale | 386 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-07-09 |
| `M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` | superseded | 1065 | move to history/ | T-283 banner; Consensus domain family replaced by the accepted S05 design | M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN | 2026-07-18 |
| `M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md` | superseded -> **record** | 222 | move to history/ | retrospective calibration of reverted commit `945b5a2` | - | 2026-07-12 |
| `M03_CONSEQUENCE_ALLOWED_TRAVERSAL_CATALOG_DERIVATION.md` | stale | 224 | move to history/ | only 6% of named identifiers exist; carrier check: 0 of 16 distinctive tokens live; no distinctive live carrier | - | 2026-06-19 |
| `M03_CONSTITUTIONAL_VERSION_BASIS_BEHAVIOR_DESIGN.md` | stale | 418 | move to history/ | `ConstitutionalSurfaceRow`, `ConstitutionalSurfaceVersionBinding` and the drift judge are absent (5 of 33 distinctive tokens live); T287_G2 still links it | - | 2026-07-12 |
| `M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md` | stale | 39 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md` | stale | 35 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_CONSTRUCTION_INTENT_RUNNER_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 39 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md` | stale | 172 | move to history/ | only 20% of named identifiers exist; 8 dangling path refs; carrier check: 2 of 24 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md` | stale | 105 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 10 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_CONSTRUCTION_PRESSURE_PACKAGE_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 77 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md` | stale | 677 | move to history/ | only 25% of named identifiers exist; carrier check: 4 of 18 distinctive tokens live; no distinctive live carrier | - | 2026-07-14 |
| `M03_DISTRIBUTED_EXECUTOR_BACKENDS.md` | stale | 180 | move to history/ | names fewer than 5 code identifiers; carrier check: 2 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-05-03 |
| `M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md` | stale | 243 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-05-15 |
| `M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md` | stale | 152 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 19 distinctive tokens live; no distinctive live carrier | - | 2026-05-13 |
| `M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 184 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-05-13 |
| `M03_EXECUTION_AUTHORITY_PROVENANCE_DESIGN.md` | stale | 92 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-07-09 |
| `M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md` | stale | 108 | move to history/ | only 0% of named identifiers exist; 1 dangling path refs; carrier check: 1 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_FD_AUTHORITY_PLACEMENT_FIRST_SLICE_IACS.md` | stale | 139 | move to history/ | only 0% of named identifiers exist; carrier check: 1 of 16 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_FD_AUTHORITY_PLACEMENT_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 64 | move to history/ | names fewer than 5 code identifiers; carrier check: 1 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md` | stale | 1056 | move to history/ | only 15% of named identifiers exist; carrier check: 25 of 208 distinctive tokens live; no distinctive live carrier | - | 2026-05-08 |
| `M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md` | stale | 306 | move to history/ | T-127 design candidate; names `ConstructionIntentAdmission`, which is live (`abg/traversal_route.ts:351`) with a different 5.0 shape designed by M05_DIRECT; its loop carriers are absent | - | 2026-06-12 |
| `M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 528 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-06-12 |
| `M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md` | stale | 534 | move to history/ | T-257 carriers (`FpResultContractAdmission`, `FpTransformWireProjection`) absent (3 of 23 live); T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION still links it | - | 2026-07-19 |
| `M03_GRAPH_APPLICATION_INSTANCE_SEMANTICS_DERIVATION.md` | stale | 54 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-07-03 |
| `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md` | stale | 205 | move to history/ | only 19% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-06-18 |
| `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md` | stale | 207 | move to history/ | only 27% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 3 of 29 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 269 | move to history/ | only 23% of named identifiers exist; carrier check: 2 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md` | stale | 1095 | move to history/ | only 33% of named identifiers exist; 9 dangling path refs; derives from the withdrawn Python tenant; carrier check: 6 of 42 distinctive tokens live; no distinctive live carrier | - | 2026-06-10 |
| `M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md` | stale | 189 | move to history/ | T-152 carriers absent (2 of 25 live); the live gate `validator/conformance_operation.ts` is designed by ABI5_REALIZATION_CONSTITUTION (R36) and M05_S06_AXIOMATIC (D13) | - | 2026-06-19 |
| `M03_GTL_PROGRAM_CONFORMANCE_GATE_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 151 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-06-19 |
| `M03_INSTRUCTION_ASSEMBLY_FIRST_SLICE_IACS.md` | stale | 123 | move to history/ | only 0% of named identifiers exist; carrier check: 1 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-07-01 |
| `M03_INSTRUCTION_ASSEMBLY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 203 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-07-01 |
| `M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md` | record | 1555 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 6 of 104 distinctive tokens live; no distinctive live carrier | - | 2026-07-19 |
| `M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md` | stale | 254 | move to history/ | only 20% of named identifiers exist; carrier check: 2 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-06-07 |
| `M03_ITERATION_STATE_ACTION_ALGEBRA_FIRST_SLICE_IACS.md` | stale | 95 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-06-07 |
| `M03_ITERATION_STATE_ACTION_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 188 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-06-07 |
| `M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md` | superseded | 743 | move to history/ | T-283 banner; F_H continuation carriers are designed by M05_DIRECT and ABI5_STDO3 | M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN; ABI5_STDO3_COMPUTATIONAL_BINDING | 2026-07-18 |
| `M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md` | superseded | 1582 | move to history/ | T-283 banner; One Surface carriers in `abg/traversal_route.ts` are designed by M05_DIRECT §12 | M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN §12 | 2026-07-20 |
| `M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md` | stale | 131 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md` | stale | 95 | move to history/ | only 5% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 17 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 160 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md` | superseded | 3816 | move to history/ | T-283 banner; the public invocation family is designed by the M05_S06 notes | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN | 2026-07-20 |
| `M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md` | stale | 373 | move to history/ | only 33% of named identifiers exist; carrier check: 2 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-07-14 |
| `M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md` | current -> **stale** | 113 | move to history/ | designs a split into `runtime_unavailable` and `payload_contract_failure`, both absent; the live classifier keeps `transport_failure`, `no_output`, `contract_failure` | - | 2026-04-25 |
| `M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS.md` | stale | 110 | move to history/ | only 35% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_M04_RUNTIME_FAILURE_TAXONOMY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 111 | move to history/ | names fewer than 5 code identifiers; carrier check: 1 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_OBSERVED_STATE_ADMISSION_DERIVATION.md` | stale | 133 | move to history/ | only 0% of named identifiers exist; 6 dangling path refs; carrier check: 0 of 12 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_OBSERVED_STATE_ADMISSION_FIRST_SLICE_IACS.md` | stale | 162 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_OBSERVED_STATE_ADMISSION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 73 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md` | stale | 368 | move to history/ | only 9% of named identifiers exist; 5 dangling path refs; carrier check: 1 of 49 distinctive tokens live; no distinctive live carrier | - | 2026-05-02 |
| `M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md` | stale | 113 | move to history/ | only 8% of named identifiers exist; 5 dangling path refs; carrier check: 0 of 12 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_OVERLAY_FRAME_CONTRACT_FIRST_SLICE_IACS.md` | stale | 52 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_OVERLAY_FRAME_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 69 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md` | record | 119 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 13 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_PROOF_PLAN.md` | record | 117 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 2 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 117 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_PLUGIN_RESULT_INTERFACE_CONTRACT_DERIVATION.md` | stale | 86 | move to history/ | only 0% of named identifiers exist; carrier check: 1 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-06-18 |
| `M03_PROPORTIONAL_CONFORMANCE_INVENTORY_BEHAVIOR_DESIGN.md` | stale | 595 | move to history/ | T-264 carriers (`ConformanceScope`, `DerivedConformanceInventory`) absent; live gate designed by the constitution (R36) and M05_S06_AXIOMATIC (D13) | - | 2026-07-13 |
| `M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md` | superseded | 107 | move to history/ | T-283 banner; observer design not realized at head | T-283 disposition 2026-07-20; observer parked for 5.1 (M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN, held) | 2026-06-29 |
| `M03_RECURSIVE_EXECUTIVE_OBSERVER_FIRST_SLICE_IACS.md` | stale | 57 | move to history/ | only 0% of named identifiers exist; carrier check: 2 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_RECURSIVE_EXECUTIVE_OBSERVER_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 61 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_DERIVATION.md` | stale | 196 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-06-28 |
| `M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md` | record | 111 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_DERIVATION.md` | stale | 166 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 18 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_DOWNSTREAM_READINESS_FIRST_SLICE_IACS.md` | stale | 112 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md` | stale | 91 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_REFINEMENT_DERIVATION.md` | stale | 92 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_REFINEMENT_FIRST_SLICE_IACS.md` | stale | 81 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_REFINEMENT_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 69 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_ROUTE_INTERFACE_DESIGN.md` | stale | 438 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 37 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_ROUTE_REQUIREMENTS_AUDIT.md` | record | 89 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 71 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-06-26 |
| `M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md` | stale | 380 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-07-04 |
| `M03_REQUIREMENT_PROOF_CARRY_THROUGH_FIRST_SLICE_IACS.md` | stale | 161 | move to history/ | the requirements algebra it designs is absent; the names `RequirementTerm` and `GtlContractFulfillmentBinding` are reused by the narrower D1 handoff in `gtl/requirement_handoff.ts`, designed by T287_D1_REQUIREMENT_LIFECYCLE_DESIGN | - | 2026-07-04 |
| `M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 285 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-07-04 |
| `M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_DERIVATION.md` | stale | 53 | move to history/ | names fewer than 5 code identifiers; carrier check: 1 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_FIRST_SLICE_IACS.md` | stale | 45 | move to history/ | only 17% of named identifiers exist; carrier check: 1 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 46 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-06-29 |
| `M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md` | stale | 144 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md` | stale | 139 | move to history/ | only 20% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 22 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 156 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_RUNTIME_CONTINUATION_TRANSITION_DERIVATION.md` | stale | 210 | move to history/ | only 14% of named identifiers exist; carrier check: 2 of 21 distinctive tokens live; no distinctive live carrier | - | 2026-06-12 |
| `M03_RUNTIME_CONTINUATION_TRANSITION_FIRST_SLICE_IACS.md` | stale | 65 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-06-04 |
| `M03_RUNTIME_CONTINUATION_TRANSITION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 89 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-06-04 |
| `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md` | record | 240 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-06-30 |
| `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md` | stale | 233 | move to history/ | only 25% of named identifiers exist; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-06-30 |
| `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md` | stale | 114 | move to history/ | only 8% of named identifiers exist; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-06-30 |
| `M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 223 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-06-30 |
| `M03_SAGA_FRONTIER_DERIVATION.md` | stale | 194 | move to history/ | T-141 branch carriers (`BranchLeaseRecord`, `BranchFanInProjection`) absent; names live `RuntimeWatchdogPolicy` only as a dependency | - | 2026-05-21 |
| `M03_SAGA_FRONTIER_FIRST_SLICE_IACS.md` | stale | 194 | move to history/ | only 0% of named identifiers exist; 3 dangling path refs; carrier check: 1 of 27 distinctive tokens live; no distinctive live carrier | - | 2026-05-21 |
| `M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md` | stale | 69 | move to history/ | only 33% of named identifiers exist; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md` | stale | 130 | move to history/ | only 28% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 10 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_SUPERVISED_ACTOR_INVOCATION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 110 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md` | stale | 225 | move to history/ | only 10% of named identifiers exist; carrier check: 1 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md` | stale | 137 | move to history/ | only 3% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 21 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md` | record | 112 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 1 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 115 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRACED_EXECUTOR_BACKENDS.md` | stale | 133 | move to history/ | only 20% of named identifiers exist; carrier check: 2 of 12 distinctive tokens live; no distinctive live carrier | - | 2026-05-03 |
| `M03_TRANSPORT_PROTOCOL_DERIVATION.md` | stale | 137 | move to history/ | names fewer than 5 code identifiers; 3 dangling path refs; derives from the withdrawn Python tenant; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md` | stale | 83 | move to history/ | only 20% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 101 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md` | stale | 156 | move to history/ | only 15% of named identifiers exist; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md` | stale | 100 | move to history/ | only 11% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 94 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M03_TRAVERSAL_MODULATION_DERIVATION.md` | stale | 280 | move to history/ | only 6% of named identifiers exist; carrier check: 2 of 37 distinctive tokens live; no distinctive live carrier | - | 2026-06-16 |
| `M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md` | stale | 152 | move to history/ | only 0% of named identifiers exist; 10 dangling path refs; carrier check: 0 of 25 distinctive tokens live; no distinctive live carrier | - | 2026-06-16 |
| `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md` | stale | 75 | move to history/ | only 36% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-05-03 |
| `M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md` | superseded | 615 | move to history/ | its head carries a T-283 invalidation or non-operative banner; carrier check: 0 of 31 distinctive tokens live; no distinctive live carrier | T-283 disposition 2026-07-20; direct-GTL design (M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN, M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN) | 2026-07-14 |
| `M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md` | stale | 715 | move to history/ | only 7% of named identifiers exist; carrier check: 2 of 33 distinctive tokens live; no distinctive live carrier | - | 2026-07-14 |
| `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_DERIVATION.md` | stale | 106 | move to history/ | only 0% of named identifiers exist; 4 dangling path refs; carrier check: 0 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_FIRST_SLICE_IACS.md` | stale | 126 | move to history/ | only 10% of named identifiers exist; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 62 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-05-17 |
| `M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md` | stale | 560 | move to history/ | only 23% of named identifiers exist; carrier check: 2 of 18 distinctive tokens live; no distinctive live carrier | - | 2026-07-14 |
| `M04_BOOTLOADER_DERIVATION.md` | record | 82 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_BOOTLOADER_FIRST_SLICE_IACS.md` | record | 74 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 69 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_CONTROL_LOOP_DERIVATION.md` | stale | 115 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M04_CONTROL_LOOP_FIRST_SLICE_IACS.md` | stale | 126 | move to history/ | only 11% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 160 | move to history/ | only 9% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M04_EVENT_INGRESS_DERIVATION.md` | stale | 111 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_EVENT_INGRESS_FIRST_SLICE_IACS.md` | stale | 115 | move to history/ | only 9% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 11 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 148 | move to history/ | only 11% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M04_FIRST_SLICE_IACS.md` | stale | 120 | move to history/ | only 11% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M04_GAP_TRIAGE_GRAPH_FUNCTION_DERIVATION.md` | stale | 91 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 1 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M04_INSTALL_BOOTSTRAP_DERIVATION.md` | record | 111 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md` | record | 104 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 106 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_LIVE_STATUS_DERIVATION.md` | stale | 107 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_LIVE_STATUS_FIRST_SLICE_IACS.md` | stale | 102 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 137 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_M05_INSTALLED_CONSENSUS_SCENARIO_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` | superseded | 308 | move to history/ | T-283 banner; installed Consensus scenario replaced by the accepted S05 design | M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN | 2026-07-20 |
| `M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md` | stale | 178 | move to history/ | only 23% of named identifiers exist; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_MAXIMUM_AUTONOMY_GEN_START_FIRST_SLICE_IACS.md` | stale | 140 | move to history/ | only 14% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 2 of 12 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_MAXIMUM_AUTONOMY_GEN_START_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 98 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md` | record | 112 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md` | record | 99 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 118 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md` | record | 420 | move to history/ | candidate retrospective; names `DS1_CAPABILITY_CONTRACT_REGISTER` only in a gap table; its public-operation part is superseded by M05_S06_PUBLIC (which says so) | - | 2026-07-12 |
| `M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md` | record | 164 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-05-08 |
| `M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md` | record | 98 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-05-08 |
| `M04_PUBLIC_GAPS_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 76 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md` | superseded | 2782 | move to history/ | T-283 banner; M05_S06_PUBLIC re-derives its useful contracts; the 2026-11-02 edit (`6dffbc0ad`) only renamed the `pending_execution` arm and left the banner | M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN | 2026-11-02 |
| `M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md` | record | 265 | move to history/ | contraction closed with T-277; names live `PublicOperationId` only as a contraction subject | - | 2026-07-15 |
| `M04_PUBLIC_START_DERIVATION.md` | stale | 133 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-06-18 |
| `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 240 | move to history/ | only 33% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M04_RESULT_ASSESSMENT_DERIVATION.md` | stale | 110 | move to history/ | only 0% of named identifiers exist; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md` | stale | 114 | move to history/ | only 8% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 152 | move to history/ | only 9% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md` | stale | 88 | move to history/ | names fewer than 5 code identifiers; carrier check: 1 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-06-27 |
| `M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW.md` | record | 40 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-06-27 |
| `M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS.md` | stale | 50 | move to history/ | only 17% of named identifiers exist; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-06-27 |
| `M04_TYPESCRIPT_INSTALLER_DERIVATION.md` | stale | 143 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-06-27 |
| `M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md` | stale | 123 | move to history/ | only 4% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 1 of 27 distinctive tokens live; no distinctive live carrier | - | 2026-06-27 |
| `M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 140 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-27 |
| `M05_ARCHIVE_FINALIZATION_DERIVATION.md` | record | 99 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_ARCHIVE_FINALIZATION_FIRST_SLICE_IACS.md` | record | 82 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_ARCHIVE_FINALIZATION_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 106 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md` | stale | 50 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_FIRST_SLICE_IACS.md` | stale | 62 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 52 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md` | stale | 110 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 1 of 17 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M05_ENTRY_PROOF_GATES_BEHAVIOR_DESIGN.md` | stale | 236 | move to history/ | only 11% of named identifiers exist; carrier check: 2 of 19 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md` | record | 116 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 15 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md` | record | 75 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 90 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md` | record | 85 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 1 of 7 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_RESET_POSTMORTEM_FIRST_SLICE_IACS.md` | record | 75 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_RESET_POSTMORTEM_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 61 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_SANDBOX_DERIVATION.md` | record | 109 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md` | record | 107 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 113 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md` | record | 66 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md` | record | 69 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 9 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_PUBLIC_SANDBOX_ARCHIVE_API_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 61 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md` | stale | 75 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 0 of 3 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md` | record | 170 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 31 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_QUALIFICATION_DERIVATION.md` | stale | 110 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M05_QUALIFICATION_FIRST_SLICE_IACS.md` | stale | 115 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 149 | move to history/ | names fewer than 5 code identifiers; owns by the M01-M06 module decomposition; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M05_RC_LIVE_PORTFOLIO_DERIVATION.md` | stale | 96 | move to history/ | only 0% of named identifiers exist; carrier check: 0 of 13 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `M05_RC_LIVE_UAT_DERIVATION.md` | stale | 131 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-06-09 |
| `M05_RELEASE_SNAPSHOT_DERIVATION.md` | stale | 90 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 5 distinctive tokens live; no distinctive live carrier | - | 2026-05-22 |
| `M05_RELEASE_SNAPSHOT_FIRST_SLICE_IACS.md` | stale | 75 | move to history/ | only 0% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 8 distinctive tokens live; no distinctive live carrier | - | 2026-05-22 |
| `M05_RESEARCH_PRODUCT_LAB_SCENARIO_CATALOG_DERIVATION.md` | stale | 77 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; carrier check: 2 of 17 distinctive tokens live; no distinctive live carrier | - | 2026-07-12 |
| `M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md` | record | 1532 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 5 of 80 distinctive tokens live; no distinctive live carrier | - | 2026-07-28 |
| `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md` | stale | 114 | move to history/ | names fewer than 5 code identifiers; derives from the withdrawn Python tenant; owns by the M01-M06 module decomposition; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md` | stale | 78 | move to history/ | only 17% of named identifiers exist; owns by the M01-M06 module decomposition; carrier check: 0 of 12 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md` | stale | 130 | move to history/ | only 33% of named identifiers exist; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-26 |
| `M06_MAPPING_DEFERRED_DERIVATION.md` | record | 88 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 4 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md` | record | 66 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 2 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `M06_MAPPING_DEFERRED_TRIGGER_IACS.md` | record | 79 | move to history/ | status is completed, closed, retrospective, historical or reserved 5.1; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `MIGRATED_TYPESCRIPT_DESIGN_SOURCE_AUDIT.md` | record | 129 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 14 distinctive tokens live; no distinctive live carrier | - | 2026-04-30 |
| `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md` | stale -> **superseded** | 120 | move to history/ | derivation from the paused Python reference design (0 of 21 distinctive tokens live); the constitution's authority flow has no Python reference step | ABI5_REALIZATION_CONSTITUTION §1 (authority flow) | 2026-04-30 |
| `README.md` | record | 582 | move to history/README_BEFORE_2026-11-12.md; new index written | historical narrative; moves to `history/README_BEFORE_2026-11-12.md` and is replaced by a present-tense index | - | 2026-10-27 |
| `REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md` | record | 106 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 45 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md` | record | 99 | move to history/ | name is a register, census, audit, plan, review, template, ADR or index; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-04-24 |
| `SCHEDULE_DOMAIN_MODULE_DERIVATION.md` | stale | 27 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `SCHEDULE_RUN_PROJECTION_AND_SLA_ANALYTICS.md` | stale | 13 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `SLA_TELEMETRY_HOMEOSTATIC_FEEDBACK.md` | stale | 12 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 1 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `T176_GTL_LANGUAGE_CAPABILITY_TS_HOW_AND_GAP_ANALYSIS.md` | record | 126 | move to history/ | gap analysis read-model; names live `GtlProgramConformanceInput` only as an analysed surface | - | 2026-06-30 |
| `T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md` | record | 69 | move to history/ | a plan; Phase 2 is realized in `shared/owned_process_state.ts` and designed by ABI5_COMMON §10 (process family); GOALS.md names it as the adopted plan; `scripts/check-lifecycle-boundary.mjs:43` cites it | - | 2026-11-10 |
| `T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md` | current -> **record** | 674 | move to history/ | roadmap: its R2 and R3 parts are proposed and unratified; the ratified parts are designed by the C0-C3 and R2 notes | - | 2026-09-06 |
| `TIMER_PROVIDER_CONTRACT_SKETCH.md` | stale | 21 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `TWO_STAGE_EVALUATION_MODEL.md` | stale | 19 | move to history/ | names fewer than 5 code identifiers; carrier check: 0 of 0 distinctive tokens live; no distinctive live carrier | - | 2026-05-07 |
| `TYPESCRIPT_REALIZATION_GUARDRAILS.md` | stale -> **superseded** | 393 | move to history/ | tenant design law derived from STDO v2.5.0-rc.6; the constitution is now the operative local realization authority | ABI5_REALIZATION_CONSTITUTION §1 (sole local disambiguation of the selected STDO) | 2026-07-12 |
| `TYPESCRIPT_STRICT_LANE.md` | stale | 238 | move to history/ | names fewer than 5 code identifiers; 2 dangling path refs; owns by the M01-M06 module decomposition; carrier check: 0 of 6 distinctive tokens live; no distinctive live carrier | - | 2026-04-25 |
| `adrs/ADR-040-typescript-tenant-as-package-first-realization.md` | record -> **superseded** | 94 | move to history/adrs/ | package-first realization decision restated by the constitution | ABI5_REALIZATION_CONSTITUTION | 2026-04-30 |
| `adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md` | record -> **superseded** | 107 | move to history/adrs/ | carrier and event ownership is stated by the events requirement and the constitution | REQ-R-ABG3-EVENTS; ABI5_REALIZATION_CONSTITUTION | 2026-04-24 |
| `adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md` | record -> **superseded** | 102 | move to history/adrs/ | stated by the convergence requirement and the constitution; ABI5_STDO3 links it | REQ-R-ABG3-CONVERGENCE; ABI5_REALIZATION_CONSTITUTION | 2026-04-24 |
| `adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md` | record -> **stale** | 132 | move to history/adrs/ | `AdvancementTransition` is absent at head | - | 2026-04-24 |
| `adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md` | record | 364 | move to history/adrs/ | closed T-277 method gate | - | 2026-07-16 |
| `adrs/ADR-045-global-design-constraints-survive-local-projection.md` | record | 57 | move to history/adrs/ | proposed rationale, never ratified; M05_S05 links it | - | 2026-07-27 |
| `adrs/ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md` | record -> **superseded** | 77 | move to history/adrs/ | catalog application is designed by the accepted catalog contraction; M05_S05 links it | T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN | 2026-07-27 |
| `adrs/ADR-047-reflective-optimization-is-gtl-over-replay.md` | record | 129 | move to history/adrs/ | held 5.1 candidate; `classification.json` names it as evidence | - | 2026-07-28 |
