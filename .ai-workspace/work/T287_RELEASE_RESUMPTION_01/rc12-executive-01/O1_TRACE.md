# O1 Trace: Re-home The Standard System Program Onto The Executive

Package O1, read-only trace and design proposal. Worktree
`/private/tmp/abg-rc12-foldback-20261111`, branch `claude/rc13-one-surface`,
base `34aafb2c6`. `T` = `build_tenants/abiogenesis/typescript`. Line numbers
are at `34aafb2c6`. A claim marked *inferred* was not run and not fully read.

## Answer

By reading, not by any run, re-homing is feasible without a new event kind,
payload class or Public contract change as option (b): a new thin supervised
system Program in the existing eight-locus One Surface shape, whose four
distinct F_D authority leaves wrap one workflow call to the library
`executive` GraphFunction over product-local native carriers that the
Consensus-free ABG admission code already handles. Option (a), declaring the
library `executive` Program the standard system program, would make A5-F07
false, because the Executive merges model, gap and next-action judgment into
one F_P `select` call, spreads action evaluation over `fold` and
`evaluate-parent`, has no ConstructionComposition, and is a `direct`,
explicitly selected Program. Retiring Consensus without (b) leaves the default
`rootMode: supervised` with no shipped Program target, since
`program://abg/system/consensus-one-surface@5` is the only shipped supervised
Program with a start, and no test starts even that Program at runtime today.

## Mapping Table

