---
id: T-152
title: Admit GTL program conformance gate for downstream graph assets
type: feature
ticket_category: ordinary
status: active
proof_status: pending
goal: provide one ABG-owned static GTL program admission/typecheck function that downstream products can call before ABG runtime execution to prove graph functions, graph vectors, target-carrier rows, closure rows, prompt assets, plugin contracts, public starts, overlays, and active ABG identity surfaces are lawful
change_class: requirement_reprice
change_intent: Make GTL program conformance a deterministic ABG API function with a thin CLI wrapper instead of downstream-local lint rules, MCP-shaped prompt schema, or agent-memory checks.
re_entry_point: requirements
created_at: 2026-06-08
updated_at: 2026-06-12
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPH.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - .ai-workspace/tickets/completed/T-150-promote-prompt-assets-into-gtl-typed-asset-interface.md
related_tickets:
  - T-150
  - T-151
  - T-149
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  design:
    - build_tenants/abiogenesis/typescript/design/README.md
    - build_tenants/abiogenesis/typescript/design/M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_GTL_PROGRAM_CONFORMANCE_GATE_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/common/design/modules/M03-engine-kernel.yml
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_intent.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/construction_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/cli/command.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/shared/engine_authority_fields.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t152_contract_fulfillment_binding_api.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t103_graph_span_reentry_unit.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t127_fp_consciousness_loop_unit.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t139_construction_pressure_package.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t149_iteration_state_action_algebra.test.mjs
target_truth: Downstream GTL/ABG programs are admitted through one ABG-owned programmatic API, `typecheckGtlProgram(...)`, with `admitGtlProgramConformanceInput(...)` as its raw-input gate and `abiogenesis-ts typecheck-gtl-program` as a thin CLI wrapper. The function evaluates the supplied GTL program inventory against GTL graph interface law, graph-vector identity law, target-carrier row law, closure row law, prompt AssetSurface view law where the downstream row declares a prompt invocation asset, supplied plugin/public-start/overlay row law, active source identity law, feature-coverage owner law, expected coverage, and the runtime re-entry surfaces needed to route nonlocal repair pressure through ABG construction intent and graph-vector re-entry. Report identity is evidence-bound to the normalized audited inventory. Features without first-class inventory fields remain explicit manifest attestations until this ticket admits those fields.
superseded_truth: Downstream products can prove GTL/ABG graph conformance by local scans, prompt prose, method-in-context, or partial inventories that pass when omitted.
closure_law: This ticket closes only when the TypeScript source is tracked, exported, buildable, callable programmatically, callable through the CLI wrapper, and tested against empty/partial inventories, malformed raw input, unsatisfied graph dependencies, duplicate target/closure rows, duplicate display labels with distinct opaque vector identity, current ABG engine-authority flag bypasses, prompt asset row completeness, plugin admission, exact ABI package version, stale active ABG identity, evidence-bound report identity, stage-compute composition contracts binding `transform.C`, `evaluate.C`, and `consequence.C` to selected `F_D`/`F_P`/`F_H` regime participation and governed plugin contracts, runtime re-entry inventory proving nonlocal repair-surface pressure can select `reenter_graph_span` through admitted construction intent and existing `GraphReentryPoint` plus target-vector identity, and a downstream-shaped production graph-asset inventory gate.
non_closure_conditions:
  - the function is only present in build output, a temporary package, or an untracked source file
  - the CLI owns rules that the programmatic function does not own
  - downstream products maintain local GTL conformance rules instead of calling the ABG function
  - empty, partial, or caller-selected coverage can pass
  - graph vectors are keyed by display name rather than graphFunctionId, graphId, and graphVectorId
  - duplicate target-carrier or closure rows for one graph-vector identity can pass
  - raw malformed JSON can throw uncaught instead of producing deterministic issue rows
  - engine-authority fields are hand-copied across guards or silently stripped
  - prompt asset row completeness is claimed as GTL AssetSurface constitutional law without an explicit requirement home or scoped row policy
  - `F_*` compute composition can pass with only coarse notation/stage-name strings instead of admitted stage contracts that preserve selected composition identity, `F_D`/`F_P`/`F_H` participation, compute means, stage purpose, input/output carrier refs, evidence refs, and authority-denial flags
  - plugin contracts can be accepted as standalone rows without resolving through the selected `abg.fn_composition`/stage binding chain that authorizes their `transform.C`, `evaluate.C`, `consequence.C`, or external human-callout role
  - proof depends on a local `/tmp` package instead of the source under review or a recut release snapshot
  - a downstream-shaped proof passes by excluding current TypeScript graph assets, prompt construction assets, plugin contracts, or active source identity surfaces
  - nonlocal repair-surface triage collapses to same-edge retry instead of admitted ABG graph-vector re-entry
  - products must implement private retry/re-entry loops because ABG does not consume admitted triage as construction intent
review_gate: high-bar code review and downstream-shaped production-inventory proof required before release
---

# T-152: Admit GTL Program Conformance Gate For Downstream Graph Assets

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: T-150 promoted prompt `AssetSurface` into a GTL typed asset interface.
A downstream ODD product integration exposed a broader single-control-point
requirement: downstream products need a deterministic ABG function that checks
their GTL program inventory before ABG runtime execution.

This is a hard admission/typecheck boundary for current GTL/ABG program shape.

## Scope

- Provide `admitGtlProgramConformanceInput(raw)` for raw JSON/API input.
- Provide `typecheckGtlProgram(raw)` as the programmatic gate.
- Provide `formatGtlProgramConformanceIssues(issues)` for human-readable output.
- Provide `abiogenesis-ts typecheck-gtl-program --input <json>` as a thin CLI
  wrapper over the programmatic function.
- Single-source engine-authority field vocabulary for GTL binding rows, ABG
  plugin contracts, provider outputs, and hook findings.
- Use a downstream-shaped production inventory as the proving domain without
  naming or depending on any downstream ticket.
- Admit runtime re-entry inventory sufficient to prove that nonlocal repair
  pressure is routed by ABG, not by downstream product control loops.

## Audit Checklist

- [x] Source file is tracked and exported from the TypeScript tenant package.
- [x] CLI wrapper delegates to `typecheckGtlProgram(...)`; it does not own
  separate conformance rules.
- [x] Raw malformed input returns deterministic issue rows.
- [x] Expected coverage requires every coverage key and nonzero counts.
- [x] Empty or partial inventories fail closed.
- [x] Graph function interfaces match environment requires/provides.
- [x] Graph traversal derives every graph output from graph inputs and prior
  vector outputs.
- [x] Vector source and target nodes are declared in the graph.
- [x] Target-carrier rows are keyed by graphFunctionId, graphId, and
  graphVectorId.
- [x] Edge-closure rows are keyed by graphFunctionId, graphId, and graphVectorId.
- [x] Exactly one target-carrier row exists for every graph-vector identity.
- [x] Exactly one edge-closure row exists for every graph-vector identity.
- [x] Duplicate display labels with distinct opaque identities are lawful.
- [x] Prompt invocation asset rows are admitted AssetSurface rows with row-local
  rendered-view, constructor, output-contract, authority-slot, proof, node, and
  evidence bindings.
- [x] Plugin contracts are admitted through ABG plugin admission.
- [x] Current engine-authority flags such as `mayWriteLedgers` and
  `maySelectTraversal` are rejected.
- [x] Unknown GTL fulfillment-binding fields fail instead of being stripped.
- [x] Active source identity rows reject stale ABG 3.x URI/path/package forms
  and pre-RC1 labels through the ABG programmatic gate.
- [x] Report identity includes normalized inventory digests.
- [ ] A downstream consumer consumes this ABG function and no product-local
  replacement.
- [ ] A clean downstream live lane passes after the graph inventory gate.
- [x] Runtime re-entry inventory exposes the `GraphReentryPoint` and
  `reentryTargetVectorIndex` surfaces needed to route nonlocal repair pressure.
- [x] Repair-surface triage classified as `upstream_reentry` binds to an
  admitted construction intent whose selected action row is
  `actionKind = reenter_graph_span` rather than defaulting to same-edge retry.
- [x] The ABG engine applies the selected graph-vector re-entry before ordinary
  retry fallback and records replay-visible transition/progress truth.

## T-153 Feature-Coverage Checklist

T-153 establishes `REQ-L-GTL3-CONTRACT-LAW-API` as the constitutional reload
surface. This T-152 gate must grow from current graph-asset conformance into a
feature-coverage typechecker over every T-153 capability family.

Principle: every T-153 family in a downstream program must be either
represented by typed program inventory, explicitly declared `not_used` with
reason refs, or rejected as missing coverage. A caller-selected partial
inventory is not admissible.

- [x] Add an admitted `GtlProgramFeatureCoverageManifest` input owned by ABG,
  not by downstream-local prose.
- [x] Require the feature manifest to enumerate every
  `REQ-L-GTL3-CONTRACT-LAW-API` capability family.
- [x] Fail closed when any T-153 feature family is absent from the manifest.
- [x] Fail closed when a feature is marked `not_used` but matching inventory
  rows exist.
- [x] Bind report identity to the normalized feature manifest and per-feature
  disposition rows.
- [x] Graph structure and interface: materialized graph functions, graph
  vectors, input/output derivability, and vector source/target declaration are
  checked today.
- [x] Core graph algebra: explicitly cover `edge`, `compose`, `substitute`,
  `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity`, and
  `same_object` as named algebra capabilities, not only as materialized vector
  reachability.
- [ ] Composition law: verify composed source/target contracts by identity
  across graph-function/vector composition rows.
- [ ] Substitution law: verify substituted inner graph interface, provided
  outputs, inherited constraints, and no hidden source/target rewrite.
- [ ] Recursion law: verify `recurse(graph_function, termination, foldback)`
  declarations with explicit termination, foldback, lineage, bounds, and
  preserved outer interface.
- [ ] Fan-out/fan-in/gate/promote law: verify operation-specific input/output
  contracts and decision or aggregation declarations.
- [x] Operator declarations: verify `Operator` rows, regime, binding, tags, and
  vector/module attachment.
- [x] Evaluator declarations: verify first-class `Evaluator` rows, regime,
  binding, consumed-field refs, tags, and vector/module attachment.
- [x] Rule declarations: verify first-class rule identity, rule kind, config
  digest, tags, and vector/module attachment.