| Authority or boundary | Consensus One Surface (base) | Executive (default library) | Proposed (b) thin system Program |
|---|---|---|---|
| `synthesizeModel` | F_D locus 0 `synthesizeConsensusModel` `T/code/src/gtl/consensus.ts:981`. Refresh locus 5 `refreshConsensusModel` :1372. | No distinct counterpart. The nearest are intake `constructGovernanceWorkState` (`T/code/src/product/default_library.ts:121-129`) and the `interpretation` and `contributions` fields of the F_P `select` judgment (`T/code/src/product/default_library.ts:46-47`). | New F_D leaf at loci 0 and 5 over the GovernanceWorkState root input and the authenticated basis. |
| `evalGap` | F_D locus 1 `evaluateConsensusGap` :1011, producing `next_action_basis`. Refresh locus 6 `refreshConsensusGap` :1427. | Split. The fresh observation is `prepare-selection` (F_D; `T/code/src/abg/default_library.ts:107-125`, `T/code/src/implementation/default_library.ts:67-72`). Pressure is computed in `evaluate-parent` (`unresolvedSupportRefs`, `reviewStanding`; `T/code/src/abg/default_library.ts:524-571`) and in the F_P `gaps` field (`T/code/src/product/default_library.ts:48`). | New F_D leaf producing `next_action_basis`. `targetInput` is the state, and the catalog has one row. |
| `evaluateNext` | F_D locus 2 `selectConsensusNextAction` :1138, producing a selected `next_action_projection` over a one-row catalog (:4829-4847). Refresh locus 7 `refreshConsensusNextAction` :1439, yielding `converged`. | The F_P `select` call (`nextGraphFunctionRef`; `T/code/src/implementation/default_library.ts:109-140`) plus the `project-choice` F_D (`T/code/src/abg/default_library.ts:256-300`). | New F_D leaf selecting the single action "invoke executive". Refresh yields `converged`, or no action. |
| Intent admission (ABG) | `construction_intent_selected` (`T/code/src/abg/traversal_route.ts:5035-5047`, via `constructionIntentForAdvance` :1494-1766). | Registered selection, admitted as `traversal_route_admitted` with routeKind `advance` carrying `registeredSelectionApplicationRef` (`T/code/src/hog/route_proposal.ts:395-420`, `:765-785`; `T/code/src/abg/registered_selection_provenance.ts:57-90`). This is not `construction_intent_selected`. | Outer: `construction_intent_selected`, unchanged. Inner: registered selection, unchanged. |
| Invocation (ABG) | `c_workflow` at locus 3 to `graph-function://abg/consensus/submitter-reviewer-rounds`. | Wrapper workflow calls to native work, assessment or C2 (`T/code/src/gtl/default_library.ts:38-54`). | `c_workflow` at locus 3 to `graph-function://abiogenesis/default-library/executive@5`. |
| Evidence admission (ABG) | `deriveGraphFunctionActionEvaluationBasis` (`T/code/src/abg/traversal_route.ts:2146-2279`, which needs the child's `terminal_reached` and `graph_call_closed`), then `construction_delta_observed` (:5080-5092). | `c_call_result_admitted` plus `child_foldback_admitted`; `fold` (`T/code/src/abg/default_library.ts:465-523`). | Outer: unchanged generic path. Inner: unchanged. |
| `evaluateAction` | F_D locus 4 `evaluateConsensusAction` :1262, producing an `action_evaluation_projection` with a fulfilled `edge_fulfillment_ledger` and a `close_candidate` closure decision. | Split over the per-step `fold` and `evaluate-parent`. There is no edge ledger and no closure decision. Closure is the recursion termination on `$.terminal` (`T/code/src/gtl/default_library.ts:73-84`). | New F_D leaf reading the closed Executive child result. |
| Refresh before the next step | Loci 5-7, read against the `post_evidence` runtime frontier. | Recursion. Each step re-observes the worksite, re-judges with `priorJudgment`, `observations` and `failedAttempts` (`selectionTask` `T/code/src/abg/default_library.ts:247-255`), and the parent recomputes currentness (:524-571). | Outer: loci 5-7. Inner: recursion. |

**Where the Executive merges authorities into one call.**
- One F_P call to `select` returns `interpretation`, `contributions`, `gaps`
  and `nextGraphFunctionRef` together (`T/code/src/product/default_library.ts:46-49`).
  That single response merges the model, gap and next-action authorities.
- `evaluate-parent` (`T/code/src/abg/default_library.ts:524-571`) computes
  gap pressure (`unresolvedSupportRefs`) and closure (`terminal`) in one F_D.
  That merges part of evalGap with evaluateAction.

## Evidence

### Q1. The shipped standard system program

**Identity** (`T/code/src/gtl/consensus.ts:75-200`):
- Program `program://abg/system/consensus-one-surface@5` (:79).
- Start `start://abg/consensus/one-surface@5`.
- GraphFunction `graph-function://abg/consensus/one-surface@5`.
- Authority refs `authority://abg/consensus/{synthesize-model,eval-gap,evaluate-next,evaluate-action}@5`.
- Semantics binding `product-semantics://abiogenesis/system@5` (:337), realized by `ABI5_SYSTEM_PRODUCT_SEMANTICS` (`T/code/src/product/builtin_semantics.ts:631`; its Consensus-specific part is :482-631).
- Capability `abg.capability.graph-function.consensus@5` (`T/code/src/shared/capability_contracts.ts:39`, `:91`).

**Graph.** The term is built at `consensus.ts:4660-4760`, the GraphFunction at
:4761-4808, the action catalog at :4829-4847 (one row,
`action://abg/consensus/invoke@5`) and the ConstructionComposition at
:4851-4887. The Program is at :4888-4920 with `"abg.root_mode": "supervised"`.
Probe 1 printed the loci in this order:

```
synthesizeModel[0] F_D -> evalGap[1] F_D -> evaluateNext[2] F_D -> workflow(submitter-reviewer-rounds) -> evaluateAction[4] F_D -> refresh[5] F_D -> refresh[6] F_D -> refresh[7] F_D
```

The validator law is at `T/code/src/validator/validation.ts:1574-1692`. It
requires:
- exactly four `construction_authority_binding` rows (:1602-1619);
- eight distinct bound loci, each a `c_of` at its own vector index, except
  index 3, which is either a `c_workflow` whose `graphFunctionRef` equals the
  bound locus or one interaction leaf (:1655-1679);
- a `construction_policy` with `requireCompleteEvidence` and
  `requirePostEvidenceRefresh` both true (:1645-1654).

The law does not restrict a `c_of` leaf to F_D (read at :1660-1668). The
authorities are F_D by construction in Consensus.

**The four authorities.**
- Native functions: `constructConsensusObservationSnapshot` :858; `synthesizeConsensusModel` :981; `evaluateConsensusGap` :1011; `selectConsensusNextAction` :1138; `evaluateConsensusAction` :1262; and the refreshes at :1372, :1427 and :1439.
- Implementation realizers: `T/code/src/implementation/consensus.ts:716-819`, with descriptors at :170-235. The bindings are at `consensus.ts:302-329`.
- The carriers are native contracts at `consensus.ts:200-207`: `observation-snapshot`, `model-snapshot`, `next-action-basis`, `next-action-projection`, `action-evaluation-basis` and `action-evaluation`.
- They are not in the mandatory Public publication ids (`T/code/src/product/public_contract_publication.ts:87-102`).

**The ABG side holds no Consensus identity.**
- `git grep -nE "CONSENSUS_IDS|abg/consensus|consensus"` over
  `T/code/src/abg`, `T/code/src/hog`, `T/code/src/validator` and
  `T/code/src/public` returns no hits. The ABG, HoG and validator checks key
  on value kinds (`next_action_basis`, `next_action_projection`) and on the
  composition relation, not on contract refs.
- The code retirement `fb86974e3` touched no file under `abg`, `hog` or
  `validator`. Under `public` it changed only the owner-contract count
  (56 → 55) and its digest
  (`T/code/src/public/binding/owner_contract_source_set.ts:36-37`, :691-693;
  `public_function_family.ts:461`).
- Precedent: the `developer-mini-product` fixture carries its own One Surface
  contract refs, for example
  `contract://developer.example/greeting/next-action-basis@5`
  (`T/test_env/fixtures/developer-mini-product/src/index.ts:142`, :154).
  Renaming the carriers under a system namespace is therefore free on the ABG
  side.

**The ABG boundaries.**
- Intent: `constructionIntentForAdvance` (`T/code/src/abg/traversal_route.ts:1494-1766`; checks at :1629-1700) admits `construction_intent_selected` (:5035-5047). It needs `next_action_basis` and `next_action_projection` carriers whose `observationSnapshot` matches the execution basis on `workspaceBinding` and `actionCatalog`.
- Evidence: `deriveGraphFunctionActionEvaluationBasis` (:2146-2279) and `construction_delta_observed` (:5080-5092).
- Stop: `noActionProjectionForStopRoute` (:1768).
- Replay requires `nextActionProjection` on every `gap_stop` route (`T/code/src/abg/replay.ts:750-760`).
- `run_gaps` projects the two frontiers (`T/code/src/abg/project_read_operation_contracts.ts:139-161`).

**Consumers of the Program identity.**
- In `consensus.ts`: :834, :1167, :1186, :1216, :1775, :2067 (ruling overlay), :4836, :4890, :5130, :5135 and :5198.
- The Public schema asset `abg.schema.consensus-ruling-overlay` consts the ref (`T/code/src/gtl/consensus_schema.ts:703`; `T/contracts/schemas/consensus.schema.json:911`).
- Tests: `a5-f02-canonical-gtl-identity.test.mjs:227, :397, :837`; `r4-catalog-admission.test.mjs:293-322`; `t287-consensus-ref-shape.test.mjs:49, :87`; `m5-consensus-module.test.mjs:57, :622-627, :921, :975, :1004`.
- `T/code/src/public/gap_authority.ts:48` types `PublicStartIdentity.rootMode: "supervised"` but has no constructor callers (read by grep).

### Q2. Start modes

- **Schema.** The `run.invoke` start schema requires `program` (`T/code/src/product/run_operation_contracts.ts:155`). There is no default Program; the caller always names one. `rootMode` is optional and defaults to `"supervised"` (:163; the defaults row is at :110-111).
- **`resolveProgramStart`** (`T/code/src/gtl/public_start.ts:41-132`):
  - `supervised` needs a `declared_start` target whose `startRef` the Program declares, and Program policy `supervised`.
  - `direct` needs target `next` or `asset:`, policy `direct`, and no `startRef`.
  - It is called only for Program targets (`T/code/src/product/execution_resolution.ts:576-611`).
- **Probe 1** (`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/o1-probe.mjs`, pure, against the existing build):

  | Program | `next` / supervised | `next` / direct | `declared_start` / supervised | `declared_start` / direct |
  |---|---|---|---|---|
  | Consensus | refused (`unsupported_control`) | refused | resolved to `start://abg/consensus/one-surface@5` | refused |
  | Library (policy `direct`) | refused | resolved | refused | refused |

- **Probe 2** (`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/o1-programs.mjs`) walked all 23 Programs of the 10 shipped publication constructors:
  - only `program://abg/system/consensus-one-surface@5` is supervised with a start, and only it has a composition;
  - `revision-command-execution@5` is supervised with `starts: []` (`T/code/src/gtl/worksite_command_execution.ts:252-258`);
  - every other Program is `direct`.
- **Verdict: confirmed, with one precision.** A start under the default
  `rootMode` reaches a shipped Program only through the Consensus declared
  start. Retiring Consensus leaves no shipped Program reachable that way.
  `next` under the default mode was already refused at base.
- **Finding, not worked around.** A `graph_function` target bypasses root
  mode. It skips `resolveProgramStart` (`T/code/src/product/execution_resolution.ts:561-575`)
  and is admitted under either `rootMode` with no policy check
  (`T/code/src/abg/invocation_admission.ts:1297-1310`). The supervised-Program
  refusal applies only to direct invoke (`T/code/src/product/invocation.ts:1138-1146`;
  `invocation_admission.ts:956-963`). So a default-mode start of any
  GraphFunction runs without One Surface. This was read only, not run.
- When a selection is invalid, `run_invocation_operation.ts:640-652` falls
  back to `rootMode` `"direct"` for the refusal record.

### Q3. Mapping to the Executive step and the A5-F07 refresh sentence

The table above gives the mapping. The Executive graph
(`T/code/src/gtl/default_library.ts:55-86`) is:
- **`executive` parent:** one `evaluate-parent` F_D plus a recurse application
  over `executive-step`. It terminates on `$.terminal` with foldback `rebind`
  and failed-child classes.
- **`executive-step`:** `prepare-selection` (F_D) → `select` (F_P) →
  `project-choice` (F_D) → registered-selection application → workflow calls
  to the purpose wrappers.

The design states "No ConstructionComposition or mandatory stage sequence is
introduced" (`T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:645-651`).

- **A5-F07 refresh sentence.** "Fresh evidence refreshes model, gap,
  next-action, and action-result truth before the next step"
  (`specification/PRODUCT.md:1370`). Inside the Executive this holds only as
  recursion: each step re-observes and re-judges, and the parent recomputes
  `terminal`, `unresolvedSupportRefs` and review currentness
  (`T/code/src/abg/default_library.ts:524-571`). There are no distinct refresh
  loci and no `post_evidence` frontier.
- **Gaps.** A gap choice is judged not-advance, and the Run stops `blocked`
  (`T/code/src/abg/default_library.ts:283-284`). The stop reading reports
  origin kind `gap` (`T/code/src/abg/project_read_ports.ts:1263-1275`). It is
  not a One Surface `gap_stop`, so the `run_gaps` frontiers are empty
  (`T/test_env/tests/t287-readable-stops.test.mjs:148`, :203-209).
- **Bound exhaustion.** It yields a blocked completion
  (`T/code/src/hog/recursion_lifecycle.ts:560-580`;
  `reason://abiogenesis/recursion/bound-exhausted@5` at
  `T/code/src/abg/traversal_route.ts:4986`).

### Q4. Tests and scenarios for A5-F07 and ABG5-S03

- **S03.** S03 is proved only on the fixture
  `T/test_env/fixtures/t287-s03-automatic-product/index.mjs`, a Program
  `ref('program','root')` with 8 terms and a span re-entry application.
  - The support is `T/test_env/support/t287-s03-automatic.mjs`. It starts with
    `rootMode:'supervised'` and a `declaredStartRef` (:165) and asserts the
    loci order (:88).
  - The test is gated by `ABI5_S03_EVIDENCE_ROOT` and `ABI5_S03_PHASE_B_RELEASE`
    (test file :5-16).
  - The qualification coverage claim for S03 names only
    `ABG5-S03/retained-human-boundary` (`T/contracts/qualification/coverage.json:306-318`).
- **Other S03-shaped tests.** `m5-s03-authority.test.mjs` runs on the worksite
  construction (`direct`) Program. The `developer-mini-product` fixture has
  its own One Surface Program (`T/test_env/fixtures/developer-mini-product/src/index.ts:125`, :4722-4726).
- **A5-F07.** No test or script starts the shipped Consensus One Surface
  Program at runtime.
  - Checked by `git grep` over `test_env` and `scripts`. The only hits are
    structural uses and the fixture above.
  - The retained Run `T/test_env/proof/abi5-root-r10.events.jsonl` is
    `program://abiogenesis/conformance/hello-world@5`, and its test is retired
    (`m5-consensus-module.test.mjs:1543-1553`).
  - T-287 states it plainly: "One Surface code exists around Consensus; the
    general stage/evidence/repair composition remains unproved"
    (`.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:4079`).
- **`m5-consensus-module.test.mjs`.** It has 17 cases, all named S05 and all
  structural. Its case at :655 is the only test of the non-callable
  contract-ref law (`T/code/src/validator/validation.ts:667-669`); this is
  RV4 F2.
- **What moves under (b).**
  - Add one new ungated test that starts the new system Program at runtime
    (the A5-F07 proof on the shipped program).
  - Move the :655 law case onto the new Program or the fixture.
  - Re-point, or retire with Consensus, the structural ref uses in `a5-f02`,
    `r4-catalog-admission` and `t287-consensus-ref-shape`.
  - S03 stays on the fixture. REQ-P-SCENARIOS-010 requires "one admitted GTL
    program", not the standard system program
    (`specification/requirements/product/REQ-P-SCENARIOS.md:123-124`).

### Q5. Options

**(a) Declare the library `executive` Program the standard system program.
Rejected.**
- **Merged authorities.** The single F_P `select` merges model, gap and next
  (`T/code/src/product/default_library.ts:46-49`). A5-F07 and REQ-P-POLICY-023
  require four distinct authorities, with ABG separately admitting
  construction intent (`specification/PRODUCT.md:1370`;
  `specification/requirements/product/REQ-P-POLICY.md:176-181`).
- **Graph shape.** The validator law (`validation.ts:1655-1679`) needs eight
  linear loci in one compose chain. The Executive is a recurse application
  plus a registered selection (`T/code/src/gtl/default_library.ts:55-86`).
- **Design.** The library design rules out a ConstructionComposition
  (`T/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:645-651`).
- **Root mode cascade.** Flipping the library Program to `supervised`
  requires a declared start and refuses `next` (probe 1). That breaks:
  - every consumer that clones `library.programs[0]` policies (`T/test_env/support/default-library.mjs:22-25`);
  - the library tests that start with target `next` under `direct` (`t287-default-library.test.mjs:442`, :1538, :2729);
  - the scripted selector support default (`T/test_env/support/registered-graph-selection.mjs:236`).
- **Product text.** It conflicts with "explicitly selected, replaceable
  compositions" (`specification/PRODUCT.md:1122`) and with the non-feature
  "hidden default programs" (:1632).

**(c) A system Program whose `evaluateNext` locus is the Executive's F_P
`select`. Considered, not recommended.** The validator does not forbid an F_P
`c_of` there. But the `select` response would have to become a
`next_action_projection` carrier (a change to the library judgment contract).
Model and gap would stay merged in it. *Inferred*; not traced further.

**(b) A thin supervised system Program over the Executive. Recommended.**

**Identities** (names subject to ruling R2):
- `program://abiogenesis/system/one-surface@5`
- `start://abiogenesis/system/one-surface@5`
- `graph-function://abiogenesis/system/one-surface@5`
- four authority refs `authority://abiogenesis/system/{synthesize-model,eval-gap,evaluate-next,evaluate-action}@5`
- one action `action://abiogenesis/system/invoke-executive@5`
- six native contracts under `contract://abiogenesis/system/...@5`

**Shape.** The eight loci are the same as Consensus's. Index 3 is a
`c_workflow` whose `graphFunctionRef` is
`graph-function://abiogenesis/default-library/executive@5`. Policies:
- `abg.root_mode: supervised`;
- the library's `abg.run_environment` and fulfillment policies, since the
  library `owner()` reads `owned.program` (`T/code/src/abg/default_library.ts:66`);
- a `callableMembership` of the system GraphFunction, the library GraphFunctions and the worksite GraphFunctions. This is the same set the witness consumer builds (`T/test_env/support/default-library.mjs:23-24`).

**Root input.** The input is a fresh GovernanceWorkState. The library
`owner()` authenticates the invocation root's raw input as a fresh, non-terminal
GovernanceWorkState (`T/code/src/abg/default_library.ts:59-66`) and requires
exactly one capability grant (:56). evalGap passes the state as `targetInput`,
so the workflow child receives the same `original` (:69). *Inferred*, not run.

**Files.**
1. A new GTL module, for example `T/code/src/gtl/system_one_surface.ts`. It
   holds the IDs, the seven F_D terms, the GraphFunction, the one-row
   ActionCatalog, the ConstructionComposition, the Program and the start.
   It is modeled on `consensus.ts:4660-4920` (260 lines).
2. The native F_D functions: observation snapshot, synthesize, evalGap,
   select-next, evaluate-action and the three refreshes. They are rewritten
   from `consensus.ts:858-1500` over the GovernanceWorkState in place of
   ConsensusInvocation. evaluateAction reads the closed Executive parent
   result (`terminal`, `unresolvedSupportRefs`, `reviewStanding`) and records
   `close_candidate`, or a block disposition when the result is not satisfied.
3. Implementation descriptors and realizers, from
   `T/code/src/implementation/consensus.ts:170-235` and :716-819.
4. `ABI5_SYSTEM_PRODUCT_SEMANTICS` (`T/code/src/product/builtin_semantics.ts:482-631`).
   It keeps the binding `product-semantics://abiogenesis/system@5`, drops the
   Consensus input admission and projections, and delegates governance kinds
   to `ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS` (:1031-1084).
5. `T/scripts/generate-product-manifest.mjs:1203-1218`: add the module
   publication and its binding.
6. `T/code/src/shared/capability_contracts.ts:39`, :91: a system GraphFunction
   capability row, unless the Consensus row is retained.
7. One new design note. Edits to the AF-11..AF-16 citations in
   `T/design/M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md:161-167`. The
   library design sentence at `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:645-651`
   stays true, because the ConstructionComposition belongs to the system
   Program, not the library.

**Placement.**
- A separate system module leaves the library publication digest and its pins
  unchanged and adds one publication binding.
- Placing it inside the library module changes the library publication digest
  and every pin on it.
- Recommended: the separate module.

**Public contract effects.** None required.
- The `run.invoke` start schema is unchanged.
- The six carriers are native contracts.
- The new Program and start are catalog content, not operation contracts.
- The Public schema asset `abg.schema.consensus-ruling-overlay`, which consts
  the old Program ref, leaves with the Consensus retirement, not with the
  re-home.

**Replay-digest effects.**
- No new event kind. The re-home uses `construction_intent_selected`,
  `construction_delta_observed`, the registered-selection advance and
  `child_foldback_admitted` as they are.
- The replay rules (`T/code/src/abg/replay.ts:633-762`) are unchanged.
- Recorded Runs keep their exact bases.
- New Runs of the system Program carry a new Program digest and a new Product
  install basis.

**Pins that move** (*inferred*, census not run):
- the generated `product-toolchain-manifest.json` and capability graph;
- the publication bindings;
- count-pinned tests: `wave2-owner-contract-source-set`, `pfc-f08a`, `st2a-g` and the W2-05 generator;
- `EXACT_OWNER_CONTRACT_KEY_SET_DIGEST`, which moves only with the Consensus retirement, not with the re-home;
- qualification source mirrors, only if specification text changes.

**Test plan.** One new ungated test file, for example
`a5-f07-system-one-surface.test.mjs`. It uses the scripted selector already
used by `t287-readable-stops.test.mjs` and runs one file at a time.
- **Case 1.** Install, then start the system Program with the default
  `rootMode` and `declared_start`. Assert the locus order. Assert
  `construction_intent_selected` before the workflow, the workflow to
  `executive@5`, `construction_delta_observed` after evaluateAction, the three
  refresh loci reading `post_evidence`, and `converged`.
- **Case 2.** The scripted selector returns a gap. Assert a `blocked` stop
  with origin kind `gap` and a human-readable handoff, and no false
  completion.
- **Case 3.** The non-callable contract-ref law case moved from
  `m5-consensus-module.test.mjs:655`.
- **Regression.** Run the existing library, S03 fixture and readable-stops
  files one at a time.

**Product and requirement sentence changes.** None required.
- `specification/PRODUCT.md:1061-1076`, :1370 and
  `specification/requirements/product/REQ-P-POLICY.md:59-67`, :176-183 stay
  true as written.
- Optional: name the system Program identity in PRODUCT.
- `specification/INTENT.md:175` changes with the Consensus retirement (re-apply
  `a61231c6a`), not with the re-home.
- T-287 rows :4040, :4079 and :4080 are rewritten.

**Size** (*inferred* from line counts).
- About 1.3k lines of existing One Surface code are read and re-homed: IDs and
  functions at `consensus.ts:858-1500`, the publication at :4660-4920, the
  implementation at :170-235 and :716-819, and the semantics subset at
  `builtin_semantics.ts:482-631`.
- The rewrite yields about 0.6-0.9k lines of new code.
- Plus a 0.2-0.4k line test and a 0.1-0.15k line design note.
- Plus regenerated manifests and pin updates.
- The Consensus retirement then re-applies at about −15k lines.

**Order.**
1. Land (b) with Consensus still present, and prove case 1 and case 2.
2. Re-apply the retirement (`fb86974e3` and `f4aad7d5e`, minus their One
   Surface conflicts), then `a61231c6a`.
3. Discharge RV4 F2-F12.

**Runtime risks** (*inferred*, each one a stop rather than a workaround):
- The F_D leaves may not reach `workspaceBinding` and the action catalog
  through the authenticated basis. The Consensus leaves do it through
  `occurrence.nativeInstructionAssemblyBasis`.
- The Executive's `abg.child_closure_contract: closure-child`
  (`T/code/src/gtl/default_library.ts:35-37`) may not compose as a
  `c_workflow` callee.
  - Static precedent for a recursing callee: the Consensus locus-3 callee
    `submitter-reviewer-rounds` (`T/code/src/gtl/consensus.ts:4321`) itself
    holds two recurse applications. The rounds application terminates on
    `$.terminal` with `rebind` foldback (:4183-4198, :4385), the same shape as
    the Executive parent.
  - That precedent is admitted statically only; it was never run (Q4).
- An inner Executive gap or bound exhaustion stops the whole Run `blocked`
  before evaluateAction. On this Program the S03-style block is therefore the
  stop reading, not a `run_gaps` frontier.
- The outer loop is single-pass. This is the same degenerate shape as
  Consensus.

### Q6. `claude/rc12-consensus` after re-homing, and RV4

**Commits.** All five are ancestors of `34aafb2c6`. CB reverted four of them
(`d4ffd8923`, `b05952184`, `b0327828e`, `10cb10e89`).

| Commit | Status | Reason |
|---|---|---|
| `da1d589a9` ("A system program" rewording of PRODUCT.md and REQ-P-POLICY.md) | Does not re-apply. | It is the rejected route. |
| `a61231c6a` (INTENT.md:175, RV4 F5) | Re-applies as is when Consensus retires. | |
| `f4aad7d5e` (Product, requirements and design retirement) | Re-applies. | It never touched the PRODUCT System And One Surface section or A5-F07. Its One Surface removals are all inside REQ-P-CONSENSUS.md. Its edits to `M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md` (10 lines) and `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` must re-cite the new system Program. |
| `fb86974e3` (code retirement) | Conflicts. | It deletes `consensus.ts` (5,267), `implementation/consensus.ts` (819) and `ABI5_SYSTEM_PRODUCT_SEMANTICS` (`builtin_semantics.ts` −381) wholesale. It must re-apply after the One Surface parts are extracted. Its re-pointing of `a5-f02` and `r4-catalog-admission` can be kept, or those tests can target the new ActionCatalog. |
| `be05bbfbc` (intent amendment) | Stands. It was never reverted. | Together with W3 `056ac6a78` it remains RV4 F8. |

**RV4 findings** (`reviews/RV4_REVIEW.md`):
- **F1** is discharged by (b) only when case 1 passes on the shipped system
  Program.
- **F2-F12** still apply at retirement time:
  - F2: move the law case.
  - F3: stale INTENT mirror.
  - F4: change authority, and T-287 :4040, :4079, :4080.
  - F5: re-apply `a61231c6a`.
  - F6: W2-05 and steel tests view only callable rows.
  - F7: dead residue in `product/semantics.ts` and `public/run_projection_authority.ts`.
  - F8: intent amendment without a Product derivation.
  - F9-F12: manifest, lint, rule re-mint and REQ-P-CATALOG 009A.

## Rulings Needed

- **R1. Change class.** This is a `design_reframe` under stable requirements.
  It needs a recorded change authority for the Consensus retirement and the
  T-287 rows (RV4 F4).
- **R2. Identity.** Use the new `abiogenesis/system/one-surface` names, not
  the `consensus` names.
- **R3. Placement.** Use a separate system module that keeps the semantics
  binding `product-semantics://abiogenesis/system@5`. The alternative, inside
  the library module, moves the library digest and its pins.
- **R4. Root input.** Use a fresh GovernanceWorkState, with no `owner()`
  change. The alternative is a new system request contract plus an `owner()`
  change at `T/code/src/abg/default_library.ts:59-66`.
- **R5. Two-level admission.** The outer `construction_intent_selected` admits
  "invoke executive" and the inner registered selection admits which graph
  runs. The ruling needed is whether these are two distinct admissions, not a
  duplicate evaluateNext authority under the compression boundary
  (`specification/PRODUCT.md:1327-1332`). Consensus used the same layering
  with a one-row catalog (`consensus.ts:4829-4847`).
- **R6. Library mode.** The library Program stays `direct` and explicitly
  selected (`specification/PRODUCT.md:1122`).
- **R7. S03 and QUAL-059 carriage.** S03 stays proved on the gated fixture.
  The ruling needed is whether the inner blocked stop plus the stop reading
  satisfies A5-F07's block on the shipped Program. Also, does the fixture or
  the system Program carry REQ-P-QUAL-059's "one admitted GTL One Surface
  program" with its frontier clause
  (`specification/requirements/product/REQ-P-QUAL.md:286-298`)?
- **R8. graph_function bypass.** Is the root-mode bypass for `graph_function`
  targets in scope (Q2)? Re-homing does not need it.

## What I Did Not Check

- I did not build or run (b). Every runtime claim about it is inferred:
  - basis access for the F_D leaves;
  - `closure-child` as a `c_workflow` callee;
  - `owner()` acceptance under a system-Program root;
  - the run environment and selector role binding;
  - the one-grant rule.
- The `graph_function` bypass was read, not run.
- I ran no test file and no build. The probes were pure reads of the existing
  build.
- The pin census is inferred from file names and the C_RETURN counts. It was
  not computed.
- I did not read the rest of REQ-P-SCENARIOS-010 beyond the paragraph quoted
  in Q4, or all 23 Programs' policies beyond root mode, starts and composition.
- Same-family limit: the author and any reviewer of this trace are Claude
  models.