- [ ] `F_*` compute composition: verify `abg.fn_composition`, `fn<A, B>.C`,
  `transform.C`, `evaluate.C`, `consequence.C`, regime-binding refs,
  stage-binding refs, and closure contract refs as first-class rows.
  Current status: first-class `computeCompositions` rows exist and reject
  malformed row shape, missing notation, missing stage names, empty regime
  refs, and bad digests. Closure remains open until the row is a real
  composition contract chain, not a coarse inventory row:
  - [x] Admit `computeCompositions` rows as deterministic issue-producing raw
    input.
  - [x] Require `fn<A, B>.C`, `transform.C`, `evaluate.C`, and `consequence.C`
    notation refs.
  - [x] Require non-empty regime-binding refs, stage-binding refs, and
    closure-contract refs.
  - [x] Require each `transform.C`, `evaluate.C`, and `consequence.C` stage to
    declare `F_D`, `F_P`, and `F_H` participation or explicit `not_used` /
    external-callout disposition through typed regime rows, not by non-empty
    string arrays.
  - [x] Admit stage-binding rows that preserve selected composition identity,
    compute means, stage purpose, input carrier refs, output carrier refs,
    evidence refs, and authority-denial flags.
  - [x] Require supplied plugin contracts and hook-boundary plugin refs to
    resolve to an admitted stage-binding/composition contract; plugin rows must
    not satisfy composition law by themselves.
  - [x] Require public runtime-binding rows to prove supplied plugin contracts
    are consumed through ABG command/control rather than product-local
    iteration loops.
  - [x] Bind composition/stage/plugin/runtime rows into report identity and add
    negative tests for missing stage rows, missing regime dispositions,
    plugin-without-composition, and local product wrapper composition law.
- [x] Plugin contracts: ABG `EnginePluginContract` admission is checked today
  for supplied plugin rows.
- [x] Hook boundary declarations: verify hook refs, host refs,
  declaration-source kind/ref, precedence rank, concerns, and plugin-contract
  refs as first-class rows.
- [x] Target-carrier contract law: full visible target-carrier row fields are
  checked today.
- [x] Prompt construction and typed assets: rendered prompt invocation
  `AssetSurface` rows, renderer refs, digest policy, constructor refs, proof
  refs, output contracts, authority slots, GTL node, and evidence refs are
  checked today.
- [x] Selection/refinement/synthesis/sub-work: verify `RefinementBoundary`,
  `CandidateFamily`, selection-boundary, synthesis, and sub-work rows as
  first-class language configuration surfaces.
- [x] Module/public-start coverage: module publication, overlays, and public
  start rows are checked today for supplied rows.
- [x] Job and Role binding: verify `Job`, `Role`, contract target refs,
  capability refs, policy hook refs, and public callable graph-function refs.
- [x] External tool gates: verify declared external tool/MCP gate refs as
  ABG-admitted payload/tool boundaries, never as GTL contract-law source.
- [x] Active source identity: stale ABG 3.x URI/path/package forms are checked
  today.
- [x] Owner-disposition report: emit per-feature classification as
  GTL-declared, ABG-admitted/interpreted, downstream product meaning, or
  rejected missing coverage; ABG owns and enforces the owner-classification map
  rather than trusting caller-supplied manifest labels.
- [x] Design Module Method boundary assets: declare the T-152 IACS,
  reference-to-target derivation, subordinate payload register, deterministic
  observation rule, and structural carrier diagram.
- [x] Negative tests prove every open T-153 feature family fails when omitted
  from a program that claims full GTL/ABG conformance.
- [ ] A downstream consumer supplies the feature manifest from production graph
  assets, prompt assets, plugin contracts, overlays, public starts,
  target-carrier rows, and source identity rows.

## Non-Closure Carried Open

The first closure target is a static program gate for the current GTL/ABG
published program inventory. Full algebra-trace checking for every GTL algebra
operation (`compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, and
`promote`) may require a later normalized algebra AST carrier if the current
published carriers cannot reconstruct the trace without adding caller-owned
truth. This ticket must not claim more than it proves.

## Bug Triage - 2026-06-08

Finding: the 4.0.0-rc.2 `typecheckGtlProgram(...)` source-identity scanner
rejected common prose labels such as `abg-3.7`, `ABG 3.7`, `ABG37`, `rc13`, and
`3.9.0-rc.13`, but it missed active URI/path/package identities:

- `runtime://abg/3.8/...`
- `runtime://abg-3-6-live`
- `abg://3.7/...`
- `package:@abiogenesis/typescript-tenant@3.9.0-rc.13#...`

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`. The requirement and target truth already require active
source identity law to be enforced by the ABG-owned programmatic gate. No new
constitutional product behavior is introduced; the realization failed to cover
all known stale ABG identity spellings.

F_D/F_P classification: F_D. The defect is deterministic lexical admission of
active source identity rows. It must be caught by `typecheckGtlProgram(...)`
before ABG runtime execution, not by F_P prompt memory, downstream-local scans,
or MCP-shaped context.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)`; the CLI is still a wrapper over that function.
Downstream products must feed source identity rows into the ABG gate and must
not duplicate this rule locally as their own GTL conformance truth.

## Implementation Update - 2026-06-08

Updated `gtl_program_conformance.ts` source identity scanning:

- Normalizes `_` and `-` version separators before comparison.
- Rejects stale `runtime://abg/<version>/...` URI identities.
- Rejects stale `runtime://abg-<version>...` path identities.
- Rejects stale `abg://<version>/...` graph/policy identities.
- Rejects exact stale `@abiogenesis/...@<version>` package identities against
  `abiPackageVersion`.
- Emits deterministic `source_identity` issue rows from the programmatic gate,
  preserving the full stale URI/package token in the issue message.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker rejects stale ABG URI and package identity forms`

Proof:

- `npm run test:t150` passed 23/23 on 2026-06-08 after the scanner update.

## Bug Triage - 2026-06-08 Target-Carrier Contract Rows

Finding: downstream conformance could pass a lossy target-carrier row that
identified the vector and target asset type but omitted the contract fields
used by runtime admission. That allowed a downstream product to keep effective
target-carrier law in local parser/admission code while ABG certified only a
summary row.

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`, with a successor requirement consolidation filed as
T-153. T-152 already requires the ABG-owned programmatic gate to admit graph
assets, target-carrier contracts, prompt assets, plugin contracts, and
downstream graph assets. The realization was under-specified because it did not
force target-carrier contract law to be visible in the admitted program
inventory.

F_D/F_P classification: F_D. The defect is deterministic structural admission
of program inventory. It must be caught before ABG runtime execution by
`typecheckGtlProgram(...)`, not by F_P review context or SDLC-local parser
conventions.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)` and its raw-input admission function. Target-carrier
rows must carry visible contract declaration fields: contract digest, template,
output surface, carrier family, envelope, fixed protocol fields,
worker-fillable fields, literal domains, schema, admission, payload ledger,
assurance, handoff projection, construction template, replay digest,
materialization policy, and closure precondition refs.

T-153 follow-up: T-153 tracks the constitutional consolidation of GTL as the
contract-law API and graph algebra. The requirement home is now
`specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`. This T-152
fix is the ABG conformance gate realization; T-153 is the REQ/Product reload
surface that prevents future reviewers from reconstructing this law from
implementation code.

## Implementation Update - 2026-06-08 Target-Carrier Contract Rows

Updated `gtl_program_conformance.ts` target-carrier admission:

- Requires full target-carrier contract declaration fields for each supplied
  row.
- Rejects missing carrier contract digest, template, envelope, output surface,
  protocol field, literal-domain, schema, admission, ledger, assurance,
  handoff, construction, replay, materialization, and closure-precondition refs.
- Compares row `schemaRef` against the vector target schema ref, while retaining
  full target node contract projection for graph closure evidence.
- Keeps rows keyed by opaque `graphFunctionId`, `graphId`, and
  `graphVectorId`; display names remain non-authority.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker rejects lossy target-carrier contract rows`

Proof:

- `npm run test:t150` passed 24/24 on 2026-06-08 after the target-carrier row
  update.

## Bug Triage - 2026-06-08 T-153 Feature Coverage

Finding: after T-153 established `REQ-L-GTL3-CONTRACT-LAW-API` as the fast
reload authority, `typecheckGtlProgram(...)` still checked only the supplied
inventory categories. A downstream product could omit an entire T-153 capability
family from the program inventory and still receive a passing report if its
selected coverage counts matched. That preserved the same prompt/API handoff
defect at the program gate: partial caller scope could masquerade as complete
GTL/ABG conformance.

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`. T-153 supplied the constitutional requirement surface;
this slice strengthens the ABG programmatic gate so the requirement is enforced
as deterministic F_D admission before runtime.

F_D/F_P classification: F_D. The defect is feature-coverage admission of
program inventory. It must be caught by `typecheckGtlProgram(...)`, not by
agent memory, prompt context, SDLC-local scans, or an MCP-shaped side surface.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)` and `admitGtlProgramConformanceInput(...)`; the CLI
continues to call that function. Downstream products supply program inventory
and feature disposition rows, but ABG owns the T-153 feature list, requirement
trace defaults, admission issues, observed-inventory contradictions, and report
identity binding.

## Implementation Update - 2026-06-08 T-153 Feature Coverage

Updated `gtl_program_conformance.ts`:

- Added `GtlProgramFeatureCoverageManifest` with one row per
  `REQ-L-GTL3-CONTRACT-LAW-API` capability family.
- Added ABG-owned `GTL_PROGRAM_T153_FEATURE_KINDS` and default requirement
  refs for graph structure, graph algebra, operators, evaluators, rules,
  `F_*` composition, hooks, target carriers, edge closure, prompt assets,
  selection/refinement/synthesis/sub-work, module/public start, job, role,
  external tool gates, and active source identity.
- Raw-input admission now rejects missing/malformed feature manifests through
  deterministic issue rows.
- `typecheckGtlProgram(...)` now rejects absent feature rows, duplicate feature
  rows, missing required requirement refs, `present` rows without evidence,
  `not_used` rows without reasons, deterministically observed `not_used` rows
  contradicted by supplied inventory, and deterministic `present` rows with no
  matching inventory.
- The conformance report now carries the admitted feature manifest and binds
  `inventoryDigests.featureCoverageManifest` into `inventoryDigest` and
  `reportRef`.
- The public contract index exports the feature manifest types and the ABG-owned
  feature-kind constant.

## Implementation Update - 2026-06-09 Design-Method And Proxy Observation Fix

Updated `gtl_program_conformance.ts`:

- Added `GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS` as the ABG-owned owner
  map for T-153 feature rows.
- Feature manifest admission now rejects caller-spoofed `ownerClassification`
  values that do not match the ABG-owned map.
- Removed proxy observation of `hook_boundaries` from target-carrier rows.
- Removed proxy observation of `f_star_compute_composition` from plugin rows.
- Restricted present-without-inventory and not-used-contradiction checks to
  feature families with first-class deterministic observation in this slice.
- Collapsed duplicate expected/report coverage count shapes into one
  `GtlProgramCoverageCounts` carrier with stable public aliases.

Added design-method boundary assets:

- `M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md`
- `M03_GTL_PROGRAM_CONFORMANCE_GATE_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03-engine-kernel.yml` now names the GTL program conformance surface,
  programmatic interfaces, invariant, and test obligation.

Added regression coverage:

- `T-152 GTL program typechecker rejects caller-spoofed feature owner truth`
- `T-152 GTL program typechecker does not infer hooks or F-star composition from unrelated rows`
- `T-152 GTL program typechecker leaves same_object as manifest-only until a first-class carrier exists`

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker requires a complete T-153 feature manifest`
- `T-152 GTL program typechecker rejects contradictory T-153 feature disposition`
- `T-152 GTL program typechecker rejects claimed T-153 features without inventory`
- `T-152 GTL program typechecker rejects duplicate T-153 feature rows`
- `T-152 GTL program typechecker observes GTL algebra operation carriers`
- `T-152 GTL program typechecker rejects duplicate edge-closure truth for one vector identity`
- Extended report identity proof so changing a feature disposition changes
  `inventoryDigests.featureCoverageManifest` and `reportRef`.

Current non-closure: this is the feature-coverage and deterministic-inventory
admission slice. Operation-specific semantic typechecking for `compose`,
`substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, complete
operator/evaluator/rule field law, hook-precedence derivation, job/role binding
law, and external tool-gate semantics remains open in this ticket until a
normalized GTL algebra/declaration carrier is admitted or the existing carriers
are expanded enough to reconstruct those declarations without caller-owned
truth.

Narrow algebra observation now exists: the gate detects current GTL constructor
signatures for `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`,
`promote`, and `identity`, then rejects a `not_used` feature disposition when
those carrier signatures are present. This is not yet full semantic
typechecking of every algebra operation and `same_object` remains manifest-only.

Release/consumer note: this manifest gate is now part of the `4.0.0-rc.4`
source cut and still requires an immutable release snapshot plus downstream
consumer re-pin before a production graph inventory can prove through the
strengthened gate.

Proof:

- `npm run build:semantic` passed on 2026-06-08 after the feature-coverage
  update.
- `npm run test:t150` passed 30/30 on 2026-06-08 after the feature-coverage
  update.
- `npm run lint:semantic` passed on 2026-06-08 after the feature-coverage
  update.
- `npm run test:semantic` passed 751/751 on 2026-06-08 after the
  feature-coverage update.
- `npm run test:t150` passed 33/33 on 2026-06-09 after the owner-map,
  proxy-observation, and Design Module Method boundary asset update.
- `npm run lint:semantic` passed on 2026-06-09 after the owner-map and
  proxy-observation update.
- `npm run test:semantic` passed 754/754 on 2026-06-09 after the owner-map,
  proxy-observation, and Design Module Method boundary asset update.
- `git diff --check` passed on 2026-06-09 after the same update.

## Implementation Update - 2026-06-09 First-Class T-153 Inventory Rows

Updated `gtl_program_conformance.ts`:

- Added admitted row families for `same_object`, operator declarations,
  evaluator declarations, rule declarations, `F_*` compute composition, hook
  boundaries, selection/refinement/synthesis/sub-work, job bindings, role
  bindings, and external tool gates.
- Extended raw-input admission so malformed rows in every new family become
  deterministic typed issue rows rather than runtime exceptions.
- Extended normalized inventory digests so every new row family participates in
  `inventoryDigest` and `reportRef`.
- Split deterministic observation from first-class inventory backing. Existing
  GTL carrier truth can still reject false `not_used` claims, while a `present`
  feature now requires its corresponding first-class inventory rows instead of
  passing from unrelated proxy rows.
- Kept the CLI wrapper thin over `typecheckGtlProgram(...)`; the programmatic
  function remains the single rule surface.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker requires first-class inventory for graph_algebra_same_object`
- `T-152 GTL program typechecker requires first-class inventory for operator_declarations`
- `T-152 GTL program typechecker requires first-class inventory for evaluator_declarations`
- `T-152 GTL program typechecker requires first-class inventory for rule_declarations`
- `T-152 GTL program typechecker requires first-class inventory for f_star_compute_composition`
- `T-152 GTL program typechecker requires first-class inventory for hook_boundaries`
- `T-152 GTL program typechecker requires first-class inventory for selection_refinement_synthesis_subwork`
- `T-152 GTL program typechecker requires first-class inventory for job_binding`
- `T-152 GTL program typechecker requires first-class inventory for role_binding`
- `T-152 GTL program typechecker requires first-class inventory for external_tool_gates`
- `T-152 GTL program typechecker rejects malformed first-class T-153 inventory rows`

Current non-closure:

- A downstream consumer must consume the strengthened ABG function from a
  released package and supply production graph/prompt/plugin/overlay/start/
  target-carrier inventory rows.
- A clean downstream live lane must pass against that released package.

Proof:

- `npm run build:semantic` passed on 2026-06-09 after the first-class T-153 row
  update.
- `npm run lint:semantic` passed on 2026-06-09 after the first-class T-153 row
  update.
- `npm run test:t150` passed 44/44 on 2026-06-09 after the first-class T-153
  row update.
- `npm run test:semantic` passed 765/765 on 2026-06-09 after the first-class
  T-153 row update.
- `git diff --check` passed on 2026-06-09 after the first-class T-153 row
  update.

## Bug Triage - 2026-06-11 Stage Compute Composition Contract Chain

Finding: the current `typecheckGtlProgram(...)` supports a first-class
`computeCompositions` row family, but it is not yet the full GTL/ABG
composition contract the product now requires. The row currently admits
`compositionRef`, digest, host, declaration source, `notationRefs`,
`regimeBindingRefs`, `stageBindingRefs`, `closureContractRef`, and evidence.
It validates that notation strings include `fn<`, `transform.C`, `evaluate.C`,
and `consequence.C`, that stage-binding strings contain transform/evaluate/
consequence names, and that regime refs are non-empty.

That is not enough to prove the intended law:

- `transform.C`, `evaluate.C`, and `consequence.C` are not yet admitted stage
  contracts with typed `F_D`/`F_P`/`F_H` participation or explicit
  `not_used` / external-callout dispositions.
- `EnginePluginContract` rows are admitted and authority-denied, but the
  conformance gate does not yet require those plugin rows to resolve through a
  selected `abg.fn_composition` stage binding.
- Stage purpose, compute means, input carrier refs, output carrier refs,
  evidence refs, and authority-denial flags exist in ABG plugin/stage carrier
  shapes, but the GTL program conformance input does not yet make them the
  sole source of compute-composition truth for downstream programs.

STDO triage: `design_reframe` within this active T-152
`requirement_reprice`, followed by `realization_refactor` in
`gtl_program_conformance.ts`. The requirement already exists in
`REQ-L-GTL3-CONTRACT-LAW-API-005`, `-007`, `-010`, and `-012`; the missing
layer is the ABG-owned admitted carrier surface that ties compute notation,
stage composition, hook/plugin rows, and authority denial into one typechecked
chain.

F_D/F_P classification: F_D. This is not prompt context. It is a static
program-admission failure: a downstream program that supplies plugins or
compute-stage declarations must fail closed unless the GTL program inventory
contains the selected composition contract and stage bindings.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)` and `admitGtlProgramConformanceInput(...)`. The CLI
stays a wrapper. Downstream products may supply inventory rows, but ABG owns
the admitted compute-composition contract law and must not infer it from
plugin counts, prompt prose, SDLC wrappers, or local scan rules.

Required work:

- Add or admit a normalized stage-composition carrier for `transform.C`,
  `evaluate.C`, `consequence.C`, and external `human_callout` boundaries.
- Require each stage row to bind to one selected `compositionRef` and declare
  `F_D`, `F_P`, and `F_H` participation or explicit non-use with reason refs.
- Require stage rows to carry compute means, stage purpose, input carrier refs,
  output carrier refs, evidence refs, predecessor refs where applicable, and
  authority-denial flags.
- Require plugin contracts and hook-boundary plugin refs to resolve to admitted
  stage rows; a plugin contract without a selected composition/stage binding
  must fail.
- Require the feature manifest's `f_star_compute_composition: present`
  disposition to be backed by the normalized stage-composition rows, not only
  by coarse `computeCompositions` rows.
- Bind normalized composition/stage/plugin inventories into
  `inventoryDigests` and `reportRef`.
- Add negative tests for missing transform/evaluate/consequence stage rows,
  missing `F_D`/`F_P`/`F_H` disposition, plugin-without-composition,
  hook-boundary plugin ref without a stage binding, and downstream-local
  wrapper composition law.
- Add a downstream-shaped fixture that proves a GTL/ABG product cannot pass
  the gate with SDLC-local plugin composition truth and does pass after
  supplying the admitted composition/stage inventory.

Non-closure:

- `typecheckGtlProgram(...)` passes `f_star_compute_composition: present` with
  only non-empty `regimeBindingRefs` and string-matched `stageBindingRefs`.
- `pluginContracts` or `hookBoundaries.pluginContractRefs` pass without a
  selected stage-composition binding.
- A downstream product can preserve `transform.C`/`evaluate.C`/`consequence.C`
  composition law in local wrappers, prompts, or CLI control flow instead of
  supplying GTL/ABG-admitted composition inventory.

## Implementation Update - 2026-06-11 Stage/Runtime Binding Gate

Updated `gtl_program_conformance.ts`:

- Added first-class `computeStageBindings` rows for `transform.C`,
  `evaluate.C`, `consequence.C`, and `human_callout` stage contracts.
- Each stage row now binds to a selected `compositionRef`, preserves the
  selected composition digest, names stage role, notation, purpose, compute
  means, input/output carriers, predecessor stage refs, plugin refs, hook refs,
  evidence refs, and typed `F_D`/`F_P`/`F_H` dispositions.
- Stage rows reject local engine authority flags:
  `mayWriteLedgers`, `mayEmitRuntimeEvents`, `maySelectTraversal`,
  `mayCloseTraversal`, and `mayOwnIterationLoop` must all be false.
- `computeCompositions.stageBindingRefs` must resolve to supplied stage rows,
  and every composition must supply `transform`, `evaluate`, and `consequence`
  stage rows.
- Supplied plugin contract refs must resolve through admitted stage rows; hook
  plugin refs must also resolve through those same stage rows.
- Added first-class `runtimeBindings` rows for public ABG runtime binding
  surfaces. Supplied plugin contracts must be consumed by an ABG runtime binding
  row, and the row must assert `consumesPluginsThroughAbg: true` and
  `forbidsProductLocalIteration: true`.
- `f_star_compute_composition: present` now requires both composition rows and
  stage rows. `public_start_binding: present` now requires public-start rows and
  runtime-binding rows.
- Report identity now includes `computeStageBindings` and `runtimeBindings`
  inventory digests.

Added regression coverage:

- `T-152 GTL program typechecker requires selected transform/evaluate/consequence stage rows`
- `T-152 GTL program typechecker rejects plugin contracts without stage and ABG runtime binding`
- `T-152 GTL program typechecker rejects product-local wrapper runtime binding claims`
- Extended malformed-row coverage for stage rows and runtime binding rows.

M04 public command/control fix:

- `publicCallableStartAsync(...)` and async control-loop APIs now carry
  `EngineRunnerPluginSet` through public ABG command/control.
- The TypeScript CLI runtime binding loader accepts a `plugins` provider and
  passes it into `publicCallableStartAsync(...)`.
- This closes the ABG-side defect where a downstream product could only prove
  plugin execution by calling runner internals directly.

Proof:

- `npm run test:t150` passed 47/47 on 2026-06-11 after the stage/runtime
  binding update.
- `npm run test:b030` passed 11/11 on 2026-06-11 after public callable plugin
  flow was added.
- `npm run test:t057` passed 9/9 on 2026-06-11, including
  `runtime binding plugins execute through ABG CLI command/control`.
- `npm run test:t013` passed 10/10 on 2026-06-11 after control-loop plugin
  carry-through.

Current non-closure:

- A downstream consumer still must publish a production runtime binding that
  supplies the GTL module, public start target, plugin contracts, stage rows,
  runtime binding row, and plugin providers to ABG command/control.
- A clean downstream live lane must run through ABG command/control rather than
  a product-local CLI loop.

## Implementation Update - 2026-06-11 M03 Assurance Retry Ownership

Downstream live proof exposed an ABG runtime ownership gap after command/control
was wired correctly: an accepted F_P artifact whose admitted assurance fold
returned `retry` was being projected as a terminal `yielded` outcome. That let a
downstream product-local loop hide the missing ABG-owned same-edge iteration.

Updated `engine_runner.ts`:

- Assurance closure decisions with `decision: "retry"` now derive a runtime
  continuation-transition projection and route `retry_same_edge` inside M03.
- The runner emits the blocked vector evaluation, ABG-owned retry-repair events,
  and retry progress, then redispatches the same graph vector through the normal
  runner loop instead of yielding to an outer product controller.
- Bounded exhaustion remains an ABG terminal stop (`gap_stop`) and
  `qualified_defer` remains a yielded terminal outcome.

Added regression coverage:

- `T-084 engine runner: assurance retry over an accepted artifact redispatches inside ABG`
- Updated the T-144 close-disposition regression so `no_close` proves bounded
  ABG retry exhaustion and `human_required` proves yielded deferral.

Proof:

- Focused ABG pack passed 34/34 on 2026-06-11 for `test_t084`,
  `test_t093`, `test_t148`, and `test_t149`.
- `test_t144_abg_probabilistic_monad_plugin_boundary` passed 14/14 after the
  terminal taxonomy assertion was updated.
- `npm run test:semantic` passed 782/782 and `npm run lint:semantic` passed on
  2026-06-11 before the `4.0.0-rc.15` release-basis commit.

## Extension Triage - 2026-06-12 Runtime Re-Entry From Repair-Surface Triage

Finding: downstream live proof now exposes the next ABG-owned routing gap. A
current edge can emit a typed repair-surface triage row that says the lawful
repair surface is not the current vector. The row may classify pressure as:

- `current_edge_repair`
- `upstream_reentry`
- `downstream_deferred`
- `external_blocked`

When the classification is `upstream_reentry`, the carrier must name:

- `repairGraphFunctionRef`
- `repairGraphVectorRef`
- `reentryTargetVectorIndex` or equivalent absolute graph-vector identity
- `repairAssetRef`

That is not downstream product control flow. It is admitted observation truth
that ABG must consume through construction observation, construction intent
admission, graph-span re-entry, and runtime transition. The product may emit the
typed triage evidence; ABG owns cursor movement.

Relative phrases such as "go back two nodes" are read-model shorthand only. They
are not dispatch authority. Runtime truth must resolve to an absolute
`GraphReentryPoint`, target graph function/vector identity, and target vector
index before ABG can admit or apply re-entry.

Zoom-in/zoom-out adjacency may explain how a product derived the repair span or
made two work nodes locally adjacent for evaluation. It is evidence or
derivation context, not a new dispatch operator. The prime runtime operator
remains graph-vector re-entry over absolute graph function, vector, re-entry
point, and target-vector identity.

STDO triage: `realization_refactor` inside active T-152 `requirement_reprice`.
The governing requirements already exist:

- `REQ-R-ABG3-ITERATION-009`: redispatch targets reuse `GraphReentryPoint` and
  target-vector identity.
- `REQ-R-ABG3-FPC-004B`: observation-to-action binding maps gap/retry/reentry
  pressure rows to lawful action catalog rows before construction evaluator
  ranking.
- `REQ-R-ABG3-FPC-005`: construction intent candidates bind graph function or
  re-entry target, input asset refs, expected output asset refs, gap/progress
  refs, value, lawful basis, and stop/escalation conditions.
- `REQ-R-ABG3-FPC-014`: construction may select same-edge repair,
  graph-span reentry, earlier/later graph-function invocation, F_H gate,
  ticket creation, or constitutional reprice only through admitted construction
  intent and existing reentry/change-class law.

The missing behavior is not a new downstream SDLC runner. It is ABG dispatch:

```text
repair-surface triage
-> construction observation
-> observation-to-action binding
-> admitted ConstructionIntentCandidate
-> selectedActionKind = reenter_graph_span
-> GraphReentryFrontierProjection
-> GraphReentryPoint + reentryTargetVectorIndex
-> engine transition reenter_graph_vector
```

F_D/F_P classification: mixed ABG runtime/projection realization. The triage
carrier is deterministic admission truth once emitted; the construction
evaluator may rank among lawful actions, but ABG must admit the candidate and
apply only existing re-entry targets. Hidden product-local loops and same-edge
retry fallback are not lawful substitutes.

Prime law confirmation: downstream products may publish repair-surface triage
as payload/evidence, but they must not own graph cursor movement. ABG consumes
the triage into construction action selection and applies re-entry through the
existing graph-span/re-entry substrate.

Required implementation scope:

- Extend the T-152 conformance inventory with runtime re-entry rows sufficient
  to prove the program publishes the re-entry surfaces it expects ABG to use.
- Bind `upstream_reentry` repair-surface triage into construction observation
  pressure, not same-edge retry pressure.
- Teach observation-to-action binding to match a triage row's
  `repairGraphFunctionRef`, `repairGraphVectorRef`, `reentryTargetVectorIndex`,
  and `repairAssetRef` to a lawful graph/action catalog row.
- Admit the selected action as a `ConstructionIntentCandidate` with
  `selectedActionKind = reenter_graph_span` and target re-entry refs.
- Project or consume a `GraphReentryFrontierProjection` using existing
  `GraphReentryPoint` plus `reentryTargetVectorIndex`.
- Apply `reenter_graph_vector` in the engine before default same-edge retry
  fallback.
- Preserve replay-visible transition/progress truth so public projection shows
  yielded/re-entering progress, blocked, or stalled state without product-local
  controller logic.

Proof requirements:

- Static gate proof complete: `typecheckGtlProgram(...)` now admits
  `runtimeReentryRoutes` with `GraphReentryPoint`,
  `reentryTargetVectorIndex`, selected `reenter_graph_span`, absolute
  graph/vector identity, repair asset ref, observation binding ref, and lawful
  basis refs in report identity.
- Static negative proof complete: a relative offset such as `-2` with no
  absolute target vector identity fails closed and cannot become dispatch truth.
- Static negative proof complete: missing or unbound absolute target vector refs
  fail closed at the GTL program conformance gate.
- Runtime unit proof complete: `constructConstructionRepairSurfaceTriageRow(...)`
  adds deterministic repair-surface triage to construction observation;
  `deriveObservationToActionBindingProjection(...)` binds `upstream_reentry`
  only to a lawful `reenter_graph_span` action with matching graph function,
  graph vector, repair asset, target outcome, `GraphReentryPoint`, and
  `reentryTargetVectorIndex`; `admitConstructionIntentCandidate(...)` rejects
  evaluator candidates whose `targetReentryRef` contradicts the binding row.
- Runtime negative proof complete: the same triage with missing or unbound
  graph/vector refs fails closed with no observation-to-action binding, no
  priority row, rejected construction intent, and no same-edge fallback.
- Construction projection unit proof complete: the admitted re-entry intent
  projects `construction_progressing_yield` and the selected
  `reenter_graph_span` action ref without downstream product loop state.
- Runner proof complete: an active construction episode applies graph-vector
  re-entry before default same-edge retry. The focused sandbox starts from a
  fully replayed three-vector graph, admits `reenter_graph_span` for the
  code-generation vector, shadows the prior code-vector closure, and runs only
  the selected `design->code` vector through the graph engine.
- Replay-visible transition proof complete: the runner emits
  `graph_reentry_planned` and `graph_reentry_applied` before engine iteration,
  includes `graph_reentry_applied` in graph replay, and records the transition
  in the construction delta through `runtimeEventRefs` and `reentryMoved`.
  When the re-entered graph closes in the same step, the final public
  construction projection is `construction_closed`; the replay-visible movement
  remains preserved in the delta and graph event stream.
- Downstream-shaped proof complete: the generic code-generation fixture routes
  missing nonlocal tranche pressure to another graph node without naming
  `odd_sdlc`, `data_mapper`, Scala, SBT, or any downstream module.

Validation on 2026-06-12:

- `npm run test:t127:unit` passed 29/29, including the T-152 runtime positive,
  mismatched `targetReentryRef`, and unbound-vector no-fallback cases.
- `npm run test:t128` passed 3/3, including the T-152 construction-runner
  replay sandbox that re-enters the code-generation vector after all prior
  vectors already exist in replay.
- `npm run test:t150` passed 49/49, including static runtime re-entry route
  admission and negative proofs.
- `npm run test:t139` passed 2/2.
- `npm run test:t149` passed 17/17.
- `npm run test:t103` passed 24/24.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed 787/787.
- `git diff --check` passed.

Current non-closure:

- A downstream consumer must still consume the strengthened ABG function from a
  released package and supply production graph/prompt/plugin/overlay/start/
  target-carrier/source-identity inventory rows.
- A clean downstream live lane must still pass against that released ABG
  package and ABG command/control path.
- A production downstream inventory proof must still show that no local
  product-specific conformance or retry/re-entry loop substitutes for the ABG
  gate and construction runner.

Regression guards:

- `GraphChangeClass` or product disposition strings must not become a parallel
  dispatch discriminator instead of reusing `GraphReentryPoint` and
  target-vector identity.
- A relative cursor offset must not be admitted as re-entry authority without
  resolving to an absolute `GraphReentryPoint` and target vector identity.
- Proof must stay on generic graph/action/repair-surface/re-entry carriers
  rather than downstream product vocabulary.
